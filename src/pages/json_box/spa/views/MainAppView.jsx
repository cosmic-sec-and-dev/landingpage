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
  Tag,
  Pagination
} from 'antd';
import {
  CodeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { JsonBoxEditorModal } from '../components/JsonBoxEditorModal';
import { JsonBoxCard } from '../components/JsonBoxCard';
import { JsonQueryTesterModal } from '../components/JsonQueryTesterModal';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  boxes = [],
  attachments = [],
  currentUser,
  kpis = {},
  currentPage = 1,
  totalCount = 0,
  onPageChange = () => {},
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active' | 'inactive'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const [testerOpen, setTesterOpen] = useState(false);
  const [testingBox, setTestingBox] = useState(null);

  // Statistics from server-side RPC or loaded boxes fallback
  const totalBoxes = Number(kpis.total_boxes) || Number(totalCount) || boxes.length;
  const activeCount = Number(kpis.active_boxes) || boxes.filter(b => b.is_active).length;
  const inactiveCount = Math.max(0, totalBoxes - activeCount);
  const totalAttachments = Number(kpis.total_attachments) || attachments.length;
  const totalKeys = Number(kpis.total_keys) || boxes.reduce((acc, box) => {
    if (box.data && typeof box.data === 'object' && !Array.isArray(box.data)) {
      return acc + Object.keys(box.data).length;
    }
    return acc;
  }, 0);

  // Filter boxes
  const filteredBoxes = boxes.filter(box => {
    if (filterMode === 'active' && !box.is_active) return false;
    if (filterMode === 'inactive' && box.is_active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (box.name || '').toLowerCase().includes(q);
      const matchSlug = (box.slug || '').toLowerCase().includes(q);
      const matchData = box.data ? JSON.stringify(box.data).toLowerCase().includes(q) : false;
      if (!matchName && !matchSlug && !matchData) return false;
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total Documentos</span>}
              value={totalBoxes}
              prefix={<DatabaseOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Documentos Ativos</span>}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Inativos / Rascunhos</span>}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Chaves Indexadas</span>}
              value={totalKeys}
              prefix={<ThunderboltOutlined style={{ color: '#a855f7' }} />}
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
          <Col xs={24} sm={12} md={10}>
            <Radio.Group
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">Todos ({totalBoxes})</Radio.Button>
              <Radio.Button value="active">Ativos ({activeCount})</Radio.Button>
              <Radio.Button value="inactive">Inativos ({inactiveCount})</Radio.Button>
            </Radio.Group>
          </Col>

          <Col xs={24} sm={12} md={14}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Search
                placeholder="Buscar por nome, slug ou chave JSON..."
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
                  setEditingBox(null);
                  setEditorOpen(true);
                }}
              >
                Novo Documento JSON
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid of JSON Boxes */}
      {filteredBoxes.length === 0 ? (
        <Empty
          description="Nenhum documento JSON encontrado."
          style={{ padding: '60px 0' }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBox(null);
              setEditorOpen(true);
            }}
          >
            Criar Primeiro Documento JSON
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredBoxes.map(box => (
            <Col xs={24} sm={12} lg={8} xl={6} key={box.id}>
              <JsonBoxCard
                box={box}
                attachments={attachments}
                onEdit={(rec) => {
                  setEditingBox(rec);
                  setEditorOpen(true);
                }}
                onTestQuery={(rec) => {
                  setTestingBox(rec);
                  setTesterOpen(true);
                }}
                onRefresh={onRefresh}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Server-Side Pagination (Strict 50 items limit) */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={50}
          total={totalCount}
          onChange={(p) => onPageChange(p)}
          showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} documentos`}
        />
      </div>

      {/* Modals */}
      <JsonBoxEditorModal
        visible={editorOpen}
        record={editingBox}
        onClose={() => {
          setEditorOpen(false);
          setEditingBox(null);
        }}
        onSaved={() => {
          setEditorOpen(false);
          setEditingBox(null);
          onRefresh();
        }}
      />

      <JsonQueryTesterModal
        visible={testerOpen}
        record={testingBox}
        onClose={() => {
          setTesterOpen(false);
          setTestingBox(null);
        }}
      />
    </div>
  );
};
