import React, { useState } from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  message,
  Modal
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Title, Text, Paragraph } = Typography;

export const NotificationCard = ({
  notification,
  channel = 'push', // 'push' | 'email'
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isEmail = channel === 'email';
  const title = isEmail ? notification.subject : notification.title;
  const endpoint = isEmail ? '/email_notifications' : '/push_notifications';

  const getPriorityColor = (p) => {
    switch (p) {
      case 'urgent': return 'red';
      case 'high': return 'volcano';
      case 'low': return 'default';
      default: return 'blue';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'sent': return 'success';
      case 'pending': return 'processing';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`${endpoint}?id=eq.${notification.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Notificação excluída');
        onRefresh();
      } else {
        message.error('Falha ao excluir notificação');
      }
    } catch {
      message.error('Erro de conexão ao excluir');
    }
  };

  return (
    <>
      <Card
        hoverable
        style={{
          borderRadius: 12,
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
        }}
        styles={{ body: {padding: 18,
          display: 'flex',
          flexDirection: 'column',
          flex: 1} }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <Space>
            <Tag
              color={isEmail ? 'geekblue' : 'purple'}
              style={{ borderRadius: 6, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {isEmail ? <MailOutlined /> : <BellOutlined />}
              {isEmail ? 'E-MAIL' : 'PUSH'}
            </Tag>
            <Tag color={getPriorityColor(notification.priority)} style={{ borderRadius: 6, textTransform: 'uppercase', fontSize: 11 }}>
              {notification.priority || 'NORMAL'}
            </Tag>
          </Space>

          <Tag color={getStatusColor(notification.status)} style={{ borderRadius: 6, textTransform: 'uppercase', fontSize: 11 }}>
            {notification.status || 'SENT'}
          </Tag>
        </div>

        <Title
          level={5}
          style={{
            marginBottom: 6,
            color: isDark ? '#f8fafc' : '#0f172a'
          }}
        >
          {title}
        </Title>

        <Paragraph
          ellipsis={{ rows: 3 }}
          style={{
            fontSize: 13,
            color: isDark ? '#94a3b8' : '#64748b',
            marginBottom: 12,
            flex: 1
          }}
        >
          {notification.body}
        </Paragraph>

        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClockCircleOutlined />
              {notification.created_at ? dayjs(notification.created_at).format('DD/MM/YYYY HH:mm') : 'Recente'}
            </span>

            <Tag color="cyan" style={{ borderRadius: 4, fontSize: 11 }}>
              {notification.target_type || 'broadcast'}
            </Tag>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            {notification.action_url && (
              <Tooltip title={`URL: ${notification.action_url}`}>
                <Button
                  size="small"
                  type="text"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(notification.action_url, '_blank')}
                />
              </Tooltip>
            )}
            <Tooltip title="Ver Detalhes / Payload">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setDetailsOpen(true)}
              />
            </Tooltip>
            <Tooltip title="Editar Notificação">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit({ ...notification, _channel: channel })}
              />
            </Tooltip>
            <Popconfirm
              title="Excluir notificação?"
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
          </div>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal
        title={`Detalhes do Disparo: ${title}`}
        open={detailsOpen}
        onCancel={() => setDetailsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsOpen(false)}>
            Fechar
          </Button>
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <p><strong>Canal:</strong> <Tag color={isEmail ? 'geekblue' : 'purple'}>{isEmail ? 'E-mail' : 'Push'}</Tag></p>
          <p><strong>Destinatário (Target):</strong> <Tag color="cyan">{notification.target_type || 'broadcast'}</Tag></p>
          <p><strong>Prioridade:</strong> <Tag color={getPriorityColor(notification.priority)}>{notification.priority || 'normal'}</Tag></p>
          <p><strong>Status:</strong> <Tag color={getStatusColor(notification.status)}>{notification.status || 'sent'}</Tag></p>
          {notification.action_url && (
            <p><strong>Action URL:</strong> <a href={notification.action_url} target="_blank" rel="noreferrer">{notification.action_url}</a></p>
          )}
          {notification.icon_url && (
            <p><strong>Ícone:</strong> {notification.icon_url}</p>
          )}
          <div style={{ marginTop: 12 }}>
            <strong>Corpo da Mensagem:</strong>
            <pre style={{
              background: isDark ? '#0f172a' : '#f8fafc',
              padding: 12,
              borderRadius: 8,
              marginTop: 6,
              whiteSpace: 'pre-wrap'
            }}>
              {notification.body}
            </pre>
          </div>

          {notification.data_json && (
            <div style={{ marginTop: 12 }}>
              <strong>Payload JSON:</strong>
              <pre style={{
                background: isDark ? '#0f172a' : '#f8fafc',
                padding: 12,
                borderRadius: 8,
                marginTop: 6,
                fontSize: 12
              }}>
                {JSON.stringify(notification.data_json, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
