import React, { useState } from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  Progress,
  message
} from 'antd';
import {
  NotificationOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Title, Text, Paragraph } = Typography;

export const CampaignCard = ({
  campaign,
  contacts = [],
  onEdit,
  onViewLeads,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const campaignContacts = contacts.filter(c => c.campaign_id === campaign.id);
  const totalContacts = campaignContacts.length;
  const readContacts = campaignContacts.filter(c => c.read).length;
  const openRate = totalContacts > 0 ? Math.round((readContacts / totalContacts) * 100) : 0;

  const getStatusColor = (s) => {
    switch (s) {
      case 'active': return 'success';
      case 'completed': return 'blue';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'urgent': return 'red';
      case 'high': return 'volcano';
      case 'low': return 'default';
      default: return 'blue';
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/campaigns?id=eq.${campaign.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Campanha excluída');
        onRefresh();
      } else {
        message.error('Falha ao excluir campanha');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Tag color={getStatusColor(campaign.status)} style={{ borderRadius: 6, fontWeight: 600, textTransform: 'uppercase' }}>
          {campaign.status || 'ACTIVE'}
        </Tag>
        <Space size={4}>
          <Tag color="cyan">{campaign.target_type || 'leads'}</Tag>
          <Tag color={getPriorityColor(campaign.priority)}>{campaign.priority || 'normal'}</Tag>
        </Space>
      </div>

      <Title
        level={5}
        style={{
          marginBottom: 6,
          color: isDark ? '#f8fafc' : '#0f172a'
        }}
      >
        {campaign.subject}
      </Title>

      <Paragraph
        ellipsis={{ rows: 2 }}
        style={{
          fontSize: 13,
          color: isDark ? '#94a3b8' : '#64748b',
          marginBottom: 12,
          flex: 1
        }}
      >
        {campaign.body}
      </Paragraph>

      {/* Leads and Open Rate */}
      <div
        style={{
          background: isDark ? '#0f172a' : '#f8fafc',
          padding: '10px 12px',
          borderRadius: 8,
          marginBottom: 14
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
            <TeamOutlined style={{ marginRight: 4 }} />
            {totalContacts} destinatários
          </Text>
          <Text style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>
            {openRate}% Abertura
          </Text>
        </div>
        <Progress
          percent={openRate}
          showInfo={false}
          strokeColor="#10b981"
          trailColor={isDark ? '#334155' : '#e2e8f0'}
          size="small"
        />
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalendarOutlined />
            {campaign.start_date ? dayjs(campaign.start_date).format('DD/MM/YYYY') : 'Imediato'}
          </span>

          {campaign.action_url && (
            <Tooltip title={campaign.action_url}>
              <Button
                size="small"
                type="text"
                icon={<LinkOutlined />}
                onClick={() => window.open(campaign.action_url, '_blank')}
              />
            </Tooltip>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<TeamOutlined />}
            onClick={() => onViewLeads(campaign)}
          >
            Leads ({totalContacts})
          </Button>
          <Tooltip title="Editar Campanha">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(campaign)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir campanha?"
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
  );
};
