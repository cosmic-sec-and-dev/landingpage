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
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Badge,
  Divider,
  Alert
} from 'antd';
import {
  MedicineBoxOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  AuditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';
import { TICKET_PRIORITY_CONFIG } from '../schemaConfig';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const DoctorDeskView = ({
  tickets = [],
  routings = [],
  rooms = [],
  professionals = [],
  services = [],
  appointments = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();

  // Find consulting rooms
  const consultingRooms = rooms.filter(r => r.room_type === 'consulting_room' || r.room_type === 'procedure_room');
  const [activeDoctorRoomId, setActiveDoctorRoomId] = useState(consultingRooms[0]?.id || rooms[0]?.id || null);

  // Active encounter state
  const [activeEncounterTicket, setActiveEncounterTicket] = useState(null);
  const [clinicalForm] = Form.useForm();
  const [finishingLoading, setFinishingLoading] = useState(false);
  const [settledOrderModal, setSettledOrderModal] = useState(null);

  const activeDoctorRoom = rooms.find(r => r.id === activeDoctorRoomId);

  // Doctor professional profile
  const currentProf = professionals.find(p => p.user_id === currentUser?.id) || professionals[0] || null;

  // Filter patients waiting for this consulting room or general queue
  const doctorQueue = tickets.filter(t => {
    if (t.status === 'completed' || t.status === 'cancelled' || t.status === 'no_show') return false;
    // If ticket was specifically routed to this room, or if waiting
    return t.current_room_id === activeDoctorRoomId || (t.status === 'waiting' && !t.current_room_id);
  }).sort((a, b) => {
    const weight = (p) => (p === 'urgent' ? 3 : p === 'preferential' ? 2 : 1);
    const wDiff = weight(b.priority_category) - weight(a.priority_category);
    if (wDiff !== 0) return wDiff;
    return (a.issued_at || '').localeCompare(b.issued_at || '');
  });

  // Call patient into doctor consulting room
  const handleCallPatient = async (ticket) => {
    if (!activeDoctorRoomId) {
      message.warning('Selecione primeiro o seu consultório de atendimento');
      return;
    }

    try {
      // 1. Update ticket to in_service
      await apiRequest(`/clinic_queue_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'in_service',
          current_room_id: activeDoctorRoomId,
          called_at: new Date().toISOString()
        })
      });

      // 2. Insert append-only doctor_call routing
      const prevSteps = routings.filter(r => r.ticket_id === ticket.id).length;
      await apiRequest('/clinic_ticket_routings', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ticket_id: ticket.id,
          from_room_id: ticket.current_room_id || null,
          to_room_id: activeDoctorRoomId,
          operator_user_id: currentUser?.id || null,
          action_type: 'doctor_call',
          step_sequence: prevSteps + 1,
          notes: `Paciente chamado ao ${activeDoctorRoom?.name || 'Consultório Médico'}`
        })
      });

      setActiveEncounterTicket(ticket);
      clinicalForm.resetFields();

      // Pre-fill default service from catalog if available
      const defaultSvc = services[0];
      if (defaultSvc) {
        clinicalForm.setFieldsValue({
          service_item_id: defaultSvc.id,
          price_charged: Number(defaultSvc.price || defaultSvc.base_price || 0)
        });
      }

      message.success(`Paciente da senha ${ticket.ticket_number} chamado ao consultório`);
      onRefresh();
    } catch {
      message.error('Erro ao chamar paciente');
    }
  };

  // Complete consultation, write clinical record & trigger Commerce Hub settlement
  const handleFinishConsultation = async (values) => {
    if (!activeEncounterTicket) return;
    setFinishingLoading(true);

    try {
      const patientId = activeEncounterTicket.patient_user_id || users[0]?.id;
      const profId = currentProf?.id;

      if (!profId) {
        throw new Error('Perfil de profissional médico não encontrado');
      }

      const todayStr = dayjs().format('YYYY-MM-DD');
      const nowIso = new Date().toISOString();

      // 1. Save or complete appointment (triggers nt_trg_settle_clinic_appointment_to_commerce_order)
      let appointmentId = activeEncounterTicket.appointment_id;

      if (!appointmentId) {
        // Create appointment in completed status
        const apptRes = await apiRequest('/clinic_appointments', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            professional_id: profId,
            customer_user_id: patientId,
            service_item_id: values.service_item_id,
            room_id: activeDoctorRoomId,
            appointment_date: todayStr,
            start_time: nowIso,
            end_time: nowIso,
            status: 'completed',
            price_charged: Number(values.price_charged || 0),
            discount_amount: 0,
            final_amount: Number(values.price_charged || 0),
            payment_status: 'pending',
            customer_notes: values.clinical_notes || 'Atendimento concluído via terminal médico',
            internal_notes: `Prontuário: ${values.diagnosis || 'Consulta rotina'}`
          })
        });

        if (!apptRes.ok) {
          throw new Error(apptRes.data?.message || 'Falha ao gravar agendamento faturável');
        }

        const createdAppt = Array.isArray(apptRes.data) ? apptRes.data[0] : apptRes.data;
        appointmentId = createdAppt?.id;
      } else {
        // Update existing appointment to completed
        await apiRequest(`/clinic_appointments?id=eq.${appointmentId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'completed',
            service_item_id: values.service_item_id,
            price_charged: Number(values.price_charged || 0),
            final_amount: Number(values.price_charged || 0)
          })
        });
      }

      // 2. Insert clinical record in clinic_patient_records
      await apiRequest('/clinic_patient_records', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          customer_user_id: patientId,
          professional_user_id: currentUser?.id || patientId,
          appointment_id: appointmentId,
          record_type: 'clinical_note',
          title: `Atendimento Clínico - Senha ${activeEncounterTicket.ticket_number}`,
          clinical_data: {
            anamnesis: values.anamnesis || '',
            diagnosis: values.diagnosis || '',
            prescription: values.prescription || ''
          },
          notes: values.clinical_notes || 'Consulta ambulatorial concluída',
          is_confidential: true
        })
      });

      // 3. Register final routing transition (Append-Only)
      const prevSteps = routings.filter(r => r.ticket_id === activeEncounterTicket.id).length;
      await apiRequest('/clinic_ticket_routings', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ticket_id: activeEncounterTicket.id,
          from_room_id: activeDoctorRoomId,
          to_room_id: activeDoctorRoomId,
          operator_user_id: currentUser?.id || null,
          action_type: 'completed',
          step_sequence: prevSteps + 1,
          notes: 'Consulta médica concluída e faturamento gerado no Commerce Hub'
        })
      });

      // 4. Update queue ticket to completed
      await apiRequest(`/clinic_queue_tickets?id=eq.${activeEncounterTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'completed',
          completed_at: nowIso,
          appointment_id: appointmentId
        })
      });

      // Display order feedback
      setSettledOrderModal({
        ticketNumber: activeEncounterTicket.ticket_number,
        appointmentId,
        amount: Number(values.price_charged || 0)
      });

      setActiveEncounterTicket(null);
      clinicalForm.resetFields();
      message.success('Consulta finalizada! Fatura gerada com sucesso no Commerce Hub.');
      onRefresh();
    } catch (err) {
      message.error(err.message || 'Erro ao concluir atendimento médico');
    } finally {
      setFinishingLoading(false);
    }
  };

  const activePatient = activeEncounterTicket ? users.find(u => u.id === activeEncounterTicket.patient_user_id) : null;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      {/* Header Bar */}
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
          <Col xs={24} md={14}>
            <Space align="center" size={14}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 22
              }}>
                <MedicineBoxOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>
                  Consultório Ativo do Médico:
                </Text>
                <Select
                  value={activeDoctorRoomId}
                  onChange={setActiveDoctorRoomId}
                  style={{ minWidth: 280 }}
                  options={rooms.map(r => ({
                    value: r.id,
                    label: `${r.name} (${r.room_type || 'Consultório'})`
                  }))}
                />
              </div>
            </Space>
          </Col>

          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Tag color="green" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 8 }}>
              Corpo Clínico: {currentUser?.full_name || currentUser?.email || 'Dr. Médico'}
            </Tag>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Col: Queue waiting for this Doctor */}
        <Col xs={24} lg={10}>
          <Card
            variant="borderless"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClockCircleOutlined style={{ color: '#10b981' }} />
                <span style={{ fontWeight: 700 }}>Pacientes Aguardando no Consultório</span>
                <Badge count={doctorQueue.length} style={{ backgroundColor: '#10b981' }} />
              </div>
            }
            style={{
              borderRadius: 18,
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            {doctorQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
                Nenhum paciente aguardando neste consultório no momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {doctorQueue.map(ticket => {
                  const pat = users.find(u => u.id === ticket.patient_user_id);
                  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority_category];
                  const isCurrent = activeEncounterTicket?.id === ticket.id;

                  return (
                    <div
                      key={ticket.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 14,
                        background: isCurrent ? (isDark ? '#1e3a8a' : '#eff6ff') : (isDark ? '#0f172a' : '#f8fafc'),
                        border: isCurrent ? '2px solid #3b82f6' : (isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: priorityCfg?.color || '#0284c7', fontFamily: 'monospace' }}>
                            {ticket.ticket_number}
                          </span>
                          <Tag color={priorityCfg?.color} style={{ borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            {priorityCfg?.label}
                          </Tag>
                        </div>
                        <Text strong style={{ display: 'block', marginTop: 4 }}>
                          {pat ? (pat.full_name || pat.email) : 'Paciente Triado'}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Chegada: {dayjs(ticket.issued_at).format('HH:mm')}
                        </Text>
                      </div>

                      <div>
                        <Button
                          type={isCurrent ? 'default' : 'primary'}
                          icon={<PhoneOutlined />}
                          onClick={() => handleCallPatient(ticket)}
                          style={{
                            borderRadius: 10,
                            fontWeight: 700,
                            background: isCurrent ? undefined : '#10b981',
                            borderColor: isCurrent ? undefined : '#10b981'
                          }}
                        >
                          {isCurrent ? 'Em Atendimento' : 'Chamar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Right Col: Consultation & Clinical Record Workspace */}
        <Col xs={24} lg={14}>
          <Card
            variant="borderless"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileTextOutlined style={{ color: '#0284c7' }} />
                <span style={{ fontWeight: 700 }}>
                  {activeEncounterTicket
                    ? `Atendimento Clínico • Senha ${activeEncounterTicket.ticket_number}`
                    : 'Prontuário & Atendimento Médico'}
                </span>
              </div>
            }
            style={{
              borderRadius: 18,
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            {activeEncounterTicket ? (
              <Form form={clinicalForm} layout="vertical" onFinish={handleFinishConsultation}>
                <Alert
                  message={`Paciente: ${activePatient ? (activePatient.full_name || activePatient.email) : 'Paciente não identificado'} • Senha ${activeEncounterTicket.ticket_number}`}
                  description="Preencha as anotações clínicas e selecione o procedimento canônico realizado. Ao clicar em Concluir, o sistema gravará o prontuário eletrônico e despachará a fatura automaticamente para o Commerce Hub."
                  type="info"
                  showIcon
                  style={{ marginBottom: 20 }}
                />

                <Row gutter={16}>
                  <Col xs={24} sm={14}>
                    <Form.Item
                      name="service_item_id"
                      label="Procedimento / Serviço Realizado (Catálogo Mestre)"
                      rules={[{ required: true, message: 'Selecione o procedimento' }]}
                    >
                      <Select
                        placeholder="Selecione o serviço médico"
                        options={services.map(s => ({
                          value: s.id,
                          label: `${s.name} - R$ ${Number(s.price || s.base_price || 0).toFixed(2)}`
                        }))}
                        onChange={(val) => {
                          const svc = services.find(s => s.id === val);
                          if (svc) {
                            clinicalForm.setFieldsValue({
                              price_charged: Number(svc.price || svc.base_price || 0)
                            });
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={10}>
                    <Form.Item
                      name="price_charged"
                      label="Valor Faturado (R$)"
                      rules={[{ required: true, message: 'Informe o valor' }]}
                    >
                      <InputNumber
                        prefix="R$"
                        style={{ width: '100%' }}
                        min={0}
                        precision={2}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="diagnosis"
                  label="Hipótese Diagnóstica / CID / Avaliação"
                  rules={[{ required: true, message: 'Informe a avaliação' }]}
                >
                  <Input placeholder="Ex: Dermatite de contato, avaliação facial preventiva..." />
                </Form.Item>

                <Form.Item name="anamnesis" label="Anamnese & Queixas do Paciente">
                  <TextArea rows={3} placeholder="Histórico da queixa principal, tempo de evolução e sintomas..." />
                </Form.Item>

                <Form.Item name="prescription" label="Prescrição / Conduta Terapêutica">
                  <TextArea rows={3} placeholder="Receituário médico, exames solicitados ou recomendações pós-procedimento..." />
                </Form.Item>

                <Form.Item name="clinical_notes" label="Observações de Encerramento">
                  <Input placeholder="Recomendações de retorno e orientações..." />
                </Form.Item>

                <Divider style={{ margin: '20px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <Button onClick={() => setActiveEncounterTicket(null)}>
                    Pausar Atendimento
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    htmlType="submit"
                    loading={finishingLoading}
                    style={{
                      borderRadius: 10,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderColor: '#10b981',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    Concluir Consulta & Faturar no Hub
                  </Button>
                </div>
              </Form>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <AuditOutlined style={{ fontSize: 54, color: '#94a3b8', marginBottom: 16 }} />
                <Title level={4} style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  Nenhum Paciente em Atendimento no Momento
                </Title>
                <Text type="secondary" style={{ maxWidth: 450, display: 'block', margin: '0 auto' }}>
                  Clique em "Chamar" na lista ao lado para iniciar a consulta do próximo paciente, registrar o prontuário eletrônico e emitir a fatura unificada.
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal Feedback de Faturamento no Commerce Hub */}
      <Modal
        open={!!settledOrderModal}
        onCancel={() => setSettledOrderModal(null)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setSettledOrderModal(null)}>
            OK, Continuar Atendimentos
          </Button>
        ]}
        width={450}
        destroyOnHidden
      >
        {settledOrderModal && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <CheckCircleOutlined style={{ fontSize: 52, color: '#10b981', marginBottom: 12 }} />
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              Faturamento Concluído!
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
              A consulta da Senha <strong>{settledOrderModal.ticketNumber}</strong> foi liquidada e convertida em ordem de venda no Commerce Hub.
            </Paragraph>

            <div style={{
              marginTop: 16,
              padding: '16px 20px',
              borderRadius: 12,
              background: isDark ? '#0f172a' : '#f8fafc',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text type="secondary">Canal de Origem:</Text>
                <Tag color="cyan">clinic_appointment</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text type="secondary">ID do Agendamento:</Text>
                <Text code>{settledOrderModal.appointmentId?.substring(0, 12)}...</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Valor Faturado:</Text>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>
                  R$ {settledOrderModal.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default DoctorDeskView;
