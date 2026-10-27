import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Tabs,
  Button,
  Statistic,
  Empty,
  Space,
  Typography,
  Tag,
  Table,
  Switch,
  Popconfirm,
  message
} from 'antd';
import {
  CrownOutlined,
  CheckCircleOutlined,
  BankOutlined,
  TeamOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { PlanEditorModal } from '../components/PlanEditorModal';
import { SubscriptionAssignmentModal } from '../components/SubscriptionAssignmentModal';
import { PlanTierCard } from '../components/PlanTierCard';
import { apiRequest } from '../../../../services/api';

const { Title, Text } = Typography;

export const MainAppView = ({
  plans = [],
  subscriptions = [],
  tenants = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('plans');

  // Modals state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Statistics
  const totalPlans = plans.length;
  const activeSubscriptions = subscriptions.filter(s => s.is_active !== false).length;
  const totalTenants = tenants.length;

  const handleToggleSubscription = async (record, checked) => {
    try {
      const res = await apiRequest(`/subscriptions?id=eq.${record.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: checked })
      });
      if (res.ok) {
        message.success(checked ? 'Assinatura ativada' : 'Assinatura suspensa');
        onRefresh();
      }
    } catch {
      message.error('Erro ao atualizar status');
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      const res = await apiRequest(`/subscriptions?id=eq.${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Assinatura removida');
        onRefresh();
      }
    } catch {
      message.error('Erro ao excluir assinatura');
    }
  };

  const subscriptionColumns = [
    {
      title: 'Organização (Tenant)',
      key: 'tenant',
      render: (_, record) => {
        const t = tenants.find(item => item.id === record.tenant_id);
        return (
          <div>
            <Text strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
              <BankOutlined style={{ marginRight: 6, color: '#0284c7' }} />
              {t ? t.name : 'Tenant ' + (record.tenant_id ? record.tenant_id.slice(0, 8) : 'N/A')}
            </Text>
            {t?.slug && <Tag style={{ marginLeft: 8 }} color="blue">/{t.slug}</Tag>}
          </div>
        );
      }
    },
    {
      title: 'Plano Vinculado',
      key: 'plan',
      render: (_, record) => {
        const p = plans.find(item => item.id === record.plan_id);
        return (
          <Tag color="gold" icon={<CrownOutlined />}>
            {p ? p.name : 'Plano Desconhecido'}
          </Tag>
        );
      }
    },
    {
      title: 'Status da Assinatura',
      key: 'is_active',
      render: (_, record) => (
        <Space>
          <Switch
            size="small"
            checked={record.is_active !== false}
            onChange={(checked) => handleToggleSubscription(record, checked)}
          />
          <Text style={{ fontSize: 12 }}>
            {record.is_active !== false ? 'Ativa' : 'Suspensa'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Data de Início',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSubscription(record);
              setAssignModalOpen(true);
            }}
          />
          <Popconfirm
            title="Remover assinatura do tenant?"
            onConfirm={() => handleDeleteSubscription(record.id)}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const mainTabs = [
    {
      key: 'plans',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <CrownOutlined style={{ marginRight: 6 }} />
          Planos de Acesso
          <GlowingCount count={totalPlans} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingPlan(null);
                setPlanModalOpen(true);
              }}
            >
              Criar Novo Plano
            </Button>
          </div>

          {plans.length === 0 ? (
            <Empty description="Nenhum plano cadastrado." style={{ padding: '60px 0' }} />
          ) : (
            <Row gutter={[16, 16]}>
              {plans.map(plan => (
                <Col xs={24} sm={12} lg={8} key={plan.id}>
                  <PlanTierCard
                    plan={plan}
                    subscriptions={subscriptions}
                    onEdit={(rec) => {
                      setEditingPlan(rec);
                      setPlanModalOpen(true);
                    }}
                    onAssign={(rec) => {
                      setEditingSubscription({ plan_id: rec.id });
                      setAssignModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    },
    {
      key: 'subscriptions',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: 6 }} />
          Assinaturas dos Tenants
          <GlowingCount count={subscriptions.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                setEditingSubscription(null);
                setAssignModalOpen(true);
              }}
            >
              Vincular Tenant a um Plano
            </Button>
          </div>

          <Card
            styles={{ body: {padding: 0} }}
            style={{
              borderRadius: 12,
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              overflow: 'hidden'
            }}
          >
            <Table
              dataSource={subscriptions}
              columns={subscriptionColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top metrics */}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total de Planos</span>}
              value={totalPlans}
              prefix={<CrownOutlined style={{ color: '#f59e0b' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Assinaturas Ativas</span>}
              value={activeSubscriptions}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Tenants Cadastrados</span>}
              value={totalTenants}
              prefix={<BankOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Taxa de Ativação</span>}
              value={totalTenants > 0 ? `${Math.round((activeSubscriptions / totalTenants) * 100)}%` : '100%'}
              prefix={<TeamOutlined style={{ color: '#8b5cf6' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={mainTabs}
        size="large"
      />

      {/* Modals */}
      <PlanEditorModal
        visible={planModalOpen}
        record={editingPlan}
        onClose={() => {
          setPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSaved={() => {
          setPlanModalOpen(false);
          setEditingPlan(null);
          onRefresh();
        }}
      />

      <SubscriptionAssignmentModal
        visible={assignModalOpen}
        record={editingSubscription}
        plans={plans}
        tenants={tenants}
        onClose={() => {
          setAssignModalOpen(false);
          setEditingSubscription(null);
        }}
        onSaved={() => {
          setAssignModalOpen(false);
          setEditingSubscription(null);
          onRefresh();
        }}
      />
    </div>
  );
};
