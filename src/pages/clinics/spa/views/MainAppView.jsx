import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Radio,
  Select,
  Button,
  Statistic,
  Empty,
  Space,
  Tag,
  Tabs,
  DatePicker,
  Table,
  Badge,
  Typography
} from 'antd';
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  HomeOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  IdcardOutlined,
  DesktopOutlined,
  PhoneOutlined,
  AuditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { AppointmentCard } from '../components/AppointmentCard';
import { AppointmentModal } from '../components/AppointmentModal';
import { PatientRecordModal } from '../components/PatientRecordModal';
import { KioskTicketView } from './KioskTicketView';
import { WaitingRoomTvView } from './WaitingRoomTvView';
import { ReceptionDeskView } from './ReceptionDeskView';
import { DoctorDeskView } from './DoctorDeskView';
import { APPOINTMENT_STATUS_COLORS } from '../schemaConfig';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  appointments = [],
  professionals = [],
  patientRecords = [],
  services = [],
  rooms = [],
  specialties = [],
  treatmentPlans = [],
  queueTickets = [],
  routings = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('agenda');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusFilter, setStatusFilter] = useState('all');
  const [professionalFilter, setProfessionalFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedAppForRecord, setSelectedAppForRecord] = useState(null);

  // Filtered Appointments
  const filteredAppointments = appointments.filter(app => {
    // Date filter
    if (selectedDate && app.appointment_date) {
      if (dayjs(app.appointment_date).format('YYYY-MM-DD') !== selectedDate.format('YYYY-MM-DD')) {
        return false;
      }
    }
    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    // Professional filter
    if (professionalFilter !== 'all' && app.professional_id !== professionalFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patient = users.find(u => u.id === (app.customer_user_id || app.patient_user_id));
      const patientName = (patient?.full_name || patient?.email || '').toLowerCase();
      const notes = (app.customer_notes || app.internal_notes || app.notes || '').toLowerCase();
      if (!patientName.includes(q) && !notes.includes(q)) return false;
    }

    return true;
  }).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

  // Key Metrics
  const todayApps = appointments.filter(a => dayjs(a.appointment_date).isSame(dayjs(), 'day'));
  const todayCount = todayApps.length;
  const inProgressToday = todayApps.filter(a => a.status === 'in_progress').length;
  const waitingTicketsCount = queueTickets.filter(t => t.status === 'waiting' || t.status === 'called').length;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Consultas Hoje</span>}
              value={todayCount}
              prefix={<CalendarOutlined style={{ color: '#0284c7' }} />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Fila de Senhas</span>}
              value={waitingTicketsCount}
              prefix={<PhoneOutlined style={{ color: '#f59e0b' }} />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Em Atendimento</span>}
              value={inProgressToday}
              prefix={<MedicineBoxOutlined style={{ color: '#a855f7' }} />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Salas & Postos</span>}
              value={rooms.length}
              prefix={<HomeOutlined style={{ color: '#10b981' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs Navigation */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'agenda',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Agenda & Consultas
                <GlowingCount count={appointments.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'reception',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ marginRight: 6 }} />
                Recepção & Triagem
                <GlowingCount count={waitingTicketsCount} color={isDark ? '#fbbf24' : '#d97706'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'doctor_desk',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <MedicineBoxOutlined style={{ marginRight: 6 }} />
                Consultório Médico
              </span>
            )
          },
          {
            key: 'kiosk',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <IdcardOutlined style={{ marginRight: 6 }} />
                Totem de Senhas
              </span>
            )
          },
          {
            key: 'tv_panel',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <DesktopOutlined style={{ marginRight: 6 }} />
                Painel TV Sala de Espera
              </span>
            )
          },
          {
            key: 'records',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FileProtectOutlined style={{ marginRight: 6 }} />
                Prontuários & PEP
                <GlowingCount count={patientRecords.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'professionals',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <AuditOutlined style={{ marginRight: 6 }} />
                Corpo Clínico
                <GlowingCount count={professionals.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'rooms',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <HomeOutlined style={{ marginRight: 6 }} />
                Salas & Postos
                <GlowingCount count={rooms.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
              </span>
            )
          }
        ]}
      />

      {/* View 1: Agenda & Consultas */}
      {activeTab === 'agenda' && (
        <>
          {/* Filter Bar */}
          <Card
            variant="borderless"
            style={{
              marginBottom: 20,
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: '14px 20px' } }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} lg={14}>
                <Space wrap>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    format="DD/MM/YYYY"
                    allowClear={false}
                    style={{ width: 150 }}
                  />

                  <Radio.Group
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    buttonStyle="solid"
                    size="middle"
                  >
                    <Radio.Button value="all">Todos</Radio.Button>
                    <Radio.Button value="scheduled">Agendados</Radio.Button>
                    <Radio.Button value="in_progress">Em Atendimento</Radio.Button>
                    <Radio.Button value="completed">Concluídos</Radio.Button>
                  </Radio.Group>

                  <Select
                    placeholder="Profissional"
                    value={professionalFilter}
                    onChange={setProfessionalFilter}
                    style={{ minWidth: 160 }}
                  >
                    <Select.Option value="all">Todos Profissionais</Select.Option>
                    {professionals.map(p => {
                      const userMatch = users.find(u => u.id === p.user_id);
                      return (
                        <Select.Option key={p.id} value={p.id}>
                          {userMatch ? `${p.title_prefix || 'Dr(a).'} ${userMatch.full_name || userMatch.email}` : p.id.substring(0, 8)}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Space>
              </Col>

              <Col xs={24} lg={10}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar paciente..."
                    allowClear
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 180 }}
                  />
                  <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingAppointment(null);
                      setAppointmentModalOpen(true);
                    }}
                  >
                    Nova Consulta
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Appointments Grid */}
          {filteredAppointments.length === 0 ? (
            <Empty
              description={`Nenhum agendamento para ${selectedDate ? selectedDate.format('DD/MM/YYYY') : 'esta data'}.`}
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingAppointment(null);
                  setAppointmentModalOpen(true);
                }}
              >
                Agendar Primeira Consulta
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredAppointments.map(app => (
                <Col xs={24} sm={12} lg={8} xl={6} key={app.id}>
                  <AppointmentCard
                    appointment={app}
                    professionals={professionals}
                    services={services}
                    rooms={rooms}
                    users={users}
                    onEdit={(rec) => {
                      setEditingAppointment(rec);
                      setAppointmentModalOpen(true);
                    }}
                    onOpenRecord={(rec) => {
                      setSelectedAppForRecord(rec);
                      setRecordModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* View 2: Recepção & Triagem */}
      {activeTab === 'reception' && (
        <ReceptionDeskView
          tickets={queueTickets}
          routings={routings}
          rooms={rooms}
          users={users}
          currentUser={currentUser}
          onRefresh={onRefresh}
          loading={loading}
        />
      )}

      {/* View 3: Consultório Médico */}
      {activeTab === 'doctor_desk' && (
        <DoctorDeskView
          tickets={queueTickets}
          routings={routings}
          rooms={rooms}
          professionals={professionals}
          services={services}
          appointments={appointments}
          users={users}
          currentUser={currentUser}
          onRefresh={onRefresh}
          loading={loading}
        />
      )}

      {/* View 4: Totem de Senhas (Kiosk) */}
      {activeTab === 'kiosk' && (
        <KioskTicketView
          rooms={rooms}
          users={users}
          existingTickets={queueTickets}
          onTicketIssued={onRefresh}
        />
      )}

      {/* View 5: Painel TV da Sala de Espera */}
      {activeTab === 'tv_panel' && (
        <WaitingRoomTvView
          rooms={rooms}
          users={users}
          onRefresh={onRefresh}
        />
      )}

      {/* View 6: Prontuários & PEP */}
      {activeTab === 'records' && (
        <Card
          variant="borderless"
          style={{
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 12,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          styles={{ body: { padding: 18 } }}
        >
          <Table
            dataSource={patientRecords}
            rowKey="id"
            columns={[
              {
                title: 'Data & Hora',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm')
              },
              {
                title: 'Paciente',
                dataIndex: 'customer_user_id',
                key: 'patient',
                render: (uid) => {
                  const u = users.find(usr => usr.id === uid);
                  return u ? (u.full_name || u.email) : uid?.substring(0, 8);
                }
              },
              {
                title: 'Profissional',
                dataIndex: 'professional_user_id',
                key: 'prof',
                render: (uid) => {
                  const u = users.find(usr => usr.id === uid);
                  return u ? (u.full_name || u.email) : uid?.substring(0, 8);
                }
              },
              {
                title: 'Título / Procedimento',
                dataIndex: 'title',
                key: 'title',
                render: (txt) => <Text strong>{txt || 'Registro Clínico'}</Text>
              },
              {
                title: 'Tipo de Prontuário',
                dataIndex: 'record_type',
                key: 'type',
                render: (type) => <Tag color="blue">{type || 'Evolução'}</Tag>
              },
              {
                title: 'Anotações / Conduta',
                dataIndex: 'notes',
                key: 'notes',
                render: (txt) => txt || '-'
              }
            ]}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      )}

      {/* View 7: Corpo Clínico */}
      {activeTab === 'professionals' && (
        <Row gutter={[16, 16]}>
          {professionals.map(p => {
            const u = users.find(usr => usr.id === p.user_id);
            const spec = specialties.find(s => s.id === p.specialty_id);
            return (
              <Col xs={24} sm={12} md={8} key={p.id}>
                <Card
                  variant="borderless"
                  style={{
                    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                    borderRadius: 12,
                    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  styles={{ body: { padding: 18 } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: p.color_code || '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 16
                    }}>
                      {(u?.full_name || u?.email || 'Dr')[0].toUpperCase()}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a', display: 'block' }}>
                        {p.title_prefix || 'Dr(a).'} {u ? (u.full_name || u.email) : 'Especialista'}
                      </Text>
                      {spec && <Tag color="cyan" style={{ borderRadius: 6, fontSize: 11 }}>{spec.name}</Tag>}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                    <p style={{ margin: '4px 0' }}>📋 <strong>Registro:</strong> {p.professional_license_number || 'Não informado'}</p>
                    <p style={{ margin: '4px 0' }}>⏱️ <strong>Duração Padrão:</strong> {p.appointment_duration_default_minutes} minutos</p>
                    {p.bio && <p style={{ margin: '6px 0', fontStyle: 'italic' }}>"{p.bio}"</p>}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* View 8: Salas & Postos */}
      {activeTab === 'rooms' && (
        <Row gutter={[16, 16]}>
          {rooms.map(r => (
            <Col xs={24} sm={12} md={8} key={r.id}>
              <Card
                variant="borderless"
                style={{
                  background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                  borderRadius: 12,
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                styles={{ body: { padding: 18 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {r.name}
                  </Text>
                  <Tag color={r.is_active ? 'green' : 'default'}>
                    {r.is_active ? 'Disponível' : 'Inativa'}
                  </Tag>
                </div>

                <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <p style={{ margin: '4px 0' }}>🏷️ <strong>Tipo:</strong> <Tag color="blue">{r.room_type || 'Consultório'}</Tag></p>
                  <p style={{ margin: '4px 0' }}>👥 <strong>Capacidade:</strong> {r.capacity || 1} pessoas</p>
                  {r.description && <p style={{ margin: '6px 0', color: '#64748b' }}>{r.description}</p>}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        open={appointmentModalOpen}
        record={editingAppointment}
        professionals={professionals}
        services={services}
        rooms={rooms}
        users={users}
        onCancel={() => {
          setAppointmentModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={onRefresh}
      />

      {/* Patient Record Modal */}
      <PatientRecordModal
        open={recordModalOpen}
        appointment={selectedAppForRecord}
        professionals={professionals}
        users={users}
        onCancel={() => {
          setRecordModalOpen(false);
          setSelectedAppForRecord(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
};
export default MainAppView;
