import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Select,
  Space,
  Typography,
  Modal,
  Input,
  message,
  Popconfirm,
  Badge,
  Timeline
} from 'antd';
import {
  PhoneOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  HistoryOutlined,
  UserOutlined,
  CompassOutlined,
  ForwardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';
import { TICKET_PRIORITY_CONFIG, TICKET_STATUS_CONFIG } from '../schemaConfig';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const ReceptionDeskView = ({
  tickets = [],
  routings = [],
  rooms = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();

  // Reception or triage rooms
  const receptionRooms = rooms.filter(r => r.room_type === 'reception_counter' || r.room_type === 'triage_station');
  const [activeRoomId, setActiveRoomId] = useState(receptionRooms[0]?.id || rooms[0]?.id || null);

  // Modals
  const [forwardModalTicket, setForwardModalTicket] = useState(null);
  const [targetRoomId, setTargetRoomId] = useState(null);
  const [forwardActionType, setForwardActionType] = useState('triage_forward');
  const [forwardNotes, setForwardNotes] = useState('');
  const [forwardLoading, setForwardLoading] = useState(false);

  // History Drawer/Modal
  const [selectedTicketHistory, setSelectedTicketHistory] = useState(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // Filter tickets for waiting and in-service
  const waitingTickets = tickets
    .filter(t => t.status === 'waiting' || t.status === 'called')
    .sort((a, b) => {
      // Prioritize urgent > preferential > normal/exam
      const weight = (p) => (p === 'urgent' ? 3 : p === 'preferential' ? 2 : 1);
      const wDiff = weight(b.priority_category) - weight(a.priority_category);
      if (wDiff !== 0) return wDiff;
      return (a.issued_at || '').localeCompare(b.issued_at || '');
    });

  const activeTickets = tickets.filter(t => t.status === 'in_service' || (t.status === 'called' && t.current_room_id === activeRoomId));

  // Call Next Ticket
  const handleCallNextTicket = async () => {
    if (!activeRoomId) {
      message.warning('Selecione primeiro o seu posto / guichê de atendimento');
      return;
    }
    const nextInLine = waitingTickets.find(t => t.status === 'waiting');
    if (!nextInLine) {
      message.info('Não há senhas aguardando na fila no momento');
      return;
    }

    try {
      // 1. Update ticket status to 'called'
      const resTicket = await apiRequest(`/clinic_queue_tickets?id=eq.${nextInLine.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          status: 'called',
          called_at: new Date().toISOString(),
          current_room_id: activeRoomId
        })
      });

      if (!resTicket.ok) {
        throw new Error(resTicket.data?.message || 'Erro ao chamar senha');
      }

      // Count existing transitions to get next step sequence
      const prevSteps = routings.filter(r => r.ticket_id === nextInLine.id).length;

      // 2. Insert append-only routing transition
      await apiRequest('/clinic_ticket_routings', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ticket_id: nextInLine.id,
          from_room_id: nextInLine.current_room_id || null,
          to_room_id: activeRoomId,
          operator_user_id: currentUser?.id || null,
          action_type: 'counter_call',
          step_sequence: prevSteps + 1,
          notes: `Chamada realizada no ${activeRoom?.name || 'Guichê de Atendimento'}`
        })
      });

      message.success(`Senha ${nextInLine.ticket_number} chamada no ${activeRoom?.name || 'guichê'}!`);
      onRefresh();
    } catch (err) {
      message.error(err.message || 'Falha ao processar chamada');
    }
  };

  // Start Service
  const handleStartService = async (ticket) => {
    try {
      await apiRequest(`/clinic_queue_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'in_service',
          current_room_id: activeRoomId
        })
      });
      message.success(`Atendimento da senha ${ticket.ticket_number} iniciado`);
      onRefresh();
    } catch {
      message.error('Erro ao iniciar atendimento');
    }
  };

  // Mark No-Show
  const handleMarkNoShow = async (ticket) => {
    try {
      await apiRequest(`/clinic_queue_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'no_show' })
      });
      message.warning(`Senha ${ticket.ticket_number} marcada como ausente`);
      onRefresh();
    } catch {
      message.error('Erro ao atualizar status');
    }
  };

  // Complete Forwarding to another Room
  const handleExecuteForward = async () => {
    if (!targetRoomId) {
      message.warning('Selecione a sala de destino');
      return;
    }

    setForwardLoading(true);
    try {
      const prevSteps = routings.filter(r => r.ticket_id === forwardModalTicket.id).length;
      const targetRoom = rooms.find(r => r.id === targetRoomId);

      // 1. Insert append-only routing transition
      const routingRes = await apiRequest('/clinic_ticket_routings', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ticket_id: forwardModalTicket.id,
          from_room_id: activeRoomId,
          to_room_id: targetRoomId,
          operator_user_id: currentUser?.id || null,
          action_type: forwardActionType,
          step_sequence: prevSteps + 1,
          notes: forwardNotes || `Encaminhado para ${targetRoom?.name || 'novo posto'}`
        })
      });

      if (!routingRes.ok) {
        throw new Error(routingRes.data?.message || 'Falha ao registrar roteamento imutável');
      }

      // 2. Update ticket status to waiting for the target room
      await apiRequest(`/clinic_queue_tickets?id=eq.${forwardModalTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'waiting',
          current_room_id: targetRoomId
        })
      });

      message.success(`Paciente ${forwardModalTicket.ticket_number} encaminhado para ${targetRoom?.name}!`);
      setForwardModalTicket(null);
      setForwardNotes('');
      onRefresh();
    } catch (err) {
      message.error(err.message || 'Erro ao realizar transição de atendimento');
    } finally {
      setForwardLoading(false);
    }
  };

  // Complete Service directly
  const handleCompleteService = async (ticket) => {
    try {
      const prevSteps = routings.filter(r => r.ticket_id === ticket.id).length;

      // 1. Insert completed routing transition
      await apiRequest('/clinic_ticket_routings', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ticket_id: ticket.id,
          from_room_id: activeRoomId,
          to_room_id: activeRoomId,
          operator_user_id: currentUser?.id || null,
          action_type: 'completed',
          step_sequence: prevSteps + 1,
          notes: 'Atendimento e orientações finalizadas na recepção'
        })
      });

      // 2. Update ticket status to completed
      await apiRequest(`/clinic_queue_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      });

      message.success(`Atendimento da senha ${ticket.ticket_number} concluído com sucesso!`);
      onRefresh();
    } catch {
      message.error('Erro ao finalizar atendimento');
    }
  };

  const columns = [
    {
      title: 'Senha',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (val, record) => {
        const priority = TICKET_PRIORITY_CONFIG[record.priority_category];
        return (
          <Space orientation="vertical" size={2}>
            <span style={{ fontSize: 18, fontWeight: 800, color: priority?.color || '#0284c7', fontFamily: 'monospace' }}>
              {val}
            </span>
            <Tag color={priority?.color} style={{ fontSize: 11, borderRadius: 6, fontWeight: 600 }}>
              {priority?.label}
            </Tag>
          </Space>
        );
      }
    },
    {
      title: 'Paciente',
      dataIndex: 'patient_user_id',
      key: 'patient_user_id',
      render: (val) => {
        const user = users.find(u => u.id === val);
        return user ? (
          <div>
            <Text strong style={{ display: 'block' }}>{user.full_name || user.email}</Text>
            {user.phone_number && <Text type="secondary" style={{ fontSize: 12 }}>📱 {user.phone_number}</Text>}
          </div>
        ) : (
          <Text type="secondary">Não identificado</Text>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st) => {
        const cfg = TICKET_STATUS_CONFIG[st] || { label: st, color: 'default' };
        return <Tag color={cfg.color} style={{ borderRadius: 6, fontWeight: 700 }}>{cfg.label}</Tag>;
      }
    },
    {
      title: 'Emissão',
      dataIndex: 'issued_at',
      key: 'issued_at',
      render: (val) => val ? dayjs(val).format('HH:mm:ss') : '-'
    },
    {
      title: 'Posto Atual',
      dataIndex: 'current_room_id',
      key: 'current_room_id',
      render: (rid) => {
        const rm = rooms.find(r => r.id === rid);
        return rm ? <Tag color="blue">{rm.name}</Tag> : <Text type="secondary">Triagem Inicial</Text>;
      }
    },
    {
      title: 'Ações Operacionais',
      key: 'actions',
      render: (_, record) => {
        const isCurrentCalled = record.status === 'called' && record.current_room_id === activeRoomId;
        const isCurrentInService = record.status === 'in_service' && record.current_room_id === activeRoomId;

        return (
          <Space wrap>
            {record.status === 'waiting' && (
              <Button
                type="primary"
                size="small"
                icon={<PhoneOutlined />}
                onClick={async () => {
                  try {
                    await apiRequest(`/clinic_queue_tickets?id=eq.${record.id}`, {
                      method: 'PATCH',
                      body: JSON.stringify({ status: 'called', current_room_id: activeRoomId, called_at: new Date().toISOString() })
                    });
                    const prevSteps = routings.filter(r => r.ticket_id === record.id).length;
                    await apiRequest('/clinic_ticket_routings', {
                      method: 'POST',
                      body: JSON.stringify({
                        ticket_id: record.id,
                        from_room_id: record.current_room_id,
                        to_room_id: activeRoomId,
                        operator_user_id: currentUser?.id,
                        action_type: 'counter_call',
                        step_sequence: prevSteps + 1,
                        notes: `Chamado especificamente no ${activeRoom?.name}`
                      })
                    });
                    message.success(`Senha ${record.ticket_number} chamada`);
                    onRefresh();
                  } catch {
                    message.error('Erro ao chamar');
                  }
                }}
              >
                Chamar
              </Button>
            )}

            {isCurrentCalled && (
              <Button
                type="primary"
                size="small"
                style={{ background: '#10b981', borderColor: '#10b981' }}
                icon={<CheckCircleOutlined />}
                onClick={() => handleStartService(record)}
              >
                Atender
              </Button>
            )}

            {(isCurrentCalled || isCurrentInService) && (
              <>
                <Button
                  size="small"
                  icon={<ForwardOutlined />}
                  onClick={() => {
                    setForwardModalTicket(record);
                    setForwardActionType('triage_forward');
                    setTargetRoomId(rooms.find(r => r.room_type === 'triage_station')?.id || rooms[0]?.id);
                  }}
                >
                  Encaminhar
                </Button>

                <Popconfirm
                  title="Concluir atendimento desta senha?"
                  onConfirm={() => handleCompleteService(record)}
                >
                  <Button size="small" type="dashed" icon={<CheckCircleOutlined />}>
                    Finalizar
                  </Button>
                </Popconfirm>
              </>
            )}

            {record.status === 'called' && (
              <Popconfirm
                title="Marcar paciente como ausente?"
                onConfirm={() => handleMarkNoShow(record)}
              >
                <Button size="small" danger icon={<CloseCircleOutlined />}>
                  Ausente
                </Button>
              </Popconfirm>
            )}

            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => setSelectedTicketHistory(record)}
            >
              Trilha
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      {/* Station Selection and Action Header */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 18,
          background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 20
        }}
        styles={{ body: { padding: '18px 24px' } }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12}>
            <Space align="center" size={12}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 22
              }}>
                <CompassOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                  Posto de Atendimento Ativo:
                </Text>
                <Select
                  value={activeRoomId}
                  onChange={setActiveRoomId}
                  style={{ minWidth: 260 }}
                  options={rooms.map(r => ({
                    value: r.id,
                    label: `${r.name} (${r.room_type || 'Geral'})`
                  }))}
                />
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<PhoneOutlined />}
                onClick={handleCallNextTicket}
                style={{
                  borderRadius: 12,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                Chamar Próxima Senha ({waitingTickets.filter(t => t.status === 'waiting').length} na fila)
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Queue Table */}
      <Card
        variant="borderless"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserOutlined style={{ color: '#0284c7' }} />
            <span style={{ fontWeight: 700 }}>Fila de Espera & Atendimentos em Andamento</span>
            <Badge count={waitingTickets.length} style={{ backgroundColor: '#0284c7' }} />
          </div>
        }
        style={{
          borderRadius: 18,
          background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Table
          dataSource={waitingTickets}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal: Encaminhar para outro Posto (Triagem ou Consultório) */}
      <Modal
        open={!!forwardModalTicket}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ForwardOutlined style={{ color: '#0284c7' }} />
            <span>Encaminhar Senha {forwardModalTicket?.ticket_number} para Outro Posto</span>
          </div>
        }
        onCancel={() => setForwardModalTicket(null)}
        onOk={handleExecuteForward}
        confirmLoading={forwardLoading}
        okText="Confirmar Redirecionamento"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <div style={{ margin: '16px 0' }}>
          <div style={{ marginBottom: 14 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Tipo de Transição:</Text>
            <Select
              value={forwardActionType}
              onChange={setForwardActionType}
              style={{ width: '100%' }}
              options={[
                { value: 'triage_forward', label: '🩺 Encaminhar para Triagem / Avaliação Inicial' },
                { value: 'doctor_call', label: '👨‍⚕️ Encaminhar Direto para Consultório Médico' },
                { value: 'procedure_transfer', label: '💉 Transferir para Sala de Procedimentos / Exames' }
              ]}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Sala ou Posto de Destino:</Text>
            <Select
              value={targetRoomId}
              onChange={setTargetRoomId}
              style={{ width: '100%' }}
              options={rooms.map(r => ({
                value: r.id,
                label: `${r.name} (${r.room_type || 'Geral'})`
              }))}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Notas / Instruções de Encaminhamento:</Text>
            <TextArea
              rows={3}
              placeholder="Ex: Paciente relatou queixa de cefaleia súbita; priorizar aferição de pressão..."
              value={forwardNotes}
              onChange={e => setForwardNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Trilha Auditável Append-Only */}
      <Modal
        open={!!selectedTicketHistory}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined style={{ color: '#0284c7' }} />
            <span>Trilha Auditável Imutável • Senha {selectedTicketHistory?.ticket_number}</span>
          </div>
        }
        onCancel={() => setSelectedTicketHistory(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedTicketHistory(null)}>
            Fechar Trilha
          </Button>
        ]}
        width={560}
        destroyOnHidden
      >
        <div style={{ margin: '20px 0' }}>
          {selectedTicketHistory && (
            <Timeline
              items={routings
                .filter(r => r.ticket_id === selectedTicketHistory.id)
                .sort((a, b) => a.step_sequence - b.step_sequence)
                .map((step, idx) => {
                  const targetRm = rooms.find(rm => rm.id === step.to_room_id);
                  const op = users.find(u => u.id === step.operator_user_id);
                  return {
                    key: step.id || idx,
                    color: step.action_type === 'completed' ? 'green' : (step.action_type === 'ticket_issued' ? 'blue' : 'purple'),
                    children: (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: 14 }}>
                            {step.action_type === 'ticket_issued' && '🎟️ Emissão da Senha'}
                            {step.action_type === 'counter_call' && '📞 Chamada no Guichê'}
                            {step.action_type === 'triage_forward' && '🩺 Encaminhado para Triagem'}
                            {step.action_type === 'doctor_call' && '👨‍⚕️ Chamado no Consultório'}
                            {step.action_type === 'completed' && '✅ Atendimento Concluído'}
                          </Text>
                          <Tag color="default" style={{ fontSize: 11 }}>
                            {dayjs(step.routed_at).format('DD/MM/YYYY HH:mm:ss')}
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                          Destino: <strong>{targetRm?.name || 'Não especificado'}</strong>
                          {op && ` • Operador: ${op.full_name || op.email}`}
                        </Text>
                        {step.notes && (
                          <Paragraph italic style={{ fontSize: 12, margin: '4px 0 0', color: '#64748b' }}>
                            "{step.notes}"
                          </Paragraph>
                        )}
                      </div>
                    )
                  };
                })}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
export default ReceptionDeskView;
