import React from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Descriptions,
  Badge
} from 'antd';
import {
  BankOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { usePlan } from '../../../../context/PlanContext';

const { Title, Text } = Typography;

export const TenantMembershipCard = ({ profile }) => {
  const { isDark } = useAppTheme();
  const { currentPlan } = usePlan();

  return (
    <Card
      title={
        <Space>
          <BankOutlined style={{ color: '#0284c7' }} />
          <span>Organização & Permissões do Tenant</span>
        </Space>
      }
      style={{
        borderRadius: 16,
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0'
      }}
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Plano Ativo">
          <Tag color="gold" icon={<CrownOutlined />}>
            {currentPlan?.name || 'Enterprise Multi-Tenant'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Nível de Autorização (RBAC)">
          <Tag color="purple">{profile?.role || 'Administrator'}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Status de Isolamento">
          <Badge status="processing" text="RLS Multi-Tenant Ativo (PostgreSQL Row Level Security)" />
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
