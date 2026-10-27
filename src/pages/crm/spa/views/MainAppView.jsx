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
  Badge,
  Typography,
  Popconfirm,
  Checkbox,
  message
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  CheckSquareOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { DealCard } from '../components/DealCard';
import { DealModal } from '../components/DealModal';
import { ContactModal } from '../components/ContactModal';
import { TaskModal } from '../components/TaskModal';
import { CONTACT_TYPES } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  pipelines = [],
  stages = [],
  deals = [],
  contacts = [],
  tasks = [],
  interactions = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelines[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [defaultStageForDeal, setDefaultStageForDeal] = useState(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const activePipeline = pipelines.find(p => p.id === (selectedPipelineId || pipelines[0]?.id)) || pipelines[0];
  const pipelineStages = stages
    .filter(s => s.pipeline_id === activePipeline?.id)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // Filtered deals
  const filteredDeals = deals.filter(d => {
    if (activePipeline && d.pipeline_id !== activePipeline.id) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (d.title || '').toLowerCase().includes(q);
      const contact = contacts.find(c => c.id === d.contact_id);
      const contactName = `${contact?.first_name || ''} ${contact?.last_name || ''} ${contact?.company_name || ''}`.toLowerCase();
      if (!matchTitle && !contactName.includes(q)) return false;
    }
    return true;
  });

  // Metrics
  const totalPipelineValue = deals
    .filter(d => d.status === 'open')
    .reduce((acc, d) => acc + Number(d.amount || 0), 0);

  const wonDealsValue = deals
    .filter(d => d.status === 'won')
    .reduce((acc, d) => acc + Number(d.amount || 0), 0);

  const totalDealsCount = deals.length;
  const wonCount = deals.filter(d => d.status === 'won').length;
  const winRate = totalDealsCount > 0 ? Math.round((wonCount / totalDealsCount) * 100) : 0;
  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  const handleToggleTask = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const res = await apiRequest(`/tasks?id=eq.${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
      });
      if (res.ok) {
        message.success(newStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta!');
        onRefresh();
      }
    } catch {
      message.error('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const res = await apiRequest(`/contacts?id=eq.${contactId}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('Contato removido');
        onRefresh();
      }
    } catch {
      message.error('Erro ao excluir');
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Pipeline Aberto</span>}
              value={totalPipelineValue}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#0284c7' }} />}
              formatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Vendas Fechadas (Ganhas)</span>}
              value={wonDealsValue}
              prefix={<TrophyOutlined style={{ color: '#10b981' }} />}
              formatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Taxa de Conversão</span>}
              value={winRate}
              suffix="%"
              prefix={<ThunderboltOutlined style={{ color: '#f59e0b' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Tarefas de Follow-up</span>}
              value={pendingTasksCount}
              prefix={<CheckSquareOutlined style={{ color: '#a855f7' }} />}
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
            key: 'pipeline',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <DollarOutlined style={{ marginRight: 6 }} />
                Funil de Vendas (Kanban)
                <GlowingCount count={deals.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'contacts',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: 6 }} />
                Leads & Contatos
                <GlowingCount count={contacts.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'tasks',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <CheckSquareOutlined style={{ marginRight: 6 }} />
                Follow-up & Atividades
                <GlowingCount count={tasks.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
              </span>
            )
          }
        ]}
      />

      {/* View 1: Visual Pipeline Kanban */}
      {activeTab === 'pipeline' && (
        <>
          {/* Funnel Toolbar */}
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
              <Col xs={24} lg={14}>
                <Space wrap>
                  <Select
                    placeholder="Selecione o Funil"
                    value={activePipeline?.id}
                    onChange={setSelectedPipelineId}
                    style={{ minWidth: 200 }}
                  >
                    {pipelines.map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        💼 {p.name}
                      </Select.Option>
                    ))}
                  </Select>

                  <Radio.Group
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    buttonStyle="solid"
                    size="middle"
                  >
                    <Radio.Button value="all">Todos</Radio.Button>
                    <Radio.Button value="open">Em Negociação</Radio.Button>
                    <Radio.Button value="won">Ganhos</Radio.Button>
                    <Radio.Button value="lost">Perdidos</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>

              <Col xs={24} lg={10}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar negócio ou cliente..."
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
                      setEditingDeal(null);
                      setDefaultStageForDeal(pipelineStages[0]?.id);
                      setDealModalOpen(true);
                    }}
                  >
                    Nova Oportunidade
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Kanban Stage Columns */}
          <div style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 16,
            minHeight: 500
          }}>
            {pipelineStages.map(stage => {
              const stageDeals = filteredDeals.filter(d => d.stage_id === stage.id);
              const stageTotalValue = stageDeals.reduce((acc, d) => acc + Number(d.amount || 0), 0);

              return (
                <div
                  key={stage.id}
                  style={{
                    flex: '0 0 320px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: 14,
                    padding: 14,
                    border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Column Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                    paddingBottom: 8,
                    borderBottom: isDark ? '1px solid #334155' : '1px solid #cbd5e1'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color_hex || '#3b82f6' }} />
                      <Text strong style={{ fontSize: 14, color: isDark ? '#f8fafc' : '#0f172a' }}>
                        {stage.name}
                      </Text>
                    </div>
                    <Badge count={stageDeals.length} style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a' }} />
                  </div>

                  {/* Column Total Value */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginBottom: 12 }}>
                    R$ {stageTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>

                  {/* Deals Cards List */}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {stageDeals.map(deal => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        stages={pipelineStages}
                        contacts={contacts}
                        users={users}
                        onEdit={(d) => {
                          setEditingDeal(d);
                          setDealModalOpen(true);
                        }}
                        onRefresh={onRefresh}
                      />
                    ))}

                    {stageDeals.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '30px 0', color: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }}>
                        Nenhuma oportunidade nesta etapa.
                      </div>
                    )}
                  </div>

                  {/* Add deal button in stage */}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      setEditingDeal(null);
                      setDefaultStageForDeal(stage.id);
                      setDealModalOpen(true);
                    }}
                  >
                    Adicionar Negócio
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View 2: Contatos & Leads */}
      {activeTab === 'contacts' && (
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
              Base de Contatos & Leads
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingContact(null);
                setContactModalOpen(true);
              }}
            >
              Novo Contato / Lead
            </Button>
          </div>

          <Table
            dataSource={contacts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Nome Completo',
                key: 'name',
                render: (_, r) => <strong>{r.first_name} {r.last_name}</strong>
              },
              {
                title: 'Empresa',
                dataIndex: 'company_name',
                key: 'company',
                render: (val, r) => val ? `${val} (${r.job_title || 'Cargo n/i'})` : '-'
              },
              {
                title: 'E-mail',
                dataIndex: 'email',
                key: 'email',
                render: (val) => val ? <span><MailOutlined style={{ marginRight: 4 }} />{val}</span> : '-'
              },
              {
                title: 'Telefone',
                dataIndex: 'phone',
                key: 'phone',
                render: (val) => val ? <span><PhoneOutlined style={{ marginRight: 4 }} />{val}</span> : '-'
              },
              {
                title: 'Classificação',
                dataIndex: 'contact_type',
                key: 'type',
                render: (type) => {
                  const cfg = CONTACT_TYPES.find(c => c.value === type);
                  return <Tag color="blue">{cfg ? cfg.label : type}</Tag>;
                }
              },
              {
                title: 'Origem',
                dataIndex: 'lead_source',
                key: 'source',
                render: (val) => val ? <Tag>{val}</Tag> : '-'
              },
              {
                title: 'Ações',
                key: 'actions',
                render: (_, record) => (
                  <Space size="small">
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingContact(record);
                        setContactModalOpen(true);
                      }}
                    />
                    <Popconfirm
                      title="Excluir contato?"
                      onConfirm={() => handleDeleteContact(record.id)}
                      okText="Sim"
                      cancelText="Não"
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* View 3: Follow-up & Tarefas */}
      {activeTab === 'tasks' && (
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
              Tarefas de Follow-up Comercial
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            >
              Nova Tarefa de Follow-up
            </Button>
          </div>

          <Table
            dataSource={tasks}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Status',
                key: 'status',
                width: 60,
                render: (_, t) => (
                  <Checkbox
                    checked={t.status === 'completed'}
                    onChange={() => handleToggleTask(t)}
                  />
                )
              },
              {
                title: 'Tarefa',
                dataIndex: 'title',
                key: 'title',
                render: (val, t) => (
                  <span style={{ textDecoration: t.status === 'completed' ? 'line-through' : 'none', opacity: t.status === 'completed' ? 0.6 : 1 }}>
                    {val}
                  </span>
                )
              },
              {
                title: 'Oportunidade',
                dataIndex: 'deal_id',
                key: 'deal',
                render: (did) => {
                  const d = deals.find(dl => dl.id === did);
                  return d ? <Tag color="geekblue">{d.title}</Tag> : '-';
                }
              },
              {
                title: 'Contato',
                dataIndex: 'contact_id',
                key: 'contact',
                render: (cid) => {
                  const c = contacts.find(ct => ct.id === cid);
                  return c ? `${c.first_name} ${c.last_name}` : '-';
                }
              },
              {
                title: 'Prazo',
                dataIndex: 'due_date',
                key: 'due',
                render: (val) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-'
              },
              {
                title: 'Prioridade',
                dataIndex: 'priority',
                key: 'priority',
                render: (p) => <Tag color={p === 'high' ? 'red' : p === 'medium' ? 'orange' : 'default'}>{p?.toUpperCase()}</Tag>
              },
              {
                title: 'Ações',
                key: 'actions',
                render: (_, t) => (
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingTask(t);
                      setTaskModalOpen(true);
                    }}
                  />
                )
              }
            ]}
          />
        </Card>
      )}

      {/* Deal Modal */}
      <DealModal
        open={dealModalOpen}
        record={editingDeal}
        defaultStageId={defaultStageForDeal}
        pipelines={pipelines}
        stages={pipelineStages}
        contacts={contacts}
        users={users}
        onCancel={() => {
          setDealModalOpen(false);
          setEditingDeal(null);
        }}
        onSuccess={onRefresh}
      />

      {/* Contact Modal */}
      <ContactModal
        open={contactModalOpen}
        record={editingContact}
        users={users}
        onCancel={() => {
          setContactModalOpen(false);
          setEditingContact(null);
        }}
        onSuccess={onRefresh}
      />

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        record={editingTask}
        deals={deals}
        contacts={contacts}
        users={users}
        onCancel={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
};
