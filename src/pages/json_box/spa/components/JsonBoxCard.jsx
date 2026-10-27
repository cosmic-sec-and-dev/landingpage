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
  CodeOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Title, Text, Paragraph } = Typography;

export const JsonBoxCard = ({
  box,
  attachments = [],
  onEdit,
  onTestQuery,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [toggling, setToggling] = useState(false);

  const keysCount = box.data && typeof box.data === 'object' ? Object.keys(box.data).length : 0;
  const jsonString = box.data ? JSON.stringify(box.data, null, 2) : '{}';
  const dataSize = new Blob([jsonString]).size;
  const boxAttachments = attachments.filter(a => a.json_box_id === box.id && !a.is_deleted);

  const handleToggleActive = async (checked) => {
    setToggling(true);
    try {
      const res = await apiRequest(`/json_boxes?id=eq.${box.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: checked })
      });
      if (res.ok) {
        message.success(checked ? 'Documento ativado' : 'Documento desativado');
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
      const res = await apiRequest(`/json_boxes?id=eq.${box.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Documento excluído');
        onRefresh();
      } else {
        message.error('Falha ao excluir');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    message.success('JSON copiado para a área de transferência!');
  };

  const handleCopyEndpoint = () => {
    const endpoint = `/json_boxes?slug=eq.${box.slug}`;
    navigator.clipboard.writeText(endpoint);
    message.success(`Endpoint copiado: ${endpoint}`);
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
        <Tag color={box.is_active ? 'green' : 'default'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {box.is_active ? 'ATIVO' : 'INATIVO'}
        </Tag>
        <Space size={4}>
          <Tag color="cyan">{keysCount} chaves</Tag>
          <Tag color="purple">{(dataSize / 1024).toFixed(1)} KB</Tag>
        </Space>
      </div>

      <Title
        level={5}
        style={{
          marginBottom: 4,
          color: isDark ? '#f8fafc' : '#0f172a'
        }}
      >
        {box.name}
      </Title>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Tag color="blue" style={{ borderRadius: 4, fontFamily: 'monospace' }}>
          /{box.slug}
        </Tag>
        <Tooltip title="Copiar Endpoint REST">
          <Button
            size="small"
            type="text"
            icon={<LinkOutlined />}
            onClick={handleCopyEndpoint}
            style={{ padding: 0, height: 20, width: 20 }}
          />
        </Tooltip>
      </div>

      {/* Code snippet preview */}
      <div
        style={{
          background: isDark ? '#0f172a' : '#f8fafc',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 12px',
          maxHeight: 140,
          overflow: 'hidden',
          position: 'relative',
          marginBottom: 16
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            color: isDark ? '#38bdf8' : '#0284c7',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {jsonString.slice(0, 220)}
          {jsonString.length > 220 ? '...' : ''}
        </pre>
        {jsonString.length > 220 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 30,
              background: isDark
                ? 'linear-gradient(transparent, #0f172a)'
                : 'linear-gradient(transparent, #f8fafc)'
            }}
          />
        )}
      </div>

      {/* Footer controls */}
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Space>
            <Switch
              size="small"
              checked={box.is_active}
              loading={toggling}
              onChange={handleToggleActive}
            />
            <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
              {box.is_active ? 'Disponível via API' : 'Desativado'}
            </Text>
          </Space>

          {boxAttachments.length > 0 && (
            <Tag icon={<FolderOpenOutlined />} color="default">
              {boxAttachments.length} anexos
            </Tag>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Tooltip title="Copiar JSON Completo">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyJson}
            />
          </Tooltip>
          <Tooltip title="Testar Consulta / JSONPath">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<PlayCircleOutlined />}
              onClick={() => onTestQuery(box)}
            >
              Testar
            </Button>
          </Tooltip>
          <Tooltip title="Editar Documento">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(box)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir documento JSON?"
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
