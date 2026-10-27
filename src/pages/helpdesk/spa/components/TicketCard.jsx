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
  message
} from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  CommentOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TICKET_STATUS_CONFIG, TICKET_PRIORITIES } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title, Paragraph } = Typography;

export const TicketCard = ({
  ticket,
  users = [],
  departments = [],
  categories = [],
  messagesCount = 0,
  onOpenThread,
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const requester = users.find(u => u.id === ticket.requester_user_id);
  const agent = users.find(u => u.id === ticket.assigned_agent_id);
  const dept = departments.find(d => d.id === ticket.department_id);
  const cat = categories.find(c => c.id === ticket.category_id);

  const statusConfig = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.open;
  const priorityConfig = TICKET_PRIORITIES[ticket.priority] || TICKET_PRIORITIES.medium;

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await apiRequest(`/helpdesk_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
      });
      if (res.ok) {
        message.success(`Status alterado para ${TICKET_STATUS_CONFIG[newStatus]?.label || newStatus}`);
        onRefresh();
      } else {
        message.error('Erro ao atualizar chamado');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/helpdesk_tickets?id=eq.${ticket.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Chamado excluído');
        onRefresh();
      } else {
        message.error('Erro ao excluir chamado');
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  const statusItems = [
    { key: 'open', label: 'Marcar como ABERTO', onClick: () => handleUpdateStatus('open') },
    { key: 'pending', label: 'Marcar como PENDENTE', onClick: () => handleUpdateStatus('pending') },
    { key: 'resolved', label: 'Marcar como RESOLVIDO', icon: <CheckCircleOutlined style={{ color: '#22c55e' }} />, onClick: () => handleUpdateStatus('resolved') },
    { key: 'closed', label: 'Fechar Chamado', onClick: () => handleUpdateStatus('closed') }
  ];

  return (
    <Card
      hoverable
      style={{
        borderRadius: 14,
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
      styles={{ body: {padding: 16} }}
    >
      <div>
        {/* Header Tag and Priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Space>
            <Tag color="geekblue" style={{ borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
              {ticket.ticket_number}
            </Tag>
            <Tag color={priorityConfig.color} style={{ borderRadius: 6, fontSize: 11 }}>
              {priorityConfig.label}
            </Tag>
          </Space>

          <Tag color={statusConfig.color} style={{ borderRadius: 6, textTransform: 'uppercase', fontSize: 10 }}>
            {statusConfig.label}
          </Tag>
        </div>

        {/* Subject */}
        <Title
          level={5}
          style={{
            marginBottom: 8,
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: 15,
            cursor: 'pointer'
          }}
          onClick={() => onOpenThread(ticket)}
        >
          {ticket.subject}
        </Title>

        {/* Description snippet */}
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{
            fontSize: 13,
            color: isDark ? '#94a3b8' : '#64748b',
            marginBottom: 12
          }}
        >
          {ticket.description}
        </Paragraph>

        {/* Details: Requester & Dept */}
        <div style={{
          padding: '8px 10px',
          background: isDark ? '#0f172a' : '#f8fafc',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 12,
          color: isDark ? '#94a3b8' : '#64748b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>👤 {requester ? (requester.full_name || requester.email) : 'Solicitante'}</span>
            {dept && <Tag style={{ margin: 0, fontSize: 10 }}>{dept.name}</Tag>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🎧 {agent ? (agent.full_name || agent.email) : 'Não atribuído'}</span>
            <span>📅 {dayjs(ticket.created_at).format('DD/MM HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        <Button
          size="small"
          type="primary"
          icon={<CommentOutlined />}
          onClick={() => onOpenThread(ticket)}
        >
          Conversa ({messagesCount})
        </Button>

        <Space size="small">
          <Dropdown menu={{ items: statusItems }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(ticket)} />
          </Tooltip>
          <Popconfirm title="Remover chamado?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
