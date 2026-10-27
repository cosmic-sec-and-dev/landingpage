import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip, Empty } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppTheme } from '../../context/ThemeContext';

const { Text } = Typography;

const HIDDEN_COLUMNS = [
  'tenant_id',
  'password',
  'password_hash',
  'content_rich_text',
  'content_raw_html',
  'content_markdown'
];

export const DynamicTable = ({
  columnsConfig = [],
  fieldsConfig = [],
  dataSource = [],
  data = [],
  loading = false,
  pagination = {},
  onChange = () => {},
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onAdd = null,
  isAuditLogs = false
}) => {
  const { isDark } = useAppTheme();
  const defaultPageSize = isAuditLogs ? 999 : 50;
  const [currentPage, setCurrentPage] = useState(pagination?.current || 1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || defaultPageSize);

  const actualColumns = columnsConfig && columnsConfig.length > 0 ? columnsConfig : (fieldsConfig || []);
  const actualData = dataSource && dataSource.length > 0 ? dataSource : (data || []);

  const visibleColumns = actualColumns.filter(col => !HIDDEN_COLUMNS.includes(col.name.toLowerCase()));

  const tableColumns = visibleColumns.map(col => ({
    title: col.name.replace(/_/g, ' ').toUpperCase(),
    dataIndex: col.name,
    key: col.name,
    sorter: (a, b) => {
      const valA = a[col.name];
      const valB = b[col.name];
      if (valA === null || valA === undefined) return -1;
      if (valB === null || valB === undefined) return 1;
      if (typeof valA === 'number') return valA - valB;
      return String(valA).localeCompare(String(valB));
    },
    render: (val, record) => {
      if (val === null || val === undefined || val === '') {
        return <Text type="secondary" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>-</Text>;
      }
      if (typeof val === 'boolean') {
        return <Tag color={val ? 'success' : 'error'}>{val ? 'Sim' : 'Não'}</Tag>;
      }
      if (col.format === 'uuid' || (typeof val === 'string' && val.length === 36 && val.includes('-'))) {
        const isPrimaryId = col.name.toLowerCase() === 'id';
        return (
          <Space size="small" align="center">
            {isPrimaryId && (
              <Tooltip title="Visualizar Detalhes">
                <Button
                  size="small"
                  type="text"
                  icon={<EyeOutlined style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(record);
                  }}
                  style={{
                    background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#e0f2fe',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : '#bae6fd'
                  }}
                />
              </Tooltip>
            )}
            <Tag color="purple" style={{ border: isDark ? '1px solid rgba(192, 132, 252, 0.3)' : '1px solid #d8b4fe', background: isDark ? 'rgba(192, 132, 252, 0.1)' : '#faf5ff' }}>
              {String(val).slice(0, 8)}...
            </Tag>
            <Tooltip title="Copiar UUID">
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined style={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(val);
                }}
              />
            </Tooltip>
          </Space>
        );
      }
      if (col.format === 'date-time' || (typeof val === 'string' && val.includes('T') && val.endsWith('Z'))) {
        try {
          return (
            <span style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
              {new Date(val).toLocaleString('pt-BR')}
            </span>
          );
        } catch {
          return <span style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{String(val)}</span>;
        }
      }
      if (typeof val === 'object') {
        return <Tag color="cyan" style={{ border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #7dd3fc', background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#f0f9ff' }}>JSON</Tag>;
      }
      return <span style={{ color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: 450 }}>{String(val)}</span>;
    }
  }));

  // Coluna de Ações
  tableColumns.push({
    title: 'AÇÕES',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Visualizar Detalhes">
          <Button
            size="small"
            icon={<EyeOutlined style={{ color: isDark ? '#e2e8f0' : '#334155' }} />}
            onClick={() => onView(record)}
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'
            }}
          />
        </Tooltip>
        <Tooltip title="Editar">
          <Button
            size="small"
            icon={<EditOutlined style={{ color: isDark ? '#e2e8f0' : '#334155' }} />}
            onClick={() => onEdit(record)}
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'
            }}
          />
        </Tooltip>
        <Tooltip title="Excluir">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
            style={{
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'
            }}
          />
        </Tooltip>
      </Space>
    )
  });

  const paginationConfig = pagination === false ? false : {
    current: pagination?.current !== undefined ? pagination.current : currentPage,
    pageSize: pagination?.pageSize !== undefined ? pagination.pageSize : pageSize,
    pageSizeOptions: isAuditLogs ? ['999'] : ['50'],
    showSizeChanger: false,
    total: typeof pagination?.total === 'number' ? pagination.total : (actualData?.length || 0),
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
    onChange: (page, size) => {
      setCurrentPage(page);
      if (size) setPageSize(size);
      if (typeof pagination?.onChange === 'function') {
        pagination.onChange(page, size || pageSize);
      }
      if (typeof onChange === 'function') {
        onChange({ current: page, pageSize: size || pageSize });
      }
    },
    ...(typeof pagination === 'object' ? pagination : {})
  };

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Table
        columns={tableColumns}
        dataSource={Array.isArray(dataSource) ? dataSource : []}
        loading={loading}
        pagination={paginationConfig}
        rowKey={(r) => r.id || r.user_id || JSON.stringify(r)}
        bordered
        size="middle"
        scroll={{ y: 'calc(100vh - 360px)', x: 'max-content' }}
        style={{
          background: 'transparent'
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Nenhum registro encontrado neste applet</span>}
            >
              {onAdd && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAdd} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)', border: 0 }}>
                  Adicionar Registro
                </Button>
              )}
            </Empty>
          )
        }}
      />
    </div>
  );
};
