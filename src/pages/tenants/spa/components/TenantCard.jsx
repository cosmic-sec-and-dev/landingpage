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
  Switch
} from 'antd';
import {
  BankOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
  CalendarOutlined,
  LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Title, Text, Paragraph } = Typography;

export const TenantCard = ({
  tenant,
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [toggling, setToggling] = useState(false);

  const handleToggleActive = async (checked) => {
    setToggling(true);
    try {
      const res = await apiRequest(`/tenants?id=eq.${tenant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: checked })
      });
      if (res.ok) {
        message.success(checked ? 'Organização ativada' : 'Organização bloqueada');
        onRefresh();
      } else {
        message.error('Falha ao alterar status');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/tenants?id=eq.${tenant.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Organização excluída');
        onRefresh();
      } else {
        message.error('Falha ao excluir organização');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(tenant.id);
    message.success('Tenant UUID copiado!');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <Tag color={tenant.is_active !== false ? 'success' : 'default'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {tenant.is_active !== false ? 'ATIVO' : 'BLOQUEADO'}
        </Tag>
        <Tag color="blue" style={{ borderRadius: 4, fontFamily: 'monospace' }}>
          /{tenant.slug || 'default'}
        </Tag>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          background: isDark ? '#0f172a' : '#e0f2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0284c7',
          fontSize: 18
        }}>
          <BankOutlined />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <Title
            level={5}
            style={{
              margin: 0,
              color: isDark ? '#f8fafc' : '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {tenant.name || 'Sem nome'}
          </Title>
          {tenant.business_name && (
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {tenant.business_name}
            </Text>
          )}
        </div>
      </div>

      {tenant.business_id && (
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IdcardOutlined /> CNPJ / Tax ID: <Text code>{tenant.business_id}</Text>
          </Text>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Space>
            <Switch
              size="small"
              checked={tenant.is_active !== false}
              loading={toggling}
              onChange={handleToggleActive}
            />
            <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
              {tenant.is_active !== false ? 'Habilitado' : 'Desabilitado'}
            </Text>
          </Space>

          <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalendarOutlined />
            {tenant.created_at ? dayjs(tenant.created_at).format('DD/MM/YYYY') : '-'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Tooltip title="Copiar Tenant ID UUID">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyId}
            />
          </Tooltip>
          <Tooltip title="Editar Organização">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => onEdit(tenant)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir organização?"
            description="Todos os dados isolados do tenant serão afetados."
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
