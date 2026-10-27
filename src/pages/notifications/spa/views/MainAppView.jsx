import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Radio,
  Button,
  Statistic,
  Empty,
  Space,
  Typography,
  Tag,
  Tabs
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  SendOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { SendNotificationModal } from '../components/SendNotificationModal';
import { NotificationCard } from '../components/NotificationCard';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  pushNotifications = [],
  emailNotifications = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [channelFilter, setChannelFilter] = useState('all'); // 'all' | 'push' | 'email'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'urgent' | 'high' | 'normal'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [defaultSendChannel, setDefaultSendChannel] = useState('push');

  // Statistics
  const totalPush = pushNotifications.length;
  const totalEmail = emailNotifications.length;
  const totalDispatches = totalPush + totalEmail;
  const urgentCount = [...pushNotifications, ...emailNotifications].filter(n => n.priority === 'urgent').length;
  const highCount = [...pushNotifications, ...emailNotifications].filter(n => n.priority === 'high').length;

  // Combine and sort
  const combinedNotifications = [
    ...pushNotifications.map(p => ({ ...p, _channel: 'push' })),
    ...emailNotifications.map(e => ({ ...e, _channel: 'email' }))
  ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  // Filter
  const filteredNotifications = combinedNotifications.filter(item => {
    if (channelFilter !== 'all' && item._channel !== channelFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || item.subject || '').toLowerCase().includes(q);
      const matchBody = (item.body || '').toLowerCase().includes(q);
      const matchTarget = (item.target_type || '').toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchTarget) return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total Disparos</span>}
              value={totalDispatches}
              prefix={<SendOutlined style={{ color: '#0284c7' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Push Notifications</span>}
              value={totalPush}
              prefix={<BellOutlined style={{ color: '#8b5cf6' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>E-mails Transacionais</span>}
              value={totalEmail}
              prefix={<MailOutlined style={{ color: '#0284c7' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Alta Prioridade / Urgentes</span>}
              value={urgentCount + highCount}
              prefix={<ThunderboltOutlined style={{ color: '#ef4444' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Status Operacional</span>}
              value="100%"
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card
        variant="borderless"
        style={{
          marginBottom: 24,
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderRadius: 12,
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
        }}
        styles={{ body: {padding: '14px 20px'} }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12}>
            <Space wrap>
              <Radio.Group
                value={channelFilter}
                onChange={e => setChannelFilter(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="all">Todos ({totalDispatches})</Radio.Button>
                <Radio.Button value="push"><BellOutlined /> Push ({totalPush})</Radio.Button>
                <Radio.Button value="email"><MailOutlined /> E-mails ({totalEmail})</Radio.Button>
              </Radio.Group>

              <Radio.Group
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                buttonStyle="outline"
                size="small"
              >
                <Radio.Button value="all">Todas Prioridades</Radio.Button>
                <Radio.Button value="urgent">Urgente</Radio.Button>
                <Radio.Button value="high">Alta</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Search
                placeholder="Buscar por título, assunto ou mensagem..."
                allowClear
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: 220 }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingNotification(null);
                  setDefaultSendChannel(channelFilter === 'email' ? 'email' : 'push');
                  setSendModalOpen(true);
                }}
              >
                Disparar Notificação
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid of Notification Cards */}
      {filteredNotifications.length === 0 ? (
        <Empty
          description="Nenhuma notificação encontrada no histórico."
          style={{ padding: '60px 0' }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingNotification(null);
              setSendModalOpen(true);
            }}
          >
            Disparar Primeira Notificação
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredNotifications.map(notification => (
            <Col xs={24} sm={12} lg={8} xl={6} key={`${notification._channel}-${notification.id}`}>
              <NotificationCard
                notification={notification}
                channel={notification._channel}
                onEdit={(rec) => {
                  setEditingNotification(rec);
                  setSendModalOpen(true);
                }}
                onRefresh={onRefresh}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Send / Edit Modal */}
      <SendNotificationModal
        visible={sendModalOpen}
        record={editingNotification}
        defaultChannel={defaultSendChannel}
        onClose={() => {
          setSendModalOpen(false);
          setEditingNotification(null);
        }}
        onSaved={() => {
          setSendModalOpen(false);
          setEditingNotification(null);
          onRefresh();
        }}
      />
    </div>
  );
};
