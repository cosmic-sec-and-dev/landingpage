import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Radio,
  Select,
  Empty,
  Statistic,
  Space,
  Button,
  Tag,
  Tabs,
  Typography
} from 'antd';
import {
  FileTextOutlined,
  PushpinOutlined,
  CheckSquareOutlined,
  BellOutlined,
  InboxOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { NoteComposer } from '../components/NoteComposer';
import { NoteCard } from '../components/NoteCard';
import { NoteWriterView } from '../components/NoteWriterView';
import { GlowingCount } from '../../../../components/common/GlowingCount';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  notes = [],
  todos = [],
  labels = [],
  noteLabels = [],
  reminders = [],
  attachments = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('notes'); // 'editor' | 'notes'
  const [filterMode, setFilterMode] = useState('active'); // 'active' | 'pinned' | 'todos' | 'reminders' | 'archived' | 'trash'
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  // Filter notes
  const filteredNotes = notes.filter(note => {
    // Trash filter
    if (filterMode === 'trash') {
      if (!note.is_trashed) return false;
    } else {
      if (note.is_trashed) return false;
    }

    // Archive filter
    if (filterMode === 'archived') {
      if (!note.is_archived) return false;
    } else if (filterMode !== 'trash') {
      if (note.is_archived) return false;
    }

    // Pinned filter
    if (filterMode === 'pinned' && !note.is_pinned) return false;

    // Checklists / Todos filter
    if (filterMode === 'todos') {
      const hasTodos = todos.some(t => t.note_id === note.id);
      if (!hasTodos) return false;
    }

    // Reminders filter
    if (filterMode === 'reminders') {
      if (!note.reminder_at) return false;
    }

    // Label filter
    if (selectedLabelId) {
      const hasLabel = noteLabels.some(nl => nl.note_id === note.id && nl.label_id === selectedLabelId);
      if (!hasLabel) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (note.title || '').toLowerCase().includes(q);
      const matchContent = (note.content || '').toLowerCase().includes(q);
      const matchTodo = todos.some(t => t.note_id === note.id && (t.title || '').toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTodo) return false;
    }

    return true;
  });

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.is_pinned);

  // Statistics
  const activeCount = notes.filter(n => !n.is_trashed && !n.is_archived).length;
  const pinnedCount = notes.filter(n => !n.is_trashed && !n.is_archived && n.is_pinned).length;
  const pendingTodosCount = todos.filter(t => !t.is_completed).length;
  const remindersCount = notes.filter(n => !n.is_trashed && !n.is_archived && n.reminder_at).length;

  // Root Tabs matching the CMS Model
  const mainTabs = [
    {
      key: 'editor',
      label: (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '3px 12px',
            borderRadius: 8,
            background: isDark
              ? (activeTab === 'editor'
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 116, 144, 0.35) 100%)'
                  : 'rgba(56, 189, 248, 0.12)')
              : (activeTab === 'editor'
                  ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
                  : '#f0f9ff'),
            border: isDark
              ? (activeTab === 'editor' ? '1.5px solid #38bdf8' : '1px dashed rgba(56, 189, 248, 0.6)')
              : (activeTab === 'editor' ? '1.5px solid #0284c7' : '1px dashed #7dd3fc'),
            color: isDark ? '#38bdf8' : '#0284c7',
            fontWeight: 700,
            boxShadow: activeTab === 'editor'
              ? (isDark ? '0 0 12px rgba(56, 189, 248, 0.35)' : '0 2px 8px rgba(2, 132, 199, 0.2)')
              : 'none',
            transition: 'all 0.25s ease'
          }}
        >
          <EditOutlined style={{ fontSize: 16 }} />
          <span>Editor</span>
        </span>
      ),
      children: (
        <NoteWriterView
          key={editingNote?.id || 'new-note'}
          initialNote={editingNote}
          labels={labels}
          noteLabels={noteLabels}
          todos={todos}
          attachments={attachments}
          currentUser={currentUser}
          onClose={() => {
            setActiveTab('notes');
            setEditingNote(null);
            onRefresh();
          }}
          onSaved={() => {
            onRefresh();
          }}
        />
      )
    },
    {
      key: 'notes',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ marginRight: 6 }} />
          Mural de Notas
          <GlowingCount
            count={activeCount}
            color={isDark ? '#38bdf8' : '#0284c7'}
            isDark={isDark}
          />
        </span>
      ),
      children: (
        <div>
          {/* Top metrics bar */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={12} sm={6}>
              <Card
                variant="borderless"
                style={{
                  background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                  borderRadius: 12,
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                styles={{ body: { padding: 16 } }}
              >
                <Statistic
                  title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Notas Ativas</span>}
                  value={activeCount}
                  prefix={<FileTextOutlined style={{ color: '#0284c7' }} />}
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
                styles={{ body: { padding: 16 } }}
              >
                <Statistic
                  title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Fixadas</span>}
                  value={pinnedCount}
                  prefix={<PushpinOutlined style={{ color: '#f59e0b' }} />}
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
                styles={{ body: { padding: 16 } }}
              >
                <Statistic
                  title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Tarefas Pendentes</span>}
                  value={pendingTodosCount}
                  prefix={<CheckSquareOutlined style={{ color: '#10b981' }} />}
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
                styles={{ body: { padding: 16 } }}
              >
                <Statistic
                  title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Lembretes</span>}
                  value={remindersCount}
                  prefix={<BellOutlined style={{ color: '#a855f7' }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Note Composer with thick & prominent border */}
          <NoteComposer
            labels={labels}
            currentUser={currentUser}
            onNoteCreated={onRefresh}
            onOpenEditor={(prefill) => {
              setEditingNote(prefill || null);
              setActiveTab('editor');
            }}
          />

          {/* Filter & Search Toolbar */}
          <Card
            variant="borderless"
            style={{
              marginBottom: 24,
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: '14px 20px' } }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} md={14}>
                <Radio.Group
                  value={filterMode}
                  onChange={e => {
                    setFilterMode(e.target.value);
                    setSelectedLabelId(null);
                  }}
                  buttonStyle="solid"
                  size="middle"
                >
                  <Radio.Button value="active"><FileTextOutlined /> Ativas</Radio.Button>
                  <Radio.Button value="pinned"><PushpinOutlined /> Fixadas</Radio.Button>
                  <Radio.Button value="todos"><CheckSquareOutlined /> Checklists</Radio.Button>
                  <Radio.Button value="reminders"><BellOutlined /> Lembretes</Radio.Button>
                  <Radio.Button value="archived"><InboxOutlined /> Arquivo</Radio.Button>
                  <Radio.Button value="trash"><DeleteOutlined /> Lixeira</Radio.Button>
                </Radio.Group>
              </Col>

              <Col xs={24} md={10}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Select
                    placeholder="Filtrar por Marcador"
                    allowClear
                    value={selectedLabelId}
                    onChange={setSelectedLabelId}
                    style={{ width: 160 }}
                  >
                    {labels.map(l => (
                      <Select.Option key={l.id} value={l.id}>
                        <Tag color={l.color || 'blue'}>{l.name}</Tag>
                      </Select.Option>
                    ))}
                  </Select>

                  <Search
                    placeholder="Buscar notas..."
                    allowClear
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 180 }}
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

          {/* Grid of Notes (Cards max 480px height) */}
          {filteredNotes.length === 0 ? (
            <Empty
              description={
                filterMode === 'trash'
                  ? 'Lixeira vazia.'
                  : filterMode === 'archived'
                  ? 'Nenhuma nota arquivada.'
                  : 'Nenhuma nota encontrada. Crie sua primeira nota acima!'
              }
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingNote(null);
                  setActiveTab('editor');
                }}
              >
                Escrever Primeira Nota no Editor
              </Button>
            </Empty>
          ) : (
            <div>
              {/* If there are pinned notes and we are not in pure pinned/trash filter */}
              {pinnedNotes.length > 0 && filterMode === 'active' && (
                <div style={{ marginBottom: 28 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      fontWeight: 700,
                      color: isDark ? '#94a3b8' : '#64748b',
                      marginBottom: 12,
                      display: 'block'
                    }}
                  >
                    FIXADAS ({pinnedNotes.length})
                  </Text>
                  <Row gutter={[16, 16]}>
                    {pinnedNotes.map(note => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={note.id}>
                        <NoteCard
                          note={note}
                          todos={todos}
                          attachments={attachments}
                          labels={labels}
                          noteLabels={noteLabels}
                          onRefresh={onRefresh}
                          onEdit={(n) => {
                            setEditingNote(n);
                            setActiveTab('editor');
                          }}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Other / Unpinned Notes */}
              {unpinnedNotes.length > 0 && filterMode === 'active' && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <Text
                      style={{
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 1.2,
                        fontWeight: 700,
                        color: isDark ? '#94a3b8' : '#64748b',
                        marginBottom: 12,
                        display: 'block'
                      }}
                    >
                      OUTRAS ({unpinnedNotes.length})
                    </Text>
                  )}
                  <Row gutter={[16, 16]}>
                    {unpinnedNotes.map(note => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={note.id}>
                        <NoteCard
                          note={note}
                          todos={todos}
                          attachments={attachments}
                          labels={labels}
                          noteLabels={noteLabels}
                          onRefresh={onRefresh}
                          onEdit={(n) => {
                            setEditingNote(n);
                            setActiveTab('editor');
                          }}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* When in a specific filter mode (e.g. pinned, todos, archived, trash) */}
              {filterMode !== 'active' && (
                <Row gutter={[16, 16]}>
                  {filteredNotes.map(note => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={note.id}>
                      <NoteCard
                        note={note}
                        todos={todos}
                        attachments={attachments}
                        labels={labels}
                        noteLabels={noteLabels}
                        onRefresh={onRefresh}
                        onEdit={(n) => {
                          setEditingNote(n);
                          setActiveTab('editor');
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          if (key === 'editor' && activeTab !== 'editor') {
            setEditingNote(null);
          }
          setActiveTab(key);
        }}
        items={mainTabs}
        size="large"
        style={{ marginBottom: 20 }}
      />
    </div>
  );
};
export default MainAppView;
