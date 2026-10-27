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
  NotificationOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { CampaignWizardModal } from '../components/CampaignWizardModal';
import { CampaignCard } from '../components/CampaignCard';
import { CampaignLeadsModal } from '../components/CampaignLeadsModal';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  campaigns = [],
  contacts = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);
  const [selectedCampaignForLeads, setSelectedCampaignForLeads] = useState(null);

  // Statistics
  const totalCampaigns = campaigns.length;
  const activeCount = campaigns.filter(c => c.status === 'active' || !c.status).length;
  const totalContacts = contacts.length;
  const readContactsCount = contacts.filter(c => c.read).length;
  const avgOpenRate = totalContacts > 0 ? Math.round((readContactsCount / totalContacts) * 100) : 0;

  // Filter
  const filteredCampaigns = campaigns.filter(camp => {
    if (statusFilter !== 'all') {
      const st = camp.status || 'active';
      if (st !== statusFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = (camp.subject || '').toLowerCase().includes(q);
      const matchBody = (camp.body || '').toLowerCase().includes(q);
      const matchTarget = (camp.target_type || '').toLowerCase().includes(q);
      if (!matchSubject && !matchBody && !matchTarget) return false;
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total Campanhas</span>}
              value={totalCampaigns}
              prefix={<NotificationOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Campanhas Ativas</span>}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Leads & Destinatários</span>}
              value={totalContacts}
              prefix={<TeamOutlined style={{ color: '#8b5cf6' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Taxa Média de Abertura</span>}
              value={`${avgOpenRate}%`}
              prefix={<RiseOutlined style={{ color: '#f59e0b' }} />}
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
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">Todas ({totalCampaigns})</Radio.Button>
              <Radio.Button value="active">Ativas ({activeCount})</Radio.Button>
              <Radio.Button value="completed">Concluídas</Radio.Button>
              <Radio.Button value="draft">Rascunhos</Radio.Button>
            </Radio.Group>
          </Col>

          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Search
                placeholder="Buscar por assunto ou público..."
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
                  setEditingCampaign(null);
                  setWizardOpen(true);
                }}
              >
                Criar Nova Campanha
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid of Campaign Cards */}
      {filteredCampaigns.length === 0 ? (
        <Empty
          description="Nenhuma campanha encontrada."
          style={{ padding: '60px 0' }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCampaign(null);
              setWizardOpen(true);
            }}
          >
            Lançar Primeira Campanha
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCampaigns.map(camp => (
            <Col xs={24} sm={12} lg={8} xl={6} key={camp.id}>
              <CampaignCard
                campaign={camp}
                contacts={contacts}
                onEdit={(rec) => {
                  setEditingCampaign(rec);
                  setWizardOpen(true);
                }}
                onViewLeads={(rec) => {
                  setSelectedCampaignForLeads(rec);
                  setLeadsModalOpen(true);
                }}
                onRefresh={onRefresh}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modals */}
      <CampaignWizardModal
        visible={wizardOpen}
        record={editingCampaign}
        onClose={() => {
          setWizardOpen(false);
          setEditingCampaign(null);
        }}
        onSaved={() => {
          setWizardOpen(false);
          setEditingCampaign(null);
          onRefresh();
        }}
      />

      <CampaignLeadsModal
        visible={leadsModalOpen}
        campaign={selectedCampaignForLeads}
        contacts={contacts}
        onClose={() => {
          setLeadsModalOpen(false);
          setSelectedCampaignForLeads(null);
        }}
        onRefresh={onRefresh}
      />
    </div>
  );
};
