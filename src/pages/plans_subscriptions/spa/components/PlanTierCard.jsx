import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  message
} from 'antd';
import {
  CrownOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Title, Text, Paragraph } = Typography;

export const PlanTierCard = ({
  plan,
  subscriptions = [],
  onEdit,
  onAssign,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const planSubscriptions = subscriptions.filter(s => s.plan_id === plan.id && s.is_active !== false);
  const subscribersCount = planSubscriptions.length;

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/plans?id=eq.${plan.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Plano excluído com sucesso');
        onRefresh();
      } else {
        message.error('Falha ao excluir plano');
      }
    } catch {
      message.error('Erro de conexão ao excluir');
    }
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.04)'
      }}
      styles={{ body: {padding: 20,
        display: 'flex',
        flexDirection: 'column',
        flex: 1} }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Tag
          color={plan.is_active !== false ? 'gold' : 'default'}
          icon={<CrownOutlined />}
          style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}
        >
          {plan.is_active !== false ? 'PLANO ATIVO' : 'DESATIVADO'}
        </Tag>

        <Tag color="cyan" icon={<TeamOutlined />}>
          {subscribersCount} assinantes
        </Tag>
      </div>

      <Title
        level={4}
        style={{
          margin: '0 0 8px 0',
          color: isDark ? '#f8fafc' : '#0f172a'
        }}
      >
        {plan.name}
      </Title>

      <Paragraph
        ellipsis={{ rows: 3 }}
        style={{
          fontSize: 13,
          color: isDark ? '#94a3b8' : '#64748b',
          marginBottom: 16,
          flex: 1
        }}
      >
        {plan.description || 'Plano de assinatura multi-tenant com acesso modular flexível.'}
      </Paragraph>

      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="small"
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => onAssign(plan)}
          >
            Vincular Tenant
          </Button>

          <Space size={4}>
            <Tooltip title="Editar Plano">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(plan)}
              />
            </Tooltip>
            <Popconfirm
              title="Excluir este plano?"
              description="Tenants vinculados podem perder acesso aos applets."
              okText="Sim"
              cancelText="Não"
              onConfirm={handleDelete}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        </div>
      </div>
    </Card>
  );
};
