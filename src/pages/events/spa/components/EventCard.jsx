import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  Badge,
  message
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { EVENT_STATUS_CONFIG, LOCATION_TYPE_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title, Paragraph } = Typography;

export const EventCard = ({
  event,
  tiers = [],
  tickets = [],
  onEdit,
  onOpenCheckIn,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const statusCfg = EVENT_STATUS_CONFIG[event.status] || EVENT_STATUS_CONFIG.draft;
  const locCfg = LOCATION_TYPE_CONFIG[event.location_type] || LOCATION_TYPE_CONFIG.physical;

  const eventTiers = tiers.filter(t => t.event_id === event.id);
  const eventTickets = tickets.filter(t => t.event_id === event.id);
  const checkedInCount = eventTickets.filter(t => t.status === 'checked_in').length;

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/event_posts?id=eq.${event.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Evento excluído com sucesso');
        onRefresh();
      } else {
        message.error('Erro ao excluir evento');
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

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
      styles={{ body: {padding: 18} }}
    >
      <div>
        {/* Header Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Tag color={locCfg.color} style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
            {locCfg.icon} {locCfg.label}
          </Tag>
          <Tag color={statusCfg.color} style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
            {statusCfg.label}
          </Tag>
        </div>

        {/* Title */}
        <Title
          level={5}
          style={{
            marginBottom: 8,
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: 16
          }}
        >
          {event.title}
        </Title>

        {/* Date / Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: isDark ? '#94a3b8' : '#64748b',
          marginBottom: 6
        }}>
          <CalendarOutlined style={{ color: '#0284c7' }} />
          <span>
            {dayjs(event.start_date).format('DD/MM/YYYY HH:mm')} - {dayjs(event.end_date).format('HH:mm')}
          </span>
        </div>

        {/* Description */}
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: 12,
            marginBottom: 14,
            minHeight: 36
          }}
        >
          {event.description}
        </Paragraph>

        {/* Stats strip */}
        <div style={{
          padding: '8px 12px',
          background: isDark ? '#0f172a' : '#f8fafc',
          borderRadius: 8,
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12
        }}>
          <div>
            <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Lotes: </span>
            <strong>{eventTiers.length}</strong>
          </div>
          <div>
            <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Ingressos: </span>
            <strong>{eventTickets.length}</strong>
          </div>
          <div>
            <span style={{ color: '#10b981' }}>Check-in: </span>
            <strong>{checkedInCount}</strong>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        <Button
          size="small"
          icon={<QrcodeOutlined />}
          onClick={() => onOpenCheckIn(event)}
        >
          Credenciamento
        </Button>

        <Space size="small">
          <Tooltip title="Editar Evento">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(event)} />
          </Tooltip>
          <Popconfirm title="Remover este evento?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
