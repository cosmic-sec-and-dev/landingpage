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
  Table,
  Typography,
  Popconfirm,
  message
} from 'antd';
import {
  CalendarOutlined,
  QrcodeOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  TagsOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { EventCard } from '../components/EventCard';
import { EventModal } from '../components/EventModal';
import { TierModal } from '../components/TierModal';
import { CheckInModal } from '../components/CheckInModal';
import { EVENT_STATUS_CONFIG, LOCATION_TYPE_CONFIG, TICKET_STATUS_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  events = [],
  categories = [],
  tags = [],
  tiers = [],
  tickets = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('events');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);

  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedEventForCheckIn, setSelectedEventForCheckIn] = useState(null);

  // Filtered Events
  const filteredEvents = events.filter(ev => {
    if (formatFilter !== 'all' && ev.location_type !== formatFilter) return false;
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (ev.title || '').toLowerCase().includes(q);
      const matchDesc = (ev.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Metrics
  const totalEvents = events.length;
  const totalTicketsSold = tickets.length;
  const totalCheckedIn = tickets.filter(t => t.status === 'checked_in').length;
  const totalRevenue = tickets.reduce((acc, t) => acc + Number(t.price_paid || 0), 0);

  const handleDeleteTier = async (tierId) => {
    try {
      const res = await apiRequest(`/event_tiers?id=eq.${tierId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Lote removido');
        onRefresh();
      } else {
        message.error('Erro ao excluir lote');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
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
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total de Eventos</span>}
              value={totalEvents}
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
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Ingressos Emitidos</span>}
              value={totalTicketsSold}
              prefix={<TeamOutlined style={{ color: '#8b5cf6' }} />}
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
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Check-ins Realizados</span>}
              value={totalCheckedIn}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
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
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Receita de Bilheteria</span>}
              value={totalRevenue}
              prefix={<DollarCircleOutlined style={{ color: '#0284c7' }} />}
              formatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'events',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Mural de Eventos
                <GlowingCount count={events.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'tiers',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <TagsOutlined style={{ marginRight: 6 }} />
                Lotes & Preços
                <GlowingCount count={tiers.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'tickets',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <TeamOutlined style={{ marginRight: 6 }} />
                Bilhetes & Ingressos
                <GlowingCount count={tickets.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'categories',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FolderOpenOutlined style={{ marginRight: 6 }} />
                Categorias
                <GlowingCount count={categories.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
              </span>
            )
          }
        ]}
      />

      {/* View 1: Mural de Eventos */}
      {activeTab === 'events' && (
        <>
          <Card
            variant="borderless"
            style={{
              marginBottom: 20,
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: {padding: '14px 20px'} }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} sm={12}>
                <Space wrap>
                  <Radio.Group
                    value={formatFilter}
                    onChange={e => setFormatFilter(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="all">Todos</Radio.Button>
                    <Radio.Button value="physical">Presencial</Radio.Button>
                    <Radio.Button value="online">Online</Radio.Button>
                    <Radio.Button value="hybrid">Híbrido</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar evento..."
                    allowClear
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingEvent(null);
                      setEventModalOpen(true);
                    }}
                  >
                    Novo Evento
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {filteredEvents.length === 0 ? (
            <Empty
              description="Nenhum evento encontrado."
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingEvent(null);
                  setEventModalOpen(true);
                }}
              >
                Criar Primeiro Evento
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredEvents.map(event => (
                <Col xs={24} sm={12} lg={8} key={event.id}>
                  <EventCard
                    event={event}
                    tiers={tiers}
                    tickets={tickets}
                    onEdit={(ev) => {
                      setEditingEvent(ev);
                      setEventModalOpen(true);
                    }}
                    onOpenCheckIn={(ev) => {
                      setSelectedEventForCheckIn(ev);
                      setCheckInModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* View 2: Lotes & Preços */}
      {activeTab === 'tiers' && (
        <Card
          variant="borderless"
          style={{
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 12,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          styles={{ body: {padding: 20} }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Lotes de Ingressos e Precificação
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTier(null);
                setTierModalOpen(true);
              }}
            >
              Criar Lote
            </Button>
          </div>

          <Table
            dataSource={tiers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Evento',
                dataIndex: 'event_id',
                key: 'event',
                render: eid => {
                  const ev = events.find(e => e.id === eid);
                  return <strong>{ev ? ev.title : eid}</strong>;
                }
              },
              {
                title: 'Nome do Lote',
                dataIndex: 'name',
                key: 'name',
                render: txt => <Tag color="blue">{txt}</Tag>
              },
              {
                title: 'Preço',
                dataIndex: 'price',
                key: 'price',
                render: val => Number(val) > 0 ? `R$ ${Number(val).toFixed(2)}` : <Tag color="green">Gratuito</Tag>
              },
              {
                title: 'Disponibilidade',
                key: 'qty',
                render: (_, r) => `${r.available_quantity || 0} / ${r.total_quantity || 0}`
              },
              {
                title: 'Status',
                dataIndex: 'is_active',
                key: 'active',
                render: act => <Tag color={act ? 'green' : 'default'}>{act ? 'Ativo' : 'Encerrado'}</Tag>
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 140,
                render: (_, r) => (
                  <Space size="small">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingTier(r);
                        setTierModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Popconfirm
                      title="Excluir este lote?"
                      onConfirm={() => handleDeleteTier(r.id)}
                      okText="Sim"
                      cancelText="Não"
                    >
                      <Button size="small" danger>Excluir</Button>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* View 3: Bilhetes & Ingressos Emitidos */}
      {activeTab === 'tickets' && (
        <Card
          variant="borderless"
          style={{
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 12,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          styles={{ body: {padding: 20} }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Bilhetes Emitidos & Status de Acesso
            </Title>
            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
          </div>

          <Table
            dataSource={tickets}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Código QR / Ingresso',
                dataIndex: 'ticket_code',
                key: 'ticket_code',
                render: code => <strong style={{ color: '#0284c7' }}>{code}</strong>
              },
              {
                title: 'Evento',
                dataIndex: 'event_id',
                key: 'event',
                render: eid => {
                  const ev = events.find(e => e.id === eid);
                  return ev ? ev.title : eid;
                }
              },
              {
                title: 'Participante',
                dataIndex: 'attendee_user_id',
                key: 'attendee',
                render: uid => {
                  const u = users.find(usr => usr.id === uid);
                  return u ? (u.full_name || u.email) : uid?.substring(0, 8);
                }
              },
              {
                title: 'Valor Pago',
                dataIndex: 'price_paid',
                key: 'price',
                render: val => `R$ ${Number(val || 0).toFixed(2)}`
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: st => {
                  const cfg = TICKET_STATUS_CONFIG[st] || TICKET_STATUS_CONFIG.valid;
                  return <Tag color={cfg.color}>{cfg.label}</Tag>;
                }
              },
              {
                title: 'Check-in em',
                dataIndex: 'checked_in_at',
                key: 'checked_in_at',
                render: val => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-'
              }
            ]}
          />
        </Card>
      )}

      {/* View 4: Categorias */}
      {activeTab === 'categories' && (
        <Row gutter={[16, 16]}>
          {categories.map(c => (
            <Col xs={24} sm={12} md={8} key={c.id}>
              <Card
                variant="borderless"
                style={{
                  background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                  borderRadius: 12,
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                styles={{ body: {padding: 18} }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a' }}>{c.name}</Text>
                  <Tag color="geekblue">{c.slug}</Tag>
                </div>
                <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                  {c.description || 'Classificação de eventos e workshops.'}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modals */}
      <EventModal
        open={eventModalOpen}
        record={editingEvent}
        categories={categories}
        currentUser={currentUser}
        onCancel={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={onRefresh}
      />

      <TierModal
        open={tierModalOpen}
        record={editingTier}
        events={events}
        onCancel={() => {
          setTierModalOpen(false);
          setEditingTier(null);
        }}
        onSuccess={onRefresh}
      />

      <CheckInModal
        open={checkInModalOpen}
        event={selectedEventForCheckIn}
        tickets={tickets}
        tiers={tiers}
        users={users}
        onClose={() => {
          setCheckInModalOpen(false);
          setSelectedEventForCheckIn(null);
        }}
        onRefresh={onRefresh}
      />
    </div>
  );
};
