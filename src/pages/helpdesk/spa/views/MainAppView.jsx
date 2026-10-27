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
  Divider,
  Popconfirm,
  message
} from 'antd';
import {
  CustomerServiceOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  BookOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LikeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { TicketCard } from '../components/TicketCard';
import { TicketModal } from '../components/TicketModal';
import { TicketThreadDrawer } from '../components/TicketThreadDrawer';
import { TICKET_STATUS_CONFIG, TICKET_PRIORITIES } from '../schemaConfig';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;

export const MainAppView = ({
  tickets = [],
  messages = [],
  departments = [],
  categories = [],
  slaPolicies = [],
  knowledgeArticles = [],
  cannedResponses = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('tickets');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Drawers
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [threadDrawerOpen, setThreadDrawerOpen] = useState(false);
  const [activeThreadTicket, setActiveThreadTicket] = useState(null);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (departmentFilter !== 'all' && t.department_id !== departmentFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = (t.subject || '').toLowerCase().includes(q);
      const matchNumber = (t.ticket_number || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      if (!matchSubject && !matchNumber && !matchDesc) return false;
    }

    return true;
  });

  // Metrics
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const pendingTicketsCount = tickets.filter(t => t.status === 'pending').length;
  const resolvedTicketsCount = tickets.filter(t => t.status === 'resolved').length;
  const urgentTicketsCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      {/* Metrics Row */}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Chamados Abertos</span>}
              value={openTicketsCount}
              prefix={<CustomerServiceOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Aguardando Retorno</span>}
              value={pendingTicketsCount}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Resolvidos</span>}
              value={resolvedTicketsCount}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Urgentes em Aberto</span>}
              value={urgentTicketsCount}
              prefix={<ThunderboltOutlined style={{ color: '#ef4444' }} />}
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
            key: 'tickets',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <CustomerServiceOutlined style={{ marginRight: 6 }} />
                Fila de Chamados
                <GlowingCount count={tickets.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'kb',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <BookOutlined style={{ marginRight: 6 }} />
                Base de Conhecimento
                <GlowingCount count={knowledgeArticles.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'departments',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FolderOpenOutlined style={{ marginRight: 6 }} />
                Departamentos & Filas
                <GlowingCount count={departments.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'canned',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ThunderboltOutlined style={{ marginRight: 6 }} />
                Respostas Rápidas
                <GlowingCount count={cannedResponses.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
              </span>
            )
          }
        ]}
      />

      {/* View 1: Fila de Chamados */}
      {activeTab === 'tickets' && (
        <>
          {/* Toolbar */}
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
              <Col xs={24} lg={15}>
                <Space wrap>
                  <Radio.Group
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    buttonStyle="solid"
                    size="middle"
                  >
                    <Radio.Button value="all">Todos</Radio.Button>
                    <Radio.Button value="open">Abertos</Radio.Button>
                    <Radio.Button value="pending">Pendentes</Radio.Button>
                    <Radio.Button value="resolved">Resolvidos</Radio.Button>
                  </Radio.Group>

                  <Select
                    placeholder="Prioridade"
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    style={{ minWidth: 120 }}
                  >
                    <Select.Option value="all">Todas Prioridades</Select.Option>
                    <Select.Option value="urgent">🚨 Urgente</Select.Option>
                    <Select.Option value="high">🔥 Alta</Select.Option>
                    <Select.Option value="medium">⚡ Média</Select.Option>
                    <Select.Option value="low">☕ Baixa</Select.Option>
                  </Select>

                  <Select
                    placeholder="Departamento"
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                    style={{ minWidth: 150 }}
                  >
                    <Select.Option value="all">Todos Departamentos</Select.Option>
                    {departments.map(d => (
                      <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                    ))}
                  </Select>
                </Space>
              </Col>

              <Col xs={24} lg={9}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar ticket ou assunto..."
                    allowClear
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 190 }}
                  />
                  <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingTicket(null);
                      setTicketModalOpen(true);
                    }}
                  >
                    Novo Chamado
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Tickets Cards Grid */}
          {filteredTickets.length === 0 ? (
            <Empty
              description="Nenhum chamado de suporte encontrado com os filtros selecionados."
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingTicket(null);
                  setTicketModalOpen(true);
                }}
              >
                Abrir Primeiro Chamado
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredTickets.map(ticket => {
                const count = messages.filter(m => m.ticket_id === ticket.id).length;
                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={ticket.id}>
                    <TicketCard
                      ticket={ticket}
                      users={users}
                      departments={departments}
                      categories={categories}
                      messagesCount={count}
                      onOpenThread={(t) => {
                        setActiveThreadTicket(t);
                        setThreadDrawerOpen(true);
                      }}
                      onEdit={(t) => {
                        setEditingTicket(t);
                        setTicketModalOpen(true);
                      }}
                      onRefresh={onRefresh}
                    />
                  </Col>
                );
              })}
            </Row>
          )}
        </>
      )}

      {/* View 2: Base de Conhecimento */}
      {activeTab === 'kb' && (
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
              Artigos da Base de Conhecimento & FAQs
            </Title>
          </div>

          <Row gutter={[16, 16]}>
            {knowledgeArticles.map(article => (
              <Col xs={24} sm={12} md={8} key={article.id}>
                <Card
                  hoverable
                  style={{
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: 12,
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    height: '100%'
                  }}
                  styles={{ body: {padding: 16} }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Tag color="cyan">Artigo KB</Tag>
                    <span style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8' }}>
                      <EyeOutlined /> {article.views_count || 0} views
                    </span>
                  </div>

                  <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a', display: 'block', marginBottom: 6 }}>
                    {article.title}
                  </Text>

                  <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                    {article.summary || article.content_rich_text}
                  </Paragraph>
                </Card>
              </Col>
            ))}

            {knowledgeArticles.length === 0 && (
              <Col span={24}>
                <Empty description="Nenhum artigo de conhecimento cadastrado." />
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* View 3: Departamentos */}
      {activeTab === 'departments' && (
        <Row gutter={[16, 16]}>
          {departments.map(d => (
            <Col xs={24} sm={12} md={8} key={d.id}>
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
                  <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a' }}>{d.name}</Text>
                  <Tag color={d.is_active ? 'green' : 'default'}>{d.is_active ? 'Ativo' : 'Inativo'}</Tag>
                </div>
                <Paragraph style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                  {d.description || 'Fila de atendimento especializada.'}
                </Paragraph>
                {d.email_inbox && (
                  <Text style={{ fontSize: 12, color: '#0284c7', display: 'block', marginTop: 8 }}>
                    📬 {d.email_inbox}
                  </Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* View 4: Canned Responses */}
      {activeTab === 'canned' && (
        <Card
          variant="borderless"
          style={{
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 12,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          styles={{ body: {padding: 20} }}
        >
          <Table
            dataSource={cannedResponses}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            columns={[
              {
                title: 'Título do Macro',
                dataIndex: 'title',
                key: 'title',
                render: (val, r) => <strong>{val} {r.shortcut_code ? <Tag color="blue">{r.shortcut_code}</Tag> : ''}</strong>
              },
              {
                title: 'Conteúdo do Template',
                dataIndex: 'body_content',
                key: 'content',
                render: (val) => <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 12 }}>{val}</Paragraph>
              },
              {
                title: 'Compartilhado',
                dataIndex: 'is_shared',
                key: 'shared',
                render: (val) => <Tag color={val ? 'green' : 'default'}>{val ? 'Toda Equipe' : 'Privado'}</Tag>
              }
            ]}
          />
        </Card>
      )}

      {/* Ticket Modal */}
      <TicketModal
        open={ticketModalOpen}
        record={editingTicket}
        departments={departments}
        categories={categories}
        slaPolicies={slaPolicies}
        users={users}
        onCancel={() => {
          setTicketModalOpen(false);
          setEditingTicket(null);
        }}
        onSuccess={onRefresh}
      />

      {/* Thread Drawer */}
      <TicketThreadDrawer
        open={threadDrawerOpen}
        ticket={activeThreadTicket}
        messages={messages}
        cannedResponses={cannedResponses}
        users={users}
        departments={departments}
        currentUser={currentUser}
        onClose={() => {
          setThreadDrawerOpen(false);
          setActiveThreadTicket(null);
        }}
        onRefresh={onRefresh}
      />
    </div>
  );
};
