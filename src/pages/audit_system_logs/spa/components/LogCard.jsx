import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip
} from 'antd';
import {
  EyeOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  UserOutlined,
  BugOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';

const { Text, Paragraph } = Typography;

export const LogCard = ({
  log,
  onViewDetails
}) => {
  const { isDark } = useAppTheme();

  const getLevelBadge = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'error':
      case 'critical':
      case 'fatal':
        return <Tag color="error" icon={<CloseCircleOutlined />}>ERROR</Tag>;
      case 'warn':
      case 'warning':
        return <Tag color="warning" icon={<WarningOutlined />}>WARN</Tag>;
      case 'info':
        return <Tag color="processing" icon={<InfoCircleOutlined />}>INFO</Tag>;
      case 'debug':
        return <Tag color="default" icon={<BugOutlined />}>DEBUG</Tag>;
      default:
        return <Tag color="default">LOG</Tag>;
    }
  };

  return (
    <Card
      hoverable
      onClick={() => onViewDetails(log)}
      style={{
        borderRadius: 12,
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer'
      }}
      styles={{ body: {padding: 16,
        display: 'flex',
        flexDirection: 'column',
        flex: 1} }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Space>
          {getLevelBadge(log.level)}
          <Tag color="cyan">{log.category || 'system'}</Tag>
        </Space>

        <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockCircleOutlined />
          {log.created_at ? dayjs(log.created_at).format('HH:mm:ss') : '-'}
        </span>
      </div>

      <Paragraph
        ellipsis={{ rows: 2 }}
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: isDark ? '#f8fafc' : '#0f172a',
          marginBottom: 10,
          flex: 1
        }}
      >
        {log.message}
      </Paragraph>

      <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <GlobalOutlined /> {log.ip_address || '127.0.0.1'}
          </Text>

          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(log);
            }}
          >
            Inspecionar
          </Button>
        </div>
      </div>
    </Card>
  );
};
