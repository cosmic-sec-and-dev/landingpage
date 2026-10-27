import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip
} from 'antd';
import {
  CodeOutlined,
  CopyOutlined,
  ClearOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

export const LogViewerTerminal = ({
  logs = [],
  onSelectLog
}) => {
  const [terminalSearch, setTerminalSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    if (!terminalSearch.trim()) return true;
    const q = terminalSearch.toLowerCase();
    return (
      (log.message || '').toLowerCase().includes(q) ||
      (log.category || '').toLowerCase().includes(q) ||
      (log.level || '').toLowerCase().includes(q) ||
      (log.ip_address || '').toLowerCase().includes(q)
    );
  });

  const getLevelColor = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'error':
      case 'critical':
      case 'fatal':
        return '#ef4444';
      case 'warn':
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#38bdf8';
      case 'debug':
        return '#94a3b8';
      default:
        return '#10b981';
    }
  };

  const handleCopyAll = () => {
    const text = filteredLogs
      .map(l => `[${l.created_at ? dayjs(l.created_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}] [${(l.level || 'INFO').toUpperCase()}] [${l.category || 'sys'}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <Card
      styles={{ body: {padding: 0} }}
      style={{
        borderRadius: 12,
        background: '#090d16',
        borderColor: 'rgba(26, 35, 56, 0.85)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}
    >
      {/* Terminal Header */}
      <div style={{
        background: '#0f172a',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>
          <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'monospace', marginLeft: 8 }}>
            nt-audit-stream ~ stdout ({filteredLogs.length} events)
          </Text>
        </div>

        <Space>
          <Input
            size="small"
            prefix={<SearchOutlined style={{ color: '#64748b' }} />}
            placeholder="Filtrar stream..."
            value={terminalSearch}
            onChange={(e) => setTerminalSearch(e.target.value)}
            style={{ width: 180, background: '#090d16', borderColor: '#334155', color: '#f8fafc' }}
          />
          <Tooltip title="Copiar buffer do terminal">
            <Button
              size="small"
              icon={<CopyOutlined style={{ color: '#94a3b8' }} />}
              onClick={handleCopyAll}
              style={{ background: '#090d16', borderColor: '#334155' }}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Terminal Content Body */}
      <div style={{
        padding: '14px 16px',
        maxHeight: 520,
        overflow: 'auto',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        fontSize: 12.5,
        lineHeight: 1.6
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
            Nenhum evento registrado no stream de auditoria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => onSelectLog(log)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'background 0.15s',
                marginBottom: 2
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 35, 56, 0.85)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: '#64748b', flexShrink: 0 }}>
                {log.created_at ? dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss') : '00:00:00'}
              </span>

              <span style={{
                color: getLevelColor(log.level),
                fontWeight: 700,
                flexShrink: 0,
                minWidth: 60
              }}>
                [{(log.level || 'INFO').toUpperCase()}]
              </span>

              <span style={{ color: '#c084fc', flexShrink: 0 }}>
                [{log.category || 'system'}]
              </span>

              {log.ip_address && (
                <span style={{ color: '#0284c7', flexShrink: 0 }}>
                  ({log.ip_address})
                </span>
              )}

              <span style={{ color: '#f8fafc', wordBreak: 'break-word', flex: 1 }}>
                {log.message}
              </span>

              <EyeOutlined style={{ color: '#64748b', fontSize: 11, flexShrink: 0, alignSelf: 'center' }} />
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
