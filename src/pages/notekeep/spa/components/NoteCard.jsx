import React, { useState } from 'react';
import {
  Card,
  Typography,
  Checkbox,
  Tag,
  Space,
  Button,
  Tooltip,
  Popover,
  Image,
  Popconfirm,
  message
} from 'antd';
import {
  PushpinOutlined,
  PushpinFilled,
  BgColorsOutlined,
  BellOutlined,
  InboxOutlined,
  DeleteOutlined,
  UndoOutlined,
  CheckCircleOutlined,
  TagOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { NOTE_COLORS } from './NoteComposer';
import { apiRequest } from '../../../../services/api';

const { Text, Paragraph } = Typography;

export const NoteCard = ({
  note,
  todos = [],
  attachments = [],
  labels = [],
  noteLabels = [],
  onRefresh,
  onEdit
}) => {
  const { isDark } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const noteTodos = todos.filter(t => t.note_id === note.id);
  const noteAttachments = attachments.filter(a => a.notekeep_note_id === note.id && !a.is_deleted);
  const linkedLabelIds = noteLabels.filter(nl => nl.note_id === note.id).map(nl => nl.label_id);
  const myLabels = labels.filter(l => linkedLabelIds.includes(l.id));

  const colorObj = NOTE_COLORS.find(c => c.key === note.color) || NOTE_COLORS[0];
  const cardBg = isDark ? colorObj.bgDark : colorObj.bgLight;

  // Toggle Pin
  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      await apiRequest(`/notekeep_notes?id=eq.${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_pinned: !note.is_pinned })
      });
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao atualizar nota');
    }
  };

  // Change Color
  const handleChangeColor = async (newColor) => {
    try {
      await apiRequest(`/notekeep_notes?id=eq.${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ color: newColor })
      });
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao alterar cor');
    }
  };

  // Toggle Todo Item
  const handleToggleTodo = async (todo) => {
    try {
      await apiRequest(`/notekeep_todos?id=eq.${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: !todo.is_completed })
      });
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao atualizar tarefa');
    }
  };

  // Toggle Archive
  const handleToggleArchive = async () => {
    try {
      await apiRequest(`/notekeep_notes?id=eq.${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_archived: !note.is_archived })
      });
      message.success(note.is_archived ? 'Nota desarquivada!' : 'Nota arquivada!');
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao arquivar');
    }
  };

  // Toggle Trash
  const handleToggleTrash = async () => {
    try {
      await apiRequest(`/notekeep_notes?id=eq.${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_trashed: !note.is_trashed })
      });
      message.info(note.is_trashed ? 'Nota restaurada da lixeira!' : 'Nota movida para a lixeira!');
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao mover para lixeira');
    }
  };

  // Delete Permanently
  const handleDeletePermanently = async () => {
    try {
      await apiRequest(`/notekeep_notes?id=eq.${note.id}`, { method: 'DELETE' });
      message.success('Nota excluída permanentemente');
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao excluir nota');
    }
  };

  const cardBorder = (note.color && note.color !== 'default')
    ? `1px solid ${colorObj.border}`
    : (isDark ? '1px solid #334155' : '1px solid #e2e8f0');

  return (
    <Card
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: 12,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        maxHeight: '480px',
        height: '100%',
        overflow: 'hidden'
      }}
      styles={{
        body: {
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '480px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }
      }}
    >
      {/* Top Header: Title & Pin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <Text strong style={{ fontSize: '15px', color: isDark ? '#f8fafc' : '#0f172a' }}>
          {note.title}
        </Text>

        {!note.is_trashed && (
          <Tooltip title={note.is_pinned ? 'Desafixar' : 'Fixar'}>
            <Button
              type="text"
              shape="circle"
              size="small"
              icon={note.is_pinned ? <PushpinFilled style={{ color: '#f59e0b' }} /> : <PushpinOutlined style={{ opacity: 0.5 }} />}
              onClick={handleTogglePin}
            />
          </Tooltip>
        )}
      </div>

      {/* Scrollable Middle Content Container (Never exceeds 480px) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingRight: '4px',
          marginBottom: '8px',
          scrollbarWidth: 'thin'
        }}
      >
        {/* Content text */}
        {note.content && (
          <div
            style={{
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: isDark ? '#cbd5e1' : '#334155',
              margin: '6px 0 12px 0',
              wordBreak: 'break-word'
            }}
            className="selene-rich-content"
            dangerouslySetInnerHTML={{
              __html: note.content?.startsWith('<')
                ? note.content
                : (note.content?.replace(/\n/g, '<br/>') || '')
            }}
          />
        )}

        {/* Attachments */}
        {noteAttachments.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <Image.PreviewGroup>
              <div style={{ display: 'grid', gridTemplateColumns: noteAttachments.length > 1 ? '1fr 1fr' : '1fr', gap: '6px' }}>
                {noteAttachments.map(att => (
                  <Image
                    key={att.id}
                    src={att.url}
                    style={{ maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        {/* Checklist Todos */}
        {noteTodos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            {noteTodos.map(todo => (
              <Checkbox
                key={todo.id}
                checked={todo.is_completed}
                onChange={() => handleToggleTodo(todo)}
                style={{ fontSize: '13px' }}
              >
                <span style={{
                  textDecoration: todo.is_completed ? 'line-through' : 'none',
                  opacity: todo.is_completed ? 0.6 : 1,
                  color: isDark ? '#e2e8f0' : 'rgba(26, 35, 56, 0.85)'
                }}>
                  {todo.title}
                </span>
              </Checkbox>
            ))}
          </div>
        )}

        {/* Reminder & Labels Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
          {note.reminder_at && (
            <Tag color="warning" icon={<BellOutlined />} style={{ borderRadius: '6px', fontSize: '11.5px' }}>
              {new Date(note.reminder_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </Tag>
          )}

          {myLabels.map(l => (
            <Tag key={l.id} color="blue" icon={<TagOutlined />} style={{ borderRadius: '6px', fontSize: '11.5px' }}>
              {l.name}
            </Tag>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        {!note.is_trashed ? (
          <>
            <Space size="small">
              {/* Color Palette Popover */}
              <Popover
                content={
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {NOTE_COLORS.map(c => (
                      <div
                        key={c.key}
                        onClick={() => handleChangeColor(c.key)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: isDark ? c.bgDark : c.bgLight,
                          border: `2px solid ${c.border}`,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                }
                title="Alterar Cor"
                trigger="click"
              >
                <Button type="text" shape="circle" size="small" icon={<BgColorsOutlined />} />
              </Popover>

              <Tooltip title={note.is_archived ? 'Desarquivar' : 'Arquivar'}>
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<InboxOutlined />}
                  onClick={handleToggleArchive}
                />
              </Tooltip>

              <Tooltip title="Mover para Lixeira">
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleToggleTrash}
                />
              </Tooltip>
            </Space>

            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit && onEdit(note)}
            >
              Editar
            </Button>
          </>
        ) : (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<UndoOutlined />}
              onClick={handleToggleTrash}
            >
              Restaurar
            </Button>

            <Popconfirm
              title="Excluir permanentemente?"
              description="Esta ação não poderá ser desfeita."
              onConfirm={handleDeletePermanently}
              okText="Excluir"
              cancelText="Cancelar"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                Excluir
              </Button>
            </Popconfirm>
          </Space>
        )}
      </div>
    </Card>
  );
};
