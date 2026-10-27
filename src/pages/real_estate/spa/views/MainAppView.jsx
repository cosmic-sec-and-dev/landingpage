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
  HomeOutlined,
  DollarOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyModal } from '../components/PropertyModal';
import { AgentModal } from '../components/AgentModal';
import { ClientModal } from '../components/ClientModal';
import { VisitModal } from '../components/VisitModal';
import {
  PROPERTY_STATUS_CONFIG,
  LISTING_TYPE_CONFIG,
  VISIT_STATUS_CONFIG
} from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  properties = [],
  agents = [],
  clients = [],
  visits = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('properties');
  const [listingFilter, setListingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState(null);

  // Filtered Properties
  const filteredProperties = properties.filter(prop => {
    if (listingFilter !== 'all' && prop.listing_type !== listingFilter) return false;
    if (statusFilter !== 'all' && prop.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (prop.title || '').toLowerCase().includes(q);
      const matchDesc = (prop.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Metrics
  const totalProperties = properties.length;
  const portfolioValue = properties
    .filter(p => p.status === 'available')
    .reduce((acc, p) => acc + Number(p.price || 0), 0);
  const scheduledVisitsCount = visits.filter(v => v.status === 'scheduled').length;
  const totalClients = clients.length;

  const handleDeleteClient = async (clientId) => {
    try {
      const res = await apiRequest(`/clients?id=eq.${clientId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Cliente removido');
        onRefresh();
      } else {
        message.error('Erro ao excluir cliente');
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Imóveis no Portfólio</span>}
              value={totalProperties}
              prefix={<HomeOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>VGV Disponível</span>}
              value={portfolioValue}
              prefix={<DollarOutlined style={{ color: '#10b981' }} />}
              formatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Visitas Agendadas</span>}
              value={scheduledVisitsCount}
              prefix={<CalendarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: scheduledVisitsCount > 0 ? '#f59e0b' : undefined }}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Clientes Cadastrados</span>}
              value={totalClients}
              prefix={<UsergroupAddOutlined style={{ color: '#8b5cf6' }} />}
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
            key: 'properties',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <HomeOutlined style={{ marginRight: 6 }} />
                Vitrine de Imóveis
                <GlowingCount count={properties.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'visits',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Visitas Agendadas
                <GlowingCount count={visits.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'clients',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <UsergroupAddOutlined style={{ marginRight: 6 }} />
                Clientes Interessados
                <GlowingCount count={clients.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'agents',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <TeamOutlined style={{ marginRight: 6 }} />
                Corretores & Equipe
                <GlowingCount count={agents.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
              </span>
            )
          }
        ]}
      />

      {/* View 1: Vitrine de Imóveis */}
      {activeTab === 'properties' && (
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
                    value={listingFilter}
                    onChange={e => setListingFilter(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="all">Todos</Radio.Button>
                    <Radio.Button value="sale">Venda</Radio.Button>
                    <Radio.Button value="rent">Locação</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar imóvel..."
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
                      setEditingProperty(null);
                      setPropertyModalOpen(true);
                    }}
                  >
                    Novo Imóvel
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {filteredProperties.length === 0 ? (
            <Empty
              description="Nenhum imóvel encontrado no portfólio."
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProperty(null);
                  setPropertyModalOpen(true);
                }}
              >
                Cadastrar Primeiro Imóvel
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProperties.map(property => (
                <Col xs={24} sm={12} lg={8} key={property.id}>
                  <PropertyCard
                    property={property}
                    agents={agents}
                    onEdit={(prop) => {
                      setEditingProperty(prop);
                      setPropertyModalOpen(true);
                    }}
                    onScheduleVisit={(prop) => {
                      setSelectedPropertyForVisit(prop.id);
                      setVisitModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* View 2: Visitas Agendadas */}
      {activeTab === 'visits' && (
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
              Agenda de Visitas e Inspeções
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingVisit(null);
                setSelectedPropertyForVisit(null);
                setVisitModalOpen(true);
              }}
            >
              Agendar Nova Visita
            </Button>
          </div>

          <Table
            dataSource={visits}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Data/Hora',
                dataIndex: 'scheduled_at',
                key: 'scheduled_at',
                render: val => dayjs(val).format('DD/MM/YYYY HH:mm')
              },
              {
                title: 'Imóvel',
                dataIndex: 'property_id',
                key: 'property',
                render: pid => {
                  const p = properties.find(prop => prop.id === pid);
                  return <strong>{p ? p.title : pid}</strong>;
                }
              },
              {
                title: 'Cliente',
                dataIndex: 'client_id',
                key: 'client',
                render: cid => {
                  const c = clients.find(cl => cl.id === cid);
                  return c ? `${c.full_name} (${c.phone})` : cid;
                }
              },
              {
                title: 'Corretor',
                dataIndex: 'agent_id',
                key: 'agent',
                render: aid => {
                  const ag = agents.find(a => a.id === aid);
                  return ag ? `CRECI ${ag.license_number}` : aid;
                }
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: st => {
                  const cfg = VISIT_STATUS_CONFIG[st] || VISIT_STATUS_CONFIG.scheduled;
                  return <Tag color={cfg.color}>{cfg.label}</Tag>;
                }
              },
              {
                title: 'Parecer / Feedback',
                dataIndex: 'feedback',
                key: 'feedback',
                render: txt => txt || '-'
              },
              {
                title: 'Ações',
                key: 'act',
                render: (_, r) => (
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingVisit(r);
                      setVisitModalOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* View 3: Clientes Interessados */}
      {activeTab === 'clients' && (
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
              Carteira de Clientes e Proponentes
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingClient(null);
                setClientModalOpen(true);
              }}
            >
              Cadastrar Cliente
            </Button>
          </div>

          <Table
            dataSource={clients}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Nome Completo',
                dataIndex: 'full_name',
                key: 'name',
                render: (txt, r) => (
                  <div>
                    <strong>{txt}</strong>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>{r.email || '-'}</div>
                  </div>
                )
              },
              {
                title: 'Telefone',
                dataIndex: 'phone',
                key: 'phone',
                render: txt => <Tag color="blue">{txt}</Tag>
              },
              {
                title: 'Faixa de Orçamento',
                key: 'budget',
                render: (_, r) => `R$ ${Number(r.budget_min || 0).toLocaleString('pt-BR')} - R$ ${Number(r.budget_max || 0).toLocaleString('pt-BR')}`
              },
              {
                title: 'Corretor Designado',
                dataIndex: 'assigned_agent_id',
                key: 'agent',
                render: aid => {
                  const ag = agents.find(a => a.id === aid);
                  return ag ? `CRECI ${ag.license_number}` : 'Livre';
                }
              },
              {
                title: 'Observações',
                dataIndex: 'notes',
                key: 'notes',
                render: txt => txt || '-'
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
                        setEditingClient(r);
                        setClientModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Popconfirm
                      title="Excluir este cliente?"
                      onConfirm={() => handleDeleteClient(r.id)}
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

      {/* View 4: Corretores & Equipe */}
      {activeTab === 'agents' && (
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
              Quadro de Corretores Credenciados (CRECI)
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingAgent(null);
                setAgentModalOpen(true);
              }}
            >
              Cadastrar Corretor
            </Button>
          </div>

          <Table
            dataSource={agents}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Usuário',
                dataIndex: 'user_id',
                key: 'user',
                render: uid => {
                  const u = users.find(usr => usr.id === uid);
                  return <strong>{u ? (u.full_name || u.email) : uid?.substring(0, 8)}</strong>;
                }
              },
              {
                title: 'Registro CRECI',
                dataIndex: 'license_number',
                key: 'creci',
                render: num => <Tag color="geekblue" style={{ fontWeight: 700 }}>{num}</Tag>
              },
              {
                title: 'Contato Comercial',
                dataIndex: 'phone',
                key: 'phone'
              },
              {
                title: 'Bio / Especialidade',
                dataIndex: 'bio',
                key: 'bio',
                render: txt => txt || '-'
              },
              {
                title: 'Status',
                dataIndex: 'is_active',
                key: 'active',
                render: act => <Tag color={act ? 'green' : 'default'}>{act ? 'Ativo' : 'Inativo'}</Tag>
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 100,
                render: (_, r) => (
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingAgent(r);
                      setAgentModalOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* Modals */}
      <PropertyModal
        open={propertyModalOpen}
        record={editingProperty}
        agents={agents}
        onCancel={() => {
          setPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSuccess={onRefresh}
      />

      <AgentModal
        open={agentModalOpen}
        record={editingAgent}
        users={users}
        onCancel={() => {
          setAgentModalOpen(false);
          setEditingAgent(null);
        }}
        onSuccess={onRefresh}
      />

      <ClientModal
        open={clientModalOpen}
        record={editingClient}
        agents={agents}
        onCancel={() => {
          setClientModalOpen(false);
          setEditingClient(null);
        }}
        onSuccess={onRefresh}
      />

      <VisitModal
        open={visitModalOpen}
        record={editingVisit}
        defaultPropertyId={selectedPropertyForVisit}
        properties={properties}
        clients={clients}
        agents={agents}
        onCancel={() => {
          setVisitModalOpen(false);
          setEditingVisit(null);
          setSelectedPropertyForVisit(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
};
