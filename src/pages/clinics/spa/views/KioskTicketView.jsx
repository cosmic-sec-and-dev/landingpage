import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Tag,
  Space,
  Select,
  message,
  Divider
} from 'antd';
import {
  IdcardOutlined,
  HeartOutlined,
  ExperimentOutlined,
  AlertOutlined,
  PrinterOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';
import { TICKET_PRIORITY_CONFIG } from '../schemaConfig';

const { Title, Text, Paragraph } = Typography;

export const KioskTicketView = ({
  rooms = [],
  users = [],
  existingTickets = [],
  onTicketIssued
}) => {
  const { isDark } = useAppTheme();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(null);
  const [issuedTicketModal, setIssuedTicketModal] = useState(null);

  // Find default reception room
  const receptionRoom = rooms.find(r => r.room_type === 'reception_counter') || rooms[0] || null;

  const generateTicketNumber = (category) => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayTickets = (existingTickets || []).filter(t => {
      const tDate = t.issued_at ? dayjs(t.issued_at).format('YYYY-MM-DD') : t.issue_date;
      return tDate === today && t.priority_category === category;
    });

    const prefix = TICKET_PRIORITY_CONFIG[category]?.prefix || 'T';
    let baseNumber = 100;
    if (category === 'normal') baseNumber = 100;
    else if (category === 'preferential') baseNumber = 500;
    else if (category === 'exam_pickup') baseNumber = 900;
    else if (category === 'urgent') baseNumber = 1;

    const nextSeq = baseNumber + todayTickets.length + 1;
    return `${prefix}-${nextSeq}`;
  };

  const handleIssueTicket = async (category, serviceType = 'reception_checkin') => {
    setLoadingCategory(category);
    try {
      const ticketNumber = generateTicketNumber(category);
      const nowIso = new Date().toISOString();

      const ticketPayload = {
        ticket_number: ticketNumber,
        priority_category: category,
        service_type: serviceType,
        patient_user_id: selectedUser || null,
        status: 'waiting',
        current_room_id: receptionRoom ? receptionRoom.id : null,
        issued_at: nowIso
      };

      const resTicket = await apiRequest('/clinic_queue_tickets', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(ticketPayload)
      });

      if (!resTicket.ok) {
        throw new Error(resTicket.data?.message || 'Falha ao emitir senha');
      }

      const createdTicket = Array.isArray(resTicket.data) ? resTicket.data[0] : resTicket.data;

      // Register initial append-only routing transition
      if (createdTicket && createdTicket.id && receptionRoom) {
        await apiRequest('/clinic_ticket_routings', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            ticket_id: createdTicket.id,
            from_room_id: null,
            to_room_id: receptionRoom.id,
            action_type: 'ticket_issued',
            step_sequence: 1,
            notes: 'Senha emitida no totem de autoatendimento'
          })
        });
      }

      setIssuedTicketModal({
        ...createdTicket,
        ticket_number: ticketNumber,
        priority_category: category
      });

      message.success(`Senha ${ticketNumber} emitida com sucesso!`);
      if (onTicketIssued) onTicketIssued();
    } catch (err) {
      message.error(err.message || 'Erro ao gerar senha');
    } finally {
      setLoadingCategory(null);
    }
  };

  const ticketCategories = [
    {
      key: 'normal',
      title: 'Atendimento Geral',
      subtitle: 'Consultas médicas, abertura de cadastro e informações',
      codeRange: 'Faixa N-100 a N-499',
      icon: <IdcardOutlined style={{ fontSize: 44, color: '#3b82f6' }} />,
      color: '#3b82f6',
      bgGrad: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
      borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
      key: 'preferential',
      title: 'Atendimento Preferencial',
      subtitle: 'Idosos 60+, gestantes, lactantes, pessoas com deficiência e autismo (Lei 10.048)',
      codeRange: 'Faixa P-500 a P-899',
      icon: <HeartOutlined style={{ fontSize: 44, color: '#f59e0b' }} />,
      color: '#f59e0b',
      bgGrad: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    {
      key: 'exam_pickup',
      title: 'Exames & Laudos',
      subtitle: 'Retirada de resultados laboratoriais, biópsias e raio-x',
      codeRange: 'Faixa E-900 a E-999',
      icon: <ExperimentOutlined style={{ fontSize: 44, color: '#10b981' }} />,
      color: '#10b981',
      bgGrad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.3)'
    },
    {
      key: 'urgent',
      title: 'Triagem Imediata / Dor Aguda',
      subtitle: 'Classificação de risco, mal-estar súbito e dor moderada/alta',
      codeRange: 'Faixa U-001 a U-099',
      icon: <AlertOutlined style={{ fontSize: 44, color: '#ef4444' }} />,
      color: '#ef4444',
      bgGrad: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
      borderColor: 'rgba(239, 68, 68, 0.3)'
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 0' }}>
      {/* Banner Superior do Totem */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 20,
          background: isDark
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
          border: isDark ? '1px solid #334155' : '1px solid #bae6fd',
          marginBottom: 24,
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
        }}
        styles={{ body: { padding: '28px 24px' } }}
      >
        <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
          🏥 Totem de Autoatendimento & Emissão de Senhas
        </Title>
        <Paragraph style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: 16, margin: '8px auto 16px', maxWidth: 650 }}>
          Toque na opção desejada abaixo para retirar seu comprovante de fila. Aguarde a chamada da sua senha no painel da sala de espera.
        </Paragraph>

        <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'left' }}>
          <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: 6 }}>
            <UserOutlined style={{ marginRight: 6 }} />
            Identificação do Paciente (Opcional - selecione se cadastrado):
          </Text>
          <Select
            showSearch
            allowClear
            placeholder="Buscar por nome, e-mail ou CPF..."
            style={{ width: '100%' }}
            value={selectedUser}
            onChange={setSelectedUser}
            optionFilterProp="label"
            options={users.map(u => ({
              value: u.id,
              label: `${u.full_name || u.email} ${u.phone_number ? `(${u.phone_number})` : ''}`
            }))}
          />
        </div>
      </Card>

      {/* Grid de Botões de Toque das Categorias */}
      <Row gutter={[20, 20]}>
        {ticketCategories.map(cat => (
          <Col xs={24} sm={12} key={cat.key}>
            <Card
              hoverable
              onClick={() => handleIssueTicket(cat.key)}
              style={{
                borderRadius: 18,
                background: cat.bgGrad,
                border: `2px solid ${cat.borderColor}`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.04)'
              }}
              styles={{ body: { padding: '24px 20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  padding: 14,
                  borderRadius: 16,
                  background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cat.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Title level={4} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}>
                      {cat.title}
                    </Title>
                    <Tag color={cat.color} style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}>
                      {cat.codeRange}
                    </Tag>
                  </div>

                  <Paragraph style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 13, marginBottom: 12 }}>
                    {cat.subtitle}
                  </Paragraph>

                  <Button
                    type="primary"
                    size="large"
                    loading={loadingCategory === cat.key}
                    style={{
                      borderRadius: 10,
                      fontWeight: 700,
                      background: cat.color,
                      borderColor: cat.color,
                      boxShadow: `0 4px 12px ${cat.color}40`
                    }}
                  >
                    Emitir Senha {TICKET_PRIORITY_CONFIG[cat.key]?.prefix}
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal / Comprovante de Senha Emitida */}
      <Modal
        open={!!issuedTicketModal}
        onCancel={() => setIssuedTicketModal(null)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            Imprimir Comprovante
          </Button>,
          <Button key="ok" type="primary" onClick={() => setIssuedTicketModal(null)}>
            Concluir & Liberar Totem
          </Button>
        ]}
        width={420}
        centered
        destroyOnHidden
      >
        {issuedTicketModal && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <CheckCircleFilled style={{ fontSize: 52, color: '#10b981', marginBottom: 12 }} />
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              Senha Emitida!
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Retire seu comprovante e aguarde ser chamado no painel.
            </Text>

            {/* Simulação do Voucher Térmico */}
            <div style={{
              marginTop: 20,
              padding: '24px 16px',
              borderRadius: 12,
              background: isDark ? '#0f172a' : '#f8fafc',
              border: isDark ? '2px dashed #334155' : '2px dashed #cbd5e1',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b' }}>
                SELENE HEALTHCARE CLINIC
              </Text>
              <div style={{
                fontSize: 56,
                fontWeight: 900,
                color: TICKET_PRIORITY_CONFIG[issuedTicketModal.priority_category]?.color || '#0284c7',
                letterSpacing: 2,
                margin: '12px 0 6px'
              }}>
                {issuedTicketModal.ticket_number}
              </div>

              <Tag color={TICKET_PRIORITY_CONFIG[issuedTicketModal.priority_category]?.color} style={{ fontSize: 13, padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                {TICKET_PRIORITY_CONFIG[issuedTicketModal.priority_category]?.label}
              </Tag>

              <Divider style={{ margin: '16px 0' }} />

              <Space orientation="vertical" size={4} style={{ width: '100%', textAlign: 'left', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Data de Emissão:</Text>
                  <Text strong>{dayjs(issuedTicketModal.issued_at).format('DD/MM/YYYY HH:mm:ss')}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Destino Inicial:</Text>
                  <Text strong>{receptionRoom?.name || 'Recepção Geral'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Rastreamento:</Text>
                  <Text code>{issuedTicketModal.id?.substring(0, 13)}...</Text>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default KioskTicketView;
