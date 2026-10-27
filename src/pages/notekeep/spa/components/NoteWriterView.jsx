import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  DatePicker,
  Divider,
  Tag,
  Tooltip,
  Segmented,
  Checkbox,
  message,
  Select,
  Image
} from 'antd';
import {
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
  SaveOutlined,
  ArrowLeftOutlined,
  PushpinOutlined,
  PushpinFilled,
  BellOutlined,
  TagOutlined,
  PictureOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TusUpload } from '../../../../components/upload/TusUpload';
import { uploadTusFile } from '../../../../services/tusUploader';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';
import { apiRequest } from '../../../../services/api';
import { NOTE_COLORS } from './NoteComposer';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const NoteWriterView = ({
  initialNote = null,
  labels = [],
  noteLabels = [],
  todos = [],
  attachments = [],
  currentUser,
  onClose,
  onSaved
}) => {
  const { isDark } = useAppTheme();
  const [editorMode, setEditorMode] = useState('rich_text'); // 'rich_text' | 'markdown'

  // Note data state
  const [noteId, setNoteId] = useState(initialNote?.id || null);
  const [title, setTitle] = useState(initialNote?.title || '');
  const [contentRichText, setContentRichText] = useState(initialNote?.content || '');
  const [contentMarkdown, setContentMarkdown] = useState(initialNote?.content || '');
  const [color, setColor] = useState(initialNote?.color || 'default');
  const [isPinned, setIsPinned] = useState(initialNote?.is_pinned || false);
  const [reminderAt, setReminderAt] = useState(
    initialNote?.reminder_at ? dayjs(initialNote.reminder_at) : null
  );

  // Labels & Todos & Media
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [noteTodos, setNoteTodos] = useState([]);
  const [newTodoInput, setNewTodoInput] = useState('');
  const [noteAttachments, setNoteAttachments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  // Auto-save & Status
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const richEditorRef = useRef(null);
  const isSavingRef = useRef(false);

  // Initialize from initialNote
  useEffect(() => {
    if (initialNote) {
      setNoteId(initialNote.id);
      setTitle(initialNote.title || '');
      setColor(initialNote.color || 'default');
      setIsPinned(!!initialNote.is_pinned);
      setReminderAt(initialNote.reminder_at ? dayjs(initialNote.reminder_at) : null);

      const rawContent = initialNote.content || '';
      setContentRichText(rawContent);
      setContentMarkdown(rawContent);

      // Existing linked labels
      const linked = noteLabels
        .filter(nl => nl.note_id === initialNote.id)
        .map(nl => nl.label_id);
      setSelectedLabelIds(linked);

      // Existing todos
      const existingTodos = todos.filter(t => t.note_id === initialNote.id);
      setNoteTodos(existingTodos.map(t => ({ id: t.id, title: t.title, is_completed: t.is_completed })));

      // Existing attachments
      const existingAtts = attachments.filter(a => a.notekeep_note_id === initialNote.id && !a.is_deleted);
      setNoteAttachments(existingAtts);
    } else {
      setNoteId(null);
      setTitle('');
      setContentRichText('');
      setContentMarkdown('');
      setColor('default');
      setIsPinned(false);
      setReminderAt(null);
      setSelectedLabelIds([]);
      setNoteTodos([]);
      setNoteAttachments([]);
    }
    setIsDirty(false);
    setSaveStatus('saved');
  }, [initialNote, noteLabels, todos, attachments]);

  // Set initial rich text content in contentEditable once mounted
  useEffect(() => {
    if (editorMode === 'rich_text' && richEditorRef.current) {
      if (richEditorRef.current.innerHTML !== contentRichText) {
        richEditorRef.current.innerHTML = contentRichText;
      }
    }
  }, [editorMode, noteId]);

  // Keep stateRef fresh for auto-saving
  const stateRef = useRef({
    noteId,
    title,
    contentRichText,
    contentMarkdown,
    color,
    isPinned,
    reminderAt,
    selectedLabelIds,
    noteTodos,
    editorMode,
    isDirty
  });

  useEffect(() => {
    stateRef.current = {
      noteId,
      title,
      contentRichText,
      contentMarkdown,
      color,
      isPinned,
      reminderAt,
      selectedLabelIds,
      noteTodos,
      editorMode,
      isDirty
    };
  }, [noteId, title, contentRichText, contentMarkdown, color, isPinned, reminderAt, selectedLabelIds, noteTodos, editorMode, isDirty]);

  // Format command for Rich Text Editor (LibreOffice Writer style)
  const executeCommand = (command, value = null) => {
    if (editorMode !== 'rich_text') return;
    document.execCommand(command, false, value);
    if (richEditorRef.current) {
      const updatedHtml = richEditorRef.current.innerHTML;
      setContentRichText(updatedHtml);
      setIsDirty(true);
      setSaveStatus('dirty');
    }
  };

  // Handle content changes in Rich Text
  const handleRichInput = () => {
    if (richEditorRef.current) {
      const html = richEditorRef.current.innerHTML;
      setContentRichText(html);
      setIsDirty(true);
      setSaveStatus('dirty');
    }
  };

  // Handle content changes in Markdown
  const handleMarkdownChange = (e) => {
    setContentMarkdown(e.target.value);
    setIsDirty(true);
    setSaveStatus('dirty');
  };

  // Resolve user id
  const resolveUserId = useCallback(async () => {
    if (currentUser?.id) return currentUser.id;
    try {
      const meRes = await apiRequest('/me');
      if (meRes.ok && meRes.data) {
        const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
        return meData?.id || null;
      }
    } catch {
      return null;
    }
    return null;
  }, [currentUser]);

  // Save Note Function
  const saveNote = useCallback(async (isManual = false) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setSaveStatus('saving');

    const s = stateRef.current;
    const finalContent = s.contentRichText || '';

    try {
      const userId = await resolveUserId();
      const payload = {
        title: s.title.trim() || 'Sem Título',
        content: finalContent || '',
        color: s.color,
        is_pinned: s.isPinned,
        is_archived: false,
        is_trashed: false,
        reminder_at: s.reminderAt ? s.reminderAt.toISOString() : null
      };
      if (userId) payload.user_id = userId;

      let currentSavedId = s.noteId;

      if (currentSavedId) {
        // Update existing note
        const res = await apiRequest(`/notekeep_notes?id=eq.${currentSavedId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Falha ao atualizar nota');
      } else {
        // Create new note
        const res = await apiRequest('/notekeep_notes', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { Prefer: 'return=representation' }
        });
        if (!res.ok) throw new Error('Falha ao criar nota');
        const createdData = Array.isArray(res.data) ? res.data[0] : res.data;
        currentSavedId = createdData?.id;
        if (currentSavedId) {
          setNoteId(currentSavedId);
          stateRef.current.noteId = currentSavedId;
        }
      }

      // Sync labels if saved
      if (currentSavedId && s.selectedLabelIds) {
        // Delete previous and re-insert
        await apiRequest(`/notekeep_note_labels?note_id=eq.${currentSavedId}`, { method: 'DELETE' });
        for (const lid of s.selectedLabelIds) {
          await apiRequest('/notekeep_note_labels', {
            method: 'POST',
            body: JSON.stringify({ note_id: currentSavedId, label_id: lid })
          });
        }
      }

      setSaveStatus('saved');
      setLastSavedTime(new Date());
      setIsDirty(false);
      if (isManual) {
        message.success('Nota salva com sucesso!');
        if (onSaved) onSaved();
        if (onClose) onClose();
      }
    } catch (err) {
      console.error('Erro ao salvar nota:', err);
      setSaveStatus('error');
      if (isManual) {
        message.error('Erro ao salvar nota.');
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [resolveUserId, onSaved]);

  // Auto-save every 5s if dirty
  useEffect(() => {
    const timer = setInterval(() => {
      if (stateRef.current.isDirty && stateRef.current.noteId) {
        saveNote(false);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [saveNote]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNote]);

  // Todo items management
  const handleAddTodo = async () => {
    if (!newTodoInput.trim()) return;
    const titleText = newTodoInput.trim();
    setNewTodoInput('');

    if (noteId) {
      try {
        const res = await apiRequest('/notekeep_todos', {
          method: 'POST',
          body: JSON.stringify({
            note_id: noteId,
            title: titleText,
            is_completed: false,
            priority: 'medium',
            display_order: noteTodos.length
          }),
          headers: { Prefer: 'return=representation' }
        });
        const created = Array.isArray(res.data) ? res.data[0] : res.data;
        setNoteTodos([...noteTodos, { id: created?.id, title: titleText, is_completed: false }]);
      } catch {
        setNoteTodos([...noteTodos, { title: titleText, is_completed: false }]);
      }
    } else {
      setNoteTodos([...noteTodos, { title: titleText, is_completed: false }]);
      setIsDirty(true);
    }
  };

  const handleToggleTodo = async (index) => {
    const item = noteTodos[index];
    const updated = [...noteTodos];
    updated[index].is_completed = !item.is_completed;
    setNoteTodos(updated);

    if (item.id) {
      await apiRequest(`/notekeep_todos?id=eq.${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: updated[index].is_completed })
      });
    } else {
      setIsDirty(true);
    }
  };

  const handleRemoveTodo = async (index) => {
    const item = noteTodos[index];
    setNoteTodos(noteTodos.filter((_, i) => i !== index));

    if (item.id) {
      await apiRequest(`/notekeep_todos?id=eq.${item.id}`, { method: 'DELETE' });
    } else {
      setIsDirty(true);
    }
  };

  // Attachments
  const handleUploadSuccess = async (fileUrl) => {
    if (!noteId) {
      message.info('Salvando nota para vincular a imagem...');
      await saveNote(false);
    }

    const currentId = stateRef.current.noteId;
    if (currentId) {
      try {
        await apiRequest('/notekeep_notes_attachments', {
          method: 'POST',
          body: JSON.stringify({
            notekeep_note_id: currentId,
            url: fileUrl,
            attachment_type: 'image',
            display_order: noteAttachments.length,
            is_deleted: false
          })
        });
        setNoteAttachments([...noteAttachments, { url: fileUrl }]);
        message.success('Imagem anexada à nota!');
      } catch {
        message.error('Erro ao vincular anexo.');
      }
    }
    setShowUpload(false);
  };

  const handleInlineImageUpload = async (file) => {
    if (!file || !file.type?.startsWith('image/')) return;
    message.loading({ content: `Enviando imagem "${file.name}"...`, key: 'note-upload', duration: 0 });
    try {
      const res = await uploadTusFile(file);
      const fileUrl = res?.url;
      if (!fileUrl) throw new Error('Não foi possível obter a URL da imagem.');

      if (!stateRef.current.noteId) {
        await saveNote(false);
      }
      const currentId = stateRef.current.noteId;
      if (currentId) {
        try {
          await apiRequest('/notekeep_notes_attachments', {
            method: 'POST',
            body: JSON.stringify({
              notekeep_note_id: currentId,
              url: fileUrl,
              attachment_type: 'image',
              display_order: noteAttachments.length,
              is_deleted: false
            })
          });
          setNoteAttachments((prev) => [...prev, { url: fileUrl }]);
        } catch (err) {
          console.warn('Erro ao salvar anexo de nota:', err);
        }
      }

      if (editorMode === 'rich_text') {
        const imgHtml = `<img src="${fileUrl}" alt="${file.name || 'imagem'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; vertical-align: middle; display: inline-block;" />`;
        let inserted = false;
        if (document.queryCommandSupported && document.queryCommandSupported('insertHTML')) {
          inserted = document.execCommand('insertHTML', false, imgHtml);
        }
        if (!inserted && richEditorRef.current) {
          richEditorRef.current.innerHTML += imgHtml;
        }
        handleRichInput();
      } else {
        const mdImg = `\n![${file.name || 'imagem'}](${fileUrl})\n`;
        setContentMarkdown((prev) => prev + mdImg);
        setIsDirty(true);
        setSaveStatus('dirty');
      }
      message.success({ content: 'Imagem inserida com sucesso!', key: 'note-upload' });
    } catch (err) {
      console.error('Erro no upload de imagem:', err);
      message.error({ content: err.message || 'Falha ao processar upload da imagem.', key: 'note-upload' });
    }
  };

  const handleEditorPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleInlineImageUpload(file);
        return;
      }
    }
  };

  const handleEditorDrop = (e) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        handleInlineImageUpload(file);
        return;
      }
    }
  };

  // Word & Character count calculation
  const getStats = () => {
    const rawText = editorMode === 'rich_text'
      ? (richEditorRef.current ? richEditorRef.current.innerText : contentRichText)
      : contentMarkdown;
    const cleanText = (rawText || '').trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const chars = cleanText.length;
    return { words, chars };
  };

  const stats = getStats();
  const selectedColorObj = NOTE_COLORS.find(c => c.key === color) || NOTE_COLORS[0];
  const paperBg = isDark ? selectedColorObj.bgDark : selectedColorObj.bgLight;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Top Header & Actions Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          background: isDark ? 'rgba(26, 35, 56, 0.92)' : '#ffffff',
          padding: '12px 20px',
          borderRadius: 14,
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.04)'
        }}
      >
        <Space size="middle">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (onClose) onClose();
            }}
          >
            Voltar às Notas
          </Button>

          <Divider type="vertical" style={{ height: 20 }} />

          {/* Auto-save status indicator */}
          <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saveStatus === 'saved' && (
              <>
                <CheckCircleOutlined style={{ color: '#10b981' }} />
                <span>Salvo {lastSavedTime ? `às ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <CloudSyncOutlined spin style={{ color: '#0284c7' }} />
                <span>Salvando alterações...</span>
              </>
            )}
            {saveStatus === 'dirty' && (
              <>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span>Alterações pendentes</span>
              </>
            )}
            {saveStatus === 'error' && (
              <span style={{ color: '#ef4444' }}>Erro no salvamento</span>
            )}
          </span>
        </Space>

        <Space size="middle">
          {/* Color Palette Popover */}
          <Space size={4}>
            {NOTE_COLORS.map(c => (
              <Tooltip key={c.key} title={c.label}>
                <div
                  onClick={() => {
                    setColor(c.key);
                    setIsDirty(true);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: isDark ? c.bgDark : c.bgLight,
                    border: color === c.key ? '2.5px solid #2563eb' : `1.5px solid ${c.border}`,
                    boxShadow: color === c.key ? '0 0 8px rgba(37,99,235,0.4)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                />
              </Tooltip>
            ))}
          </Space>

          <Divider type="vertical" style={{ height: 20 }} />

          {/* Pin Toggle */}
          <Tooltip title={isPinned ? 'Desafixar nota' : 'Fixar no topo'}>
            <Button
              type={isPinned ? 'primary' : 'default'}
              shape="circle"
              icon={isPinned ? <PushpinFilled /> : <PushpinOutlined />}
              onClick={() => {
                setIsPinned(!isPinned);
                setIsDirty(true);
              }}
            />
          </Tooltip>

          {/* Nova Nota Button */}
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setNoteId(null);
              setTitle('');
              setContentRichText('');
              setContentMarkdown('');
              if (richEditorRef.current) richEditorRef.current.innerHTML = '';
              setColor('default');
              setIsPinned(false);
              setReminderAt(null);
              setSelectedLabelIds([]);
              setNoteTodos([]);
              setNoteAttachments([]);
              setIsDirty(false);
              setSaveStatus('saved');
              message.info('Formulário limpo para nova nota.');
            }}
          >
            Nova Nota
          </Button>

          {/* Manual Save Button */}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={() => saveNote(true)}
            style={{ fontWeight: 600, padding: '0 20px' }}
          >
            Salvar Nota
          </Button>
        </Space>
      </div>

      {/* Note Title Input with Drop-Cap Visual Style */}
      <Card
        variant="borderless"
        style={{
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderRadius: 14,
          marginBottom: 16,
          border: `2px solid ${selectedColorObj.border}`
        }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Input
          placeholder="Título da Anotação..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsDirty(true);
            setSaveStatus('dirty');
          }}
          bordered={false}
          style={{
            fontSize: 24,
            fontWeight: 800,
            padding: 0,
            color: isDark ? '#f8fafc' : '#0f172a'
          }}
        />

        {/* Note Metadata row: Labels & Reminder */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 14, alignItems: 'center' }}>
          <Space>
            <BellOutlined style={{ color: '#f59e0b' }} />
            <DatePicker
              showTime
              placeholder="Definir lembrete..."
              value={reminderAt}
              onChange={(date) => {
                setReminderAt(date);
                setIsDirty(true);
                setSaveStatus('dirty');
              }}
              style={{ width: 200 }}
              format="DD/MM/YYYY HH:mm"
            />
          </Space>

          <Space style={{ flex: 1 }}>
            <TagOutlined style={{ color: '#0284c7' }} />
            <Select
              mode="multiple"
              placeholder="Adicionar marcadores..."
              value={selectedLabelIds}
              onChange={(vals) => {
                setSelectedLabelIds(vals);
                setIsDirty(true);
                setSaveStatus('dirty');
              }}
              style={{ minWidth: 240, width: '100%' }}
              options={labels.map(l => ({
                value: l.id,
                label: l.name
              }))}
            />
          </Space>

          <Button
            icon={<PictureOutlined />}
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? 'Ocultar Upload' : 'Anexar Imagem'}
          </Button>
        </div>

        {/* Upload box */}
        {showUpload && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc' }}>
            <TusUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}
      </Card>

      {/* Universal TipTap Editor Workspace */}
      <div style={{ marginTop: 16 }}>
        <UniversalRichEditor
          variant="document"
          value={contentRichText}
          onChange={(html) => {
            setContentRichText(html);
            setIsDirty(true);
            setSaveStatus('dirty');
          }}
          minHeight={420}
          placeholder="Comece a redigir sua nota em texto rico..."
        />
      </div>

      {/* Checklist / Todos Section Below Paper */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            <span>Lista de Tarefas da Nota ({noteTodos.filter(t => t.is_completed).length}/{noteTodos.length})</span>
          </div>
        }
        variant="borderless"
        style={{
          marginTop: 16,
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderRadius: 14
        }}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Input
            placeholder="Adicionar item à lista de tarefas..."
            value={newTodoInput}
            onChange={(e) => setNewTodoInput(e.target.value)}
            onPressEnter={handleAddTodo}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTodo}>
            Adicionar
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {noteTodos.map((todo, idx) => (
            <div
              key={todo.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
              }}
            >
              <Checkbox
                checked={todo.is_completed}
                onChange={() => handleToggleTodo(idx)}
              >
                <span
                  style={{
                    textDecoration: todo.is_completed ? 'line-through' : 'none',
                    opacity: todo.is_completed ? 0.6 : 1,
                    fontSize: 14,
                    color: isDark ? '#e2e8f0' : '#1e293b'
                  }}
                >
                  {todo.title}
                </span>
              </Checkbox>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveTodo(idx)}
              />
            </div>
          ))}
          {noteTodos.length === 0 && (
            <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic' }}>
              Nenhuma tarefa adicionada a esta nota ainda.
            </Text>
          )}
        </div>
      </Card>

      {/* Attachments Gallery */}
      {noteAttachments.length > 0 && (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PictureOutlined style={{ color: '#0284c7' }} />
              <span>Imagens e Anexos ({noteAttachments.length})</span>
            </div>
          }
          variant="borderless"
          style={{
            marginTop: 16,
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 14
          }}
        >
          <Image.PreviewGroup>
            <Row gutter={[12, 12]}>
              {noteAttachments.map((att, idx) => (
                <Col xs={12} sm={8} md={6} key={att.id || idx}>
                  <div style={{ borderRadius: 8, overflow: 'hidden', height: 140, border: '1px solid #334155' }}>
                    <Image
                      src={att.url}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </Card>
      )}
    </div>
  );
};
export default NoteWriterView;
