import React from 'react';
import {
  Modal,
  Tag,
  Descriptions,
  Button,
  Space,
  Typography,
  Card,
  message
} from 'antd';
import {
  SafetyCertificateOutlined,
  CopyOutlined,
  CodeOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';

const { Text } = Typography;

export const LogDetailsModal = ({
  visible,
  log,
  onClose
}) => {
  const { isDark } = useAppTheme();

  if (!log) return null;

  const getLevelColor = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'error':
      case 'critical':
      case 'fatal':
        return 'error';
      case 'warn':
      case 'warning':
        return 'warning';
      case 'info':
        return 'processing';
      case 'debug':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    message.success('Registro de log copiado como JSON!');
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#0284c7' }} />
          <span>Evento de Auditoria: <Tag color={getLevelColor(log.level)}>{(log.level || 'INFO').toUpperCase()}</Tag></span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyJson}>
          Copiar JSON
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Fechar
        </Button>
      ]}
      destroyOnHidden
    >
      <div style={{ padding: '8px 0' }}>
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Timestamp">
            {log.created_at ? dayjs(log.created_at).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Categoria">
            <Tag color="cyan">{log.category || 'system'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="IP de Origem">
            <Text code>{log.ip_address || '127.0.0.1'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="ID do Usuário">
            <Text code>{log.user_id || 'anonymous'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tenant ID" span={2}>
            <Text code>{log.tenant_id || 'system'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="User-Agent" span={2}>
            <Text style={{ fontSize: 12 }}>{log.user_agent || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mensagem do Log" span={2}>
            <Text strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{log.message}</Text>
          </Descriptions.Item>
        </Descriptions>

        {log.data && (
          <div>
            <Text strong style={{ marginBottom: 6, display: 'block' }}>
              <CodeOutlined style={{ marginRight: 6 }} />
              Payload de Dados & Contexto (JSON):
            </Text>
            <pre style={{
              background: isDark ? '#0f172a' : '#f8fafc',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              padding: 12,
              borderRadius: 8,
              maxHeight: 280,
              overflow: 'auto',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 12,
              color: isDark ? '#38bdf8' : '#0369a1'
            }}>
              {JSON.stringify(log.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};
