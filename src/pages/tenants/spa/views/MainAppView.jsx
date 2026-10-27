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
  Tag
} from 'antd';
import {
  BankOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TenantEditorModal } from '../components/TenantEditorModal';
import { TenantCard } from '../components/TenantCard';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  tenants = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active' | 'inactive'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  // Statistics
  const totalTenants = tenants.length;
  const activeCount = tenants.filter(t => t.is_active !== false).length;
  const inactiveCount = tenants.filter(t => t.is_active === false).length;
  const withBusinessId = tenants.filter(t => t.business_id).length;

  // Filter
  const filteredTenants = tenants.filter(t => {
    if (filterMode === 'active' && t.is_active === false) return false;
    if (filterMode === 'inactive' && t.is_active !== false) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (t.name || '').toLowerCase().includes(q);
      const matchSlug = (t.slug || '').toLowerCase().includes(q);
      const matchBiz = (t.business_name || '').toLowerCase().includes(q);
      const matchId = (t.business_id || '').toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchBiz && !matchId) return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total Organizações</span>}
              value={totalTenants}
              prefix={<BankOutlined style={{ color: '#0284c7' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Organizações Ativas</span>}
              value={activeCount}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Bloqueadas / Inativas</span>}
              value={inactiveCount}
              prefix={<StopOutlined style={{ color: '#f59e0b' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>CNPJ Registrado</span>}
              value={withBusinessId}
              prefix={<IdcardOutlined style={{ color: '#8b5cf6' }} />}
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
            <Radio.Group
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">Todas ({totalTenants})</Radio.Button>
              <Radio.Button value="active">Ativas ({activeCount})</Radio.Button>
              <Radio.Button value="inactive">Inativas ({inactiveCount})</Radio.Button>
            </Radio.Group>
          </Col>

          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Search
                placeholder="Buscar por nome, slug ou CNPJ..."
                allowClear
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: 240 }}
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
                  setEditingTenant(null);
                  setEditorOpen(true);
                }}
              >
                Cadastrar Organização
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid of Tenant Cards */}
      {filteredTenants.length === 0 ? (
        <Empty
          description="Nenhuma organização/tenant encontrada."
          style={{ padding: '60px 0' }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTenant(null);
              setEditorOpen(true);
            }}
          >
            Criar Primeira Organização
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTenants.map(tenant => (
            <Col xs={24} sm={12} lg={8} xl={6} key={tenant.id}>
              <TenantCard
                tenant={tenant}
                onEdit={(rec) => {
                  setEditingTenant(rec);
                  setEditorOpen(true);
                }}
                onRefresh={onRefresh}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modals */}
      <TenantEditorModal
        visible={editorOpen}
        record={editingTenant}
        onClose={() => {
          setEditorOpen(false);
          setEditingTenant(null);
        }}
        onSaved={() => {
          setEditorOpen(false);
          setEditingTenant(null);
          onRefresh();
        }}
      />
    </div>
  );
};
