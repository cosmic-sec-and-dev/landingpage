import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Select,
  DatePicker,
  Tooltip,
  Popover,
  Checkbox,
  Segmented,
  Divider,
  message
} from 'antd';
import {
  PlusOutlined,
  PushpinOutlined,
  PushpinFilled,
  BgColorsOutlined,
  BellOutlined,
  PictureOutlined,
  CheckSquareOutlined,
  TagOutlined,
  SendOutlined,
  EditOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
  CodeOutlined,
  ClearOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TusUpload } from '../../../../components/upload/TusUpload';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const NOTE_COLORS = [
  { key: 'default', label: 'Padrão', bgLight: '#ffffff', bgDark: 'rgba(26, 35, 56, 0.85)', border: '#334155' },
  { key: 'amber', label: 'Âmbar', bgLight: '#fef3c7', bgDark: '#78350f', border: '#f59e0b' },
  { key: 'emerald', label: 'Esmeralda', bgLight: '#d1fae5', bgDark: '#064e3b', border: '#10b981' },
  { key: 'sky', label: 'Azul Céu', bgLight: '#e0f2fe', bgDark: '#0c4a6e', border: '#0284c7' },
  { key: 'purple', label: 'Púrpura', bgLight: '#f3e8ff', bgDark: '#581c87', border: '#a855f7' },
  { key: 'rose', label: 'Rosa', bgLight: '#ffe4e6', bgDark: '#881337', border: '#f43f5e' },
  { key: 'slate', label: 'Cinza', bgLight: '#f1f5f9', bgDark: '#334155', border: '#64748b' }
];

export const NoteComposer = ({ labels = [], currentUser, onNoteCreated, onOpenEditor }) => {
  const { isDark } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editorMode, setEditorMode] = useState('rich_text'); // 'rich_text' | 'markdown'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [reminderAt, setReminderAt] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [checklistMode, setChecklistMode] = useState(false);
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState('');
  const [loading, setLoading] = useState(false);

  const richEditorRef = useRef(null);

  useEffect(() => {
    if (isExpanded && editorMode === 'rich_text' && richEditorRef.current) {
      if (richEditorRef.current.innerHTML !== content) {
        richEditorRef.current.innerHTML = content || '';
      }
    }
  }, [isExpanded, editorMode]);

  const executeCommand = (command, value = null) => {
    if (editorMode !== 'rich_text') return;
    document.execCommand(command, false, value);
    if (richEditorRef.current) {
      setContent(richEditorRef.current.innerHTML);
    }
  };

  const handleRichInput = () => {
    if (richEditorRef.current) {
      setContent(richEditorRef.current.innerHTML);
    }
  };

  const handleAddTodoItem = () => {
    if (!todoInput.trim()) return;
    setTodos([...todos, { title: todoInput.trim(), is_completed: false }]);
    setTodoInput('');
  };

  const handleToggleTodo = (index) => {
    const updated = [...todos];
    updated[index].is_completed = !updated[index].is_completed;
    setTodos(updated);
  };

  const handleRemoveTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const stripped = content.replace(/<[^>]*>/g, '').trim();
    if (!title.trim() && !stripped && !content.includes('<img') && todos.length === 0) {
      setIsExpanded(false);
      return;
    }

    setLoading(true);
    try {
      let authorId = currentUser?.id;
      if (!authorId) {
        const meRes = await apiRequest('/me');
        const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
        authorId = meData?.id;
      }

      // 1. Insert note
      const notePayload = {
        user_id: authorId || null,
        title: title.trim() || 'Sem Título',
        content: content.trim() || '',
        color: color,
        is_pinned: isPinned,
        is_archived: false,
        is_trashed: false,
        reminder_at: reminderAt ? reminderAt.toISOString() : null
      };

      const res = await apiRequest('/notekeep_notes', {
        method: 'POST',
        body: JSON.stringify(notePayload),
        headers: { Prefer: 'return=representation' }
      });

      if (!res.ok) throw new Error('Falha ao salvar nota');
      const createdNote = Array.isArray(res.data) ? res.data[0] : res.data;
      const noteId = createdNote?.id;

      if (noteId) {
        // 2. Link labels
        if (selectedLabels.length > 0) {
          for (const labelId of selectedLabels) {
            await apiRequest('/notekeep_note_labels', {
              method: 'POST',
              body: JSON.stringify({ note_id: noteId, label_id: labelId })
            });
          }
        }

        // 3. Insert todos
        if (todos.length > 0) {
          for (let i = 0; i < todos.length; i++) {
            await apiRequest('/notekeep_todos', {
              method: 'POST',
              body: JSON.stringify({
                note_id: noteId,
                title: todos[i].title,
                is_completed: todos[i].is_completed,
                priority: 'medium',
                display_order: i
              })
            });
          }
        }

        // 4. Link attachment if uploaded
        if (mediaUrl) {
          await apiRequest('/notekeep_notes_attachments', {
            method: 'POST',
            body: JSON.stringify({
              notekeep_note_id: noteId,
              url: mediaUrl,
              attachment_type: 'image',
              display_order: 0
            })
          });
        }
      }

      message.success('Nota criada com sucesso!');
      setTitle('');
      setContent('');
      if (richEditorRef.current) richEditorRef.current.innerHTML = '';
      setColor('default');
      setIsPinned(false);
      setReminderAt(null);
      setSelectedLabels([]);
      setMediaUrl('');
      setShowUpload(false);
      setChecklistMode(false);
      setTodos([]);
      setIsExpanded(false);

      if (onNoteCreated) onNoteCreated();
    } catch {
      message.error('Erro de conexão ao salvar nota');
    } finally {
      setLoading(false);
    }
  };

  const selectedColorObj = NOTE_COLORS.find(c => c.key === color) || NOTE_COLORS[0];
  const cardBg = isDark ? selectedColorObj.bgDark : selectedColorObj.bgLight;
  const strongBorderColor = color === 'default'
    ? (isDark ? '#38bdf8' : '#1d4ed8')
    : selectedColorObj.border;

  return (
    <Card
      style={{
        background: cardBg,
        border: `3px solid ${strongBorderColor}`,
        borderRadius: '16px',
        boxShadow: isDark
          ? '0 10px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)'
          : '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '24px',
        transition: 'all 0.25s ease'
      }}
      styles={{ body: { padding: isExpanded ? '18px 22px' : '14px 20px' } }}
    >
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'text',
            color: isDark ? '#cbd5e1' : '#475569'
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Criar uma nova anotação ou checklist...</span>
          <Space>
            {onOpenEditor && (
              <Tooltip title="Abrir no Editor Completo (Texto Rico / Markdown)">
                <Button
                  type="text"
                  shape="circle"
                  icon={<EditOutlined style={{ fontSize: '18px', color: isDark ? '#38bdf8' : '#1d4ed8' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditor();
                  }}
                />
              </Tooltip>
            )}
            <Tooltip title="Nova Lista de Tarefas">
              <Button
                type="text"
                shape="circle"
                icon={<CheckSquareOutlined style={{ fontSize: '17px', color: '#10b981' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setChecklistMode(true);
                  setIsExpanded(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Adicionar Imagem">
              <Button
                type="text"
                shape="circle"
                icon={<PictureOutlined style={{ fontSize: '17px', color: '#0284c7' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpload(true);
                  setIsExpanded(true);
                }}
              />
            </Tooltip>
          </Space>
        </div>
      ) : (
        <div>
          {/* Title & Pin Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Input
              placeholder="Título da Anotação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              bordered={false}
              style={{
                fontSize: '18px',
                fontWeight: 700,
                padding: '4px 0',
                color: isDark ? '#f8fafc' : '#0f172a'
              }}
            />
            <Tooltip title={isPinned ? 'Desafixar nota' : 'Fixar no topo'}>
              <Button
                type="text"
                shape="circle"
                icon={isPinned ? <PushpinFilled style={{ color: '#f59e0b', fontSize: '18px' }} /> : <PushpinOutlined style={{ fontSize: '18px' }} />}
                onClick={() => setIsPinned(!isPinned)}
              />
            </Tooltip>
          </div>

          <div style={{ marginBottom: 12 }}>
            <UniversalRichEditor
              variant="compact"
              value={content}
              onChange={setContent}
              placeholder="Criar uma nota... (formatação rica, listas e imagens)"
              minHeight={120}
            />
          </div>

          {/* Checklist Mode */}
          {checklistMode && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <Input
                  placeholder="Adicionar item na lista..."
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onPressEnter={handleAddTodoItem}
                />
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddTodoItem}>
                  Add
                </Button>
              </div>

              {todos.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <Checkbox checked={t.is_completed} onChange={() => handleToggleTodo(idx)}>
                    <span style={{ textDecoration: t.is_completed ? 'line-through' : 'none', opacity: t.is_completed ? 0.6 : 1 }}>
                      {t.title}
                    </span>
                  </Checkbox>
                  <Button type="text" size="small" danger onClick={() => handleRemoveTodo(idx)}>✕</Button>
                </div>
              ))}
            </div>
          )}

          {/* Image Upload Box */}
          {showUpload && (
            <div style={{ marginTop: '12px', padding: '10px', background: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc', borderRadius: '10px' }}>
              <TusUpload value={mediaUrl} onChange={setMediaUrl} placeholder="Enviar imagem da nota" />
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '10px',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <Space wrap size="small">
              {/* Color Palette Popover */}
              <Popover
                content={
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {NOTE_COLORS.map(c => (
                      <div
                        key={c.key}
                        onClick={() => setColor(c.key)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isDark ? c.bgDark : c.bgLight,
                          border: `2px solid ${c.border}`,
                          cursor: 'pointer',
                          transform: color === c.key ? 'scale(1.2)' : 'none',
                          boxShadow: color === c.key ? '0 0 8px rgba(0,0,0,0.4)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                }
                title="Cor da Nota"
                trigger="click"
              >
                <Button type="text" shape="circle" icon={<BgColorsOutlined style={{ fontSize: '16px' }} />} />
              </Popover>

              {/* Checklist Toggle */}
              <Tooltip title="Ativar Checklist">
                <Button
                  type={checklistMode ? 'primary' : 'text'}
                  shape="circle"
                  icon={<CheckSquareOutlined style={{ fontSize: '16px' }} />}
                  onClick={() => setChecklistMode(!checklistMode)}
                />
              </Tooltip>

              {/* Image Upload Toggle */}
              <Tooltip title="Anexar Imagem">
                <Button
                  type={showUpload ? 'primary' : 'text'}
                  shape="circle"
                  icon={<PictureOutlined style={{ fontSize: '16px' }} />}
                  onClick={() => setShowUpload(!showUpload)}
                />
              </Tooltip>

              {/* Reminder DatePicker */}
              <DatePicker
                showTime
                placeholder="Lembrete"
                value={reminderAt}
                onChange={setReminderAt}
                style={{ width: 150 }}
                prefix={<BellOutlined style={{ color: '#f59e0b' }} />}
              />

              {/* Labels Multi-Select */}
              {labels.length > 0 && (
                <Select
                  mode="multiple"
                  placeholder="Etiquetas"
                  value={selectedLabels}
                  onChange={setSelectedLabels}
                  style={{ minWidth: 140 }}
                  options={labels.map(l => ({
                    value: l.id,
                    label: `🏷️ ${l.name}`
                  }))}
                />
              )}
            </Space>

            <Space>
              {onOpenEditor && (
                <Button
                  type="dashed"
                  icon={<EditOutlined />}
                  onClick={() => onOpenEditor({ title, content, color, isPinned, reminderAt })}
                  style={{ borderColor: strongBorderColor }}
                >
                  Editor Completo
                </Button>
              )}
              <Button type="text" onClick={() => setIsExpanded(false)}>
                Cancelar
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={handleSave}
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                Salvar Nota
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Card>
  );
};
export default NoteComposer;
