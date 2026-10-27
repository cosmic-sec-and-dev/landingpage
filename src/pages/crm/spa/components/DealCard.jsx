import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  Dropdown,
  Progress,
  message
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { DEAL_STATUS_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title } = Typography;

export const DealCard = ({
  deal,
  stages = [],
  contacts = [],
  users = [],
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const contact = contacts.find(c => c.id === deal.contact_id);
  const assigned = users.find(u => u.id === deal.assigned_user_id);
  const currentStage = stages.find(s => s.id === deal.stage_id);

  const statusConfig = DEAL_STATUS_CONFIG[deal.status] || DEAL_STATUS_CONFIG.open;

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await apiRequest(`/deals?id=eq.${deal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        message.success(`Status alterado para ${DEAL_STATUS_CONFIG[newStatus]?.label || newStatus}`);
        onRefresh();
      } else {
        message.error('Erro ao atualizar oportunidade');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  const handleMoveStage = async (nextStageId) => {
    try {
      const res = await apiRequest(`/deals?id=eq.${deal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage_id: nextStageId })
      });
      if (res.ok) {
        message.success('Oportunidade movida de etapa!');
        onRefresh();
      } else {
        message.error('Erro ao mover oportunidade');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/deals?id=eq.${deal.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Oportunidade removida');
        onRefresh();
      } else {
        message.error('Erro ao excluir oportunidade');
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  const moveStageItems = stages.map(s => ({
    key: s.id,
    label: `Mover para: ${s.name}`,
    disabled: s.id === deal.stage_id,
    onClick: () => handleMoveStage(s.id)
  }));

  const statusItems = [
    { key: 'won', label: 'Marcar como GANHO (Vendido)', icon: <CheckCircleOutlined style={{ color: '#22c55e' }} />, onClick: () => handleUpdateStatus('won') },
    { key: 'lost', label: 'Marcar como PERDIDO', icon: <CloseCircleOutlined style={{ color: '#ef4444' }} />, onClick: () => handleUpdateStatus('lost') },
    { key: 'open', label: 'Reabrir Oportunidade', icon: <DollarOutlined style={{ color: '#0284c7' }} />, onClick: () => handleUpdateStatus('open') }
  ];

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        marginBottom: 12,
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)'
      }}
      styles={{ body: {padding: 14} }}
    >
      {/* Top title & status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <Text strong style={{ fontSize: 14, color: isDark ? '#f8fafc' : '#0f172a', flex: 1, marginRight: 8 }}>
          {deal.title}
        </Text>
        <Tag color={statusConfig.color} style={{ borderRadius: 6, fontSize: 10, textTransform: 'uppercase', margin: 0 }}>
          {statusConfig.label}
        </Tag>
      </div>

      {/* Amount & Contact */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
          R$ {Number(deal.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        {contact && (
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
            👤 {contact.first_name} {contact.last_name} {contact.company_name ? `(${contact.company_name})` : ''}
          </div>
        )}
      </div>

      {/* Probability bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', marginBottom: 2 }}>
          <span>Probabilidade:</span>
          <span>{deal.probability}%</span>
        </div>
        <Progress
          percent={deal.probability}
          size="small"
          showInfo={false}
          strokeColor={deal.probability >= 70 ? '#10b981' : deal.probability >= 40 ? '#0284c7' : '#f59e0b'}
        />
      </div>

      {/* Expected Close Date & Assigned */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', marginBottom: 12 }}>
        <span>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {deal.expected_close_date ? dayjs(deal.expected_close_date).format('DD/MM/YYYY') : 'Sem data'}
        </span>
        {assigned && (
          <span>
            <UserOutlined style={{ marginRight: 4 }} />
            {assigned.full_name || assigned.email}
          </span>
        )}
      </div>

      {/* Action Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        <Dropdown menu={{ items: moveStageItems }} trigger={['click']}>
          <Button size="small" type="text" icon={<RightOutlined />}>
            Etapa
          </Button>
        </Dropdown>

        <Space size="small">
          <Dropdown menu={{ items: statusItems }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(deal)} />
          </Tooltip>
          <Popconfirm title="Excluir negócio?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
