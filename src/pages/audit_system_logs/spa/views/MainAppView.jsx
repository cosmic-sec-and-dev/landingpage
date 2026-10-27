import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Radio,
  Select,
  Button,
  Statistic,
  Empty,
  Space,
  Typography,
  Tag,
  Segmented,
  Pagination
} from 'antd';
import {
  SafetyCertificateOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CodeOutlined,
  AppstoreOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { LogDetailsModal } from '../components/LogDetailsModal';
import { LogViewerTerminal } from '../components/LogViewerTerminal';
import { LogCard } from '../components/LogCard';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  logs = [],
  currentUser,
  kpis = {},
  currentPage = 1,
  totalCount = 0,
  onPageChange = () => {},
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'error' | 'warn' | 'info' | 'debug'
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [displayStyle, setDisplayStyle] = useState('terminal'); // 'terminal' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLog, setSelectedLog] = useState(null);

  // Statistics derived directly from Server-Side RPC
  const totalLogs = kpis.total_logs !== undefined ? kpis.total_logs : (totalCount || logs.length);
  const errorCount = kpis.error_count !== undefined ? kpis.error_count : logs.filter(l => ['error', 'critical', 'fatal'].includes((l.level || '').toLowerCase())).length;
  const warnCount = kpis.warn_count !== undefined ? kpis.warn_count : logs.filter(l => ['warn', 'warning'].includes((l.level || '').toLowerCase())).length;
  const infoCount = kpis.info_count !== undefined ? kpis.info_count : logs.filter(l => (l.level || '').toLowerCase() === 'info').length;
  const uniqueIPs = kpis.unique_ips_count !== undefined ? kpis.unique_ips_count : new Set(logs.map(l => l.ip_address).filter(Boolean)).size;

  // Categories list
  const categories = Array.from(new Set(logs.map(l => l.category).filter(Boolean)));

  // Filter
  const filteredLogs = logs.filter(log => {
    if (levelFilter !== 'all') {
      const lvl = (log.level || '').toLowerCase();
      if (levelFilter === 'error' && !['error', 'critical', 'fatal'].includes(lvl)) return false;
      if (levelFilter === 'warn' && !['warn', 'warning'].includes(lvl)) return false;
      if (levelFilter === 'info' && lvl !== 'info') return false;
      if (levelFilter === 'debug' && lvl !== 'debug') return false;
    }

    if (categoryFilter && log.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = (log.message || '').toLowerCase().includes(q);
      const matchCat = (log.category || '').toLowerCase().includes(q);
      const matchIp = (log.ip_address || '').toLowerCase().includes(q);
      if (!matchMsg && !matchCat && !matchIp) return false;
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total de Eventos</span>}
              value={totalLogs}
              prefix={<SafetyCertificateOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Erros / Críticos</span>}
              value={errorCount}
              prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Alertas & Avisos</span>}
              value={warnCount}
              prefix={<WarningOutlined style={{ color: '#f59e0b' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Operações Info</span>}
              value={infoCount}
              prefix={<InfoCircleOutlined style={{ color: '#10b981' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>IPs Únicos</span>}
              value={uniqueIPs}
              prefix={<GlobalOutlined style={{ color: '#8b5cf6' }} />}
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
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="all">Todos</Radio.Button>
                <Radio.Button value="error">Erros ({errorCount})</Radio.Button>
                <Radio.Button value="warn">Avisos ({warnCount})</Radio.Button>
                <Radio.Button value="info">Info</Radio.Button>
              </Radio.Group>

              <Select
                placeholder="Categoria"
                allowClear
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 140 }}
              >
                {categories.map(c => (
                  <Select.Option key={c} value={c}>{c}</Select.Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Segmented
                options={[
                  { label: 'Terminal', value: 'terminal', icon: <CodeOutlined /> },
                  { label: 'Cards', value: 'grid', icon: <AppstoreOutlined /> }
                ]}
                value={displayStyle}
                onChange={setDisplayStyle}
              />

              <Search
                placeholder="Buscar mensagem ou IP..."
                allowClear
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: 200 }}
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content view */}
      {displayStyle === 'terminal' ? (
        <LogViewerTerminal
          logs={filteredLogs}
          onSelectLog={setSelectedLog}
        />
      ) : (
        <div>
          {filteredLogs.length === 0 ? (
            <Empty description="Nenhum registro de log encontrado." style={{ padding: '60px 0' }} />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredLogs.map(log => (
                <Col xs={24} sm={12} lg={8} xl={6} key={log.id}>
                  <LogCard
                    log={log}
                    onViewDetails={setSelectedLog}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {/* High-density Terminal Pagination (Authorized 999 limit) */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={999}
          total={totalCount}
          onChange={(p) => onPageChange(p)}
          showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} eventos`}
        />
      </div>

      {/* Details Modal */}
      <LogDetailsModal
        visible={!!selectedLog}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};
