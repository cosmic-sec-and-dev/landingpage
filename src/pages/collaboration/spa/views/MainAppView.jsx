import React, { useState, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Statistic,
  Empty,
  Space,
  Tag,
  Tabs,
  Badge,
  Avatar,
  Typography,
  Divider,
  Popconfirm,
  Tooltip,
  List,
  Carousel,
  Image,
  message
} from 'antd';
import {
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  NotificationOutlined,
  PlusOutlined,
  SendOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  LinkOutlined,
  PushpinOutlined,
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  SmileOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  LoadingOutlined,
  FilePdfOutlined,
  FileZipOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { apiRequest } from '../../../../services/api';
import { uploadTusFile } from '../../../../services/tusUploader';
import { ChatRoomModal } from '../components/ChatRoomModal';
import { CalendarEventModal } from '../components/CalendarEventModal';
import { CollabNoteModal } from '../components/CollabNoteModal';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';
import { ROOM_TYPES, POST_PRIORITIES, POST_STATUSES, EVENT_LOCATIONS } from '../schemaConfig';

const { Search, TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const MAX_CHAT_ATTACHMENTS = 9;
const MAX_FILE_SIZE_BYTES = Number(import.meta.env.VITE_TUSD_MAX_SIZE) || 32000000;
const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));

const getChatFileType = (file) => {
  const mime = file.type || '';
  const name = file.name || '';
  if (mime.startsWith('video/') || name.match(/\.(mp4|webm|mov)$/i)) return 'video';
  if (mime.startsWith('image/') || name.match(/\.(png|jpe?g|webp|gif|svg)$/i)) return 'image';
  return 'document';
};

const isVideoChatAtt = (att) => {
  const type = (att?.attachment_type || '').toLowerCase();
  const url = (att?.url || '').toLowerCase();
  return type === 'video' || !!url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
};

const isImageChatAtt = (att) => {
  const type = (att?.attachment_type || '').toLowerCase();
  const url = (att?.url || '').toLowerCase();
  return type === 'image' || !!url.match(/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i);
};

const getChatFileIcon = (fileName = '', type = '') => {
  const name = (fileName || '').toLowerCase();
  if (type === 'video' || name.match(/\.(mp4|webm|mov)$/)) return <VideoCameraOutlined style={{ color: '#ec4899' }} />;
  if (type === 'image' || name.match(/\.(png|jpe?g|webp|gif|svg)$/)) return <FileImageOutlined style={{ color: '#06b6d4' }} />;
  if (name.endsWith('.pdf')) return <FilePdfOutlined style={{ color: '#ef4444' }} />;
  if (name.match(/\.(zip|rar|7z|tar|gz)$/)) return <FileZipOutlined style={{ color: '#eab308' }} />;
  if (name.match(/\.(doc|docx)$/)) return <FileWordOutlined style={{ color: '#3b82f6' }} />;
  if (name.match(/\.(xls|xlsx|csv)$/)) return <FileExcelOutlined style={{ color: '#10b981' }} />;
  return <FileTextOutlined style={{ color: '#8b5cf6' }} />;
};

export const MainAppView = ({
  rooms = [],
  messages = [],
  messageAttachments = [],
  reactions = [],
  calendars = [],
  events = [],
  eventAttendees = [],
  notes = [],
  channels = [],
  posts = [],
  comments = [],
  postLikes = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('chat');

  // Chat State
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || null);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [chatAttachments, setChatAttachments] = useState([]);
  const [uploadingChatFiles, setUploadingChatFiles] = useState(false);
  const chatFileInputRef = useRef(null);

  // Modals
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Filter States
  const [channelFilter, setChannelFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [noteFolderFilter, setNoteFolderFilter] = useState('all');
  const [newCommentTexts, setNewCommentTexts] = useState({});

  // Active Chat Room
  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
  const roomMessages = messages.filter(m => m.room_id === activeRoom?.id);

  // Attachment upload handler
  const handleChatFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (chatAttachments.length + files.length > MAX_CHAT_ATTACHMENTS) {
      message.warning(`Você pode anexar no máximo ${MAX_CHAT_ATTACHMENTS} arquivos por mensagem.`);
      return;
    }

    setUploadingChatFiles(true);
    const uploadedList = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        message.error(`Arquivo "${file.name}" excede o limite máximo de ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      try {
        const fileType = getChatFileType(file);
        const url = await uploadTusFile(file);
        uploadedList.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: fileType,
          url
        });
      } catch (err) {
        message.error(`Falha ao carregar ${file.name}: ${err?.message || 'Erro de upload'}`);
      }
    }

    if (uploadedList.length > 0) {
      setChatAttachments(prev => [...prev, ...uploadedList].slice(0, MAX_CHAT_ATTACHMENTS));
      message.success(`${uploadedList.length} arquivo(s) anexado(s) com sucesso!`);
    }

    setUploadingChatFiles(false);
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = '';
    }
  };

  const handleRemoveChatAttachment = (id) => {
    setChatAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Handle Send Message
  const handleSendMessage = async () => {
    const stripped = newMessageText.replace(/<[^>]*>/g, '').trim();
    if ((!stripped && !newMessageText.includes('<img') && chatAttachments.length === 0) || !activeRoom) return;
    setSendingMessage(true);
    try {
      const res = await apiRequest('/chat_messages', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          room_id: activeRoom.id,
          sender_id: currentUser?.id,
          content_text: newMessageText.trim()
        })
      });
      if (res.ok) {
        let createdMsg = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!createdMsg?.id) {
          const checkRes = await apiRequest(`/chat_messages?sender_id=eq.${currentUser?.id}&room_id=eq.${activeRoom.id}&order=created_at.desc&limit=1`);
          if (checkRes.ok && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
            createdMsg = checkRes.data[0];
          }
        }

        if (createdMsg?.id && chatAttachments.length > 0) {
          for (let i = 0; i < chatAttachments.length; i++) {
            const att = chatAttachments[i];
            await apiRequest('/chat_messages_attachments', {
              method: 'POST',
              headers: { 'Prefer': 'return=representation' },
              body: JSON.stringify({
                tenant_id: currentUser?.tenant_id || activeRoom.tenant_id,
                chat_message_id: createdMsg.id,
                url: att.url,
                attachment_type: att.type,
                display_order: i,
                is_deleted: false
              })
            });
          }
        }

        setNewMessageText('');
        setChatAttachments([]);
        onRefresh?.();
      } else {
        message.error(res.error || 'Erro ao enviar mensagem');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle Emoji Reaction
  const handleToggleReaction = async (messageId, emoji) => {
    try {
      const existing = reactions.find(
        r => r.message_id === messageId && r.user_id === currentUser?.id && r.emoji === emoji
      );
      if (existing) {
        await apiRequest(`/chat_messages_reactions?id=eq.${existing.id}`, { method: 'DELETE' });
      } else {
        await apiRequest('/chat_messages_reactions', {
          method: 'POST',
          body: JSON.stringify({
            message_id: messageId,
            user_id: currentUser?.id,
            emoji
          })
        });
      }
      onRefresh?.();
    } catch {
      // Ignore
    }
  };

  // Handle Post Like
  const handleTogglePostLike = async postId => {
    try {
      const existing = postLikes.find(l => l.post_id === postId && l.user_id === currentUser?.id);
      if (existing) {
        await apiRequest(`/collaboration_posts_likes?id=eq.${existing.id}`, { method: 'DELETE' });
      } else {
        await apiRequest('/collaboration_posts_likes', {
          method: 'POST',
          body: JSON.stringify({
            post_id: postId,
            user_id: currentUser?.id,
            reaction_type: 'like'
          })
        });
      }
      onRefresh?.();
    } catch {
      message.error('Erro ao curtir publicação');
    }
  };

  // Handle Add Post Comment
  const handleAddComment = async postId => {
    const text = newCommentTexts[postId];
    if (!text?.trim()) return;
    try {
      const res = await apiRequest('/collaboration_posts_comments', {
        method: 'POST',
        body: JSON.stringify({
          post_id: postId,
          user_id: currentUser?.id,
          content_text: text.trim()
        })
      });
      if (res.ok) {
        setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));
        onRefresh?.();
      } else {
        message.error('Erro ao enviar comentário');
      }
    } catch {
      message.error('Erro ao processar comentário');
    }
  };

  // Delete handlers
  const handleDeleteNote = async id => {
    const res = await apiRequest(`/collaboration_notes?id=eq.${id}`, { method: 'DELETE' });
    if (res.ok) {
      message.success('Nota excluída!');
      onRefresh?.();
    }
  };

  const handleDeleteEvent = async id => {
    const res = await apiRequest(`/collaboration_events?id=eq.${id}`, { method: 'DELETE' });
    if (res.ok) {
      message.success('Evento cancelado e removido!');
      onRefresh?.();
    }
  };

  const handleDeletePost = async id => {
    const res = await apiRequest(`/collaboration_posts?id=eq.${id}`, { method: 'DELETE' });
    if (res.ok) {
      message.success('Comunicado removido!');
      onRefresh?.();
    }
  };

  // Filtered Posts
  const filteredPosts = posts.filter(p => {
    if (channelFilter !== 'all' && p.channel_id !== channelFilter) return false;
    if (priorityFilter !== 'all' && p.priority_level !== priorityFilter) return false;
    return true;
  });

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    if (noteFolderFilter !== 'all' && n.folder_name !== noteFolderFilter) return false;
    return true;
  });

  const noteFolders = Array.from(new Set(notes.map(n => n.folder_name || 'Geral')));

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      {/* Top Metrics Cards */}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Salas & Canais de Chat</span>}
              value={rooms.length}
              prefix={<MessageOutlined style={{ color: '#3b82f6' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Reuniões Agendadas</span>}
              value={events.length}
              prefix={<CalendarOutlined style={{ color: '#8b5cf6' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Notas de Equipe</span>}
              value={notes.length}
              prefix={<FileTextOutlined style={{ color: '#10b981' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Mural de Comunicados</span>}
              value={posts.length}
              prefix={<NotificationOutlined style={{ color: '#f59e0b' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs Container */}
      <Card
        variant="borderless"
        style={{
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderRadius: 12,
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'chat',
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <MessageOutlined style={{ marginRight: 6 }} />
                  Chat em Equipe
                  <GlowingCount count={rooms.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
                </span>
              ),
              children: (
                <Row gutter={16} style={{ minHeight: 600 }}>
                  {/* Left Column: Room List */}
                  <Col xs={24} md={8} lg={7} style={{ borderRight: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text strong style={{ fontSize: 16 }}>Salas & Canais</Text>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingRoom(null);
                          setRoomModalOpen(true);
                        }}
                      >
                        Nova Sala
                      </Button>
                    </div>

                    <Search
                      placeholder="Buscar canais..."
                      size="small"
                      style={{ marginBottom: 12 }}
                      onChange={e => setChatSearch(e.target.value)}
                      allowClear
                    />

                    <List
                      dataSource={rooms.filter(r => (r.name || '').toLowerCase().includes(chatSearch.toLowerCase()))}
                      renderItem={room => {
                        const isSelected = (activeRoom?.id === room.id);
                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 8,
                              marginBottom: 6,
                              cursor: 'pointer',
                              background: isSelected
                                ? (isDark ? '#334155' : '#e0f2fe')
                                : 'transparent',
                              border: isSelected ? '1px solid #0284c7' : '1px solid transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s',
                              gap: 8
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                              <Avatar
                                size={36}
                                style={{
                                  backgroundColor: room.room_type === 'direct_1on1' ? '#8b5cf6' : '#0284c7',
                                  flexShrink: 0,
                                  width: 36,
                                  height: 36,
                                  minWidth: 36,
                                  minHeight: 36,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                icon={room.room_type === 'direct_1on1' ? <UserOutlined style={{ fontSize: 18 }} /> : <TeamOutlined style={{ fontSize: 18 }} />}
                              />
                              <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: isSelected ? 600 : 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {room.name || 'Sala sem título'}
                                </div>
                                <Text type="secondary" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                  {room.topic || (room.room_type === 'direct_1on1' ? 'Conversa Direta' : 'Canal Aberto')}
                                </Text>
                              </div>
                            </div>
                            {room.is_archived && <Tag color="default" style={{ flexShrink: 0 }}>Arquivada</Tag>}
                          </div>
                        );
                      }}
                    />
                  </Col>

                  {/* Right Column: Chat Room Area */}
                  <Col xs={24} md={16} lg={17}>
                    {activeRoom ? (
                      <div style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
                        {/* Room Header */}
                        <div
                          style={{
                            padding: '12px 16px',
                            borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar
                              size={36}
                              style={{
                                backgroundColor: activeRoom.room_type === 'direct_1on1' ? '#8b5cf6' : '#0284c7',
                                flexShrink: 0,
                                width: 36,
                                height: 36,
                                minWidth: 36,
                                minHeight: 36,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              icon={activeRoom.room_type === 'direct_1on1' ? <UserOutlined style={{ fontSize: 18 }} /> : <TeamOutlined style={{ fontSize: 18 }} />}
                            />
                            <div>
                              <Title level={5} style={{ margin: 0 }}>
                                {activeRoom.name || 'Sala de Conversa'}
                              </Title>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {activeRoom.topic || 'Espaço de colaboração e alinhamento em tempo real'}
                              </Text>
                            </div>
                          </div>
                          <Space>
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => {
                                setEditingRoom(activeRoom);
                                setRoomModalOpen(true);
                              }}
                            >
                              Editar Sala
                            </Button>
                          </Space>
                        </div>

                        {/* Messages Thread */}
                        <div
                          style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          {roomMessages.length === 0 ? (
                            <div style={{ margin: 'auto', textAlign: 'center' }}>
                              <MessageOutlined style={{ fontSize: 40, color: '#94a3b8', marginBottom: 12 }} />
                              <Paragraph type="secondary">Nenhuma mensagem nesta sala ainda. Inicie a conversa!</Paragraph>
                            </div>
                          ) : (
                            roomMessages.map(msg => {
                              const isMe = msg.sender_id === currentUser?.id;
                              const sender = users.find(u => u.id === msg.sender_id);
                              const msgReactions = reactions.filter(r => r.message_id === msg.id);
                              const msgAtts = messageAttachments.filter(a => a.chat_message_id === msg.id && !a.is_deleted);
                              const mediaAtts = msgAtts.filter(a => isVideoChatAtt(a) || isImageChatAtt(a));
                              const docAtts = msgAtts.filter(a => !mediaAtts.includes(a));

                              return (
                                <div
                                  key={msg.id}
                                  style={{
                                    display: 'flex',
                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                    alignItems: 'flex-start',
                                    gap: 10
                                  }}
                                >
                                  <Avatar
                                    size={36}
                                    src={sender?.avatar_url}
                                    icon={<UserOutlined style={{ fontSize: 18 }} />}
                                    style={{
                                      backgroundColor: isMe ? '#0284c7' : '#64748b',
                                      flexShrink: 0,
                                      width: 36,
                                      height: 36,
                                      minWidth: 36,
                                      minHeight: 36
                                    }}
                                  />
                                  <div
                                    style={{
                                      maxWidth: '75%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: isMe ? 'flex-end' : 'flex-start'
                                    }}
                                  >
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                                      <Text strong style={{ fontSize: 12 }}>
                                        {isMe ? 'Você' : (sender?.full_name || sender?.display_name || 'Membro')}
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: 11 }}>
                                        {dayjs(msg.created_at).format('HH:mm')}
                                      </Text>
                                    </div>

                                    <div
                                      style={{
                                        padding: '10px 14px',
                                        borderRadius: 12,
                                        background: isMe
                                          ? '#0284c7'
                                          : (isDark ? '#334155' : '#f1f5f9'),
                                        color: isMe ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                        wordBreak: 'break-word',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                      }}
                                    >
                                      {msg.content_text && (
                                        <div
                                          className="selene-rich-content"
                                          dangerouslySetInnerHTML={{
                                            __html: msg.content_text?.startsWith('<')
                                              ? msg.content_text
                                              : (msg.content_text?.replace(/\n/g, '<br/>') || '')
                                          }}
                                        />
                                      )}

                                      {/* Single Media (1 Image or 1 Video) */}
                                      {mediaAtts.length === 1 && (
                                        <div style={{ marginTop: msg.content_text ? 8 : 0, borderRadius: 8, overflow: 'hidden' }}>
                                          {isVideoChatAtt(mediaAtts[0]) ? (
                                            <video
                                              controls
                                              src={mediaAtts[0].url}
                                              style={{
                                                maxWidth: '100%',
                                                maxHeight: '260px',
                                                borderRadius: 8,
                                                backgroundColor: '#000',
                                                display: 'block'
                                              }}
                                            />
                                          ) : (
                                            <Image
                                              src={mediaAtts[0].url}
                                              alt="Mídia"
                                              style={{
                                                maxWidth: '100%',
                                                maxHeight: '260px',
                                                objectFit: 'contain',
                                                borderRadius: 8
                                              }}
                                            />
                                          )}
                                        </div>
                                      )}

                                      {/* Slide / Carousel if > 1 media */}
                                      {mediaAtts.length > 1 && (
                                        <div style={{ marginTop: msg.content_text ? 8 : 0, borderRadius: 8, overflow: 'hidden', position: 'relative', width: '280px', maxWidth: '100%' }}>
                                          <div
                                            style={{
                                              position: 'absolute',
                                              top: 6,
                                              right: 6,
                                              zIndex: 10,
                                              background: 'rgba(0, 0, 0, 0.65)',
                                              color: '#ffffff',
                                              padding: '2px 8px',
                                              borderRadius: 10,
                                              fontSize: 11,
                                              fontWeight: 600,
                                              backdropFilter: 'blur(4px)'
                                            }}
                                          >
                                            {mediaAtts.length} mídias
                                          </div>
                                          <Carousel arrows dots style={{ borderRadius: 8, overflow: 'hidden' }}>
                                            {mediaAtts.map((att, idx) => (
                                              <div key={att.id || idx}>
                                                <div
                                                  style={{
                                                    height: 220,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#020617',
                                                    borderRadius: 8,
                                                    overflow: 'hidden'
                                                  }}
                                                >
                                                  {isVideoChatAtt(att) ? (
                                                    <video
                                                      controls
                                                      src={att.url}
                                                      style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain'
                                                      }}
                                                    />
                                                  ) : (
                                                    <Image
                                                      src={att.url}
                                                      alt="Mídia"
                                                      style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '220px',
                                                        objectFit: 'contain'
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </Carousel>
                                        </div>
                                      )}

                                      {/* Documents */}
                                      {docAtts.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: (msg.content_text || mediaAtts.length > 0) ? 8 : 0 }}>
                                          {docAtts.map((doc, idx) => {
                                            const fileName = doc.url?.split('/').pop()?.split('?')[0] || `documento_${idx + 1}`;
                                            return (
                                              <a
                                                key={doc.id || idx}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                                  padding: '6px 10px',
                                                  borderRadius: 8,
                                                  background: isMe ? 'rgba(255, 255, 255, 0.15)' : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                                                  border: isMe ? '1px solid rgba(255, 255, 255, 0.25)' : (isDark ? '1px solid #475569' : '1px solid #e2e8f0'),
                                                  color: isMe ? '#ffffff' : (isDark ? '#e2e8f0' : '#1e293b'),
                                                  textDecoration: 'none',
                                                  fontSize: 12
                                                }}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                                                  {getChatFileIcon(fileName, doc.attachment_type)}
                                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                                    {fileName}
                                                  </span>
                                                </div>
                                                <DownloadOutlined style={{ marginLeft: 8 }} />
                                              </a>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* Reactions Bar */}
                                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                      {['👍', '❤️', '🔥', '✅'].map(emoji => {
                                        const count = msgReactions.filter(r => r.emoji === emoji).length;
                                        const hasReacted = msgReactions.some(
                                          r => r.emoji === emoji && r.user_id === currentUser?.id
                                        );
                                        return (
                                          <Button
                                            key={emoji}
                                            size="small"
                                            type={hasReacted ? 'primary' : 'dashed'}
                                            style={{
                                              height: 22,
                                              fontSize: 11,
                                              padding: '0 6px',
                                              borderRadius: 10
                                            }}
                                            onClick={() => handleToggleReaction(msg.id, emoji)}
                                          >
                                            {emoji} {count > 0 ? count : ''}
                                          </Button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Message Input Box */}
                        <div
                          style={{
                            padding: '12px 16px',
                            borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
                          }}
                        >
                          {/* Attachment Tray */}
                          {chatAttachments.length > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                                marginBottom: 10,
                                padding: 8,
                                borderRadius: 8,
                                background: isDark ? '#1e293b' : '#f8fafc',
                                border: isDark ? '1px dashed #475569' : '1px dashed #cbd5e1'
                              }}
                            >
                              {chatAttachments.map(att => (
                                <Tag
                                  key={att.id}
                                  closable
                                  onClose={() => handleRemoveChatAttachment(att.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    fontSize: 12
                                  }}
                                >
                                  {getChatFileIcon(att.name, att.type)}
                                  <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {att.name}
                                  </span>
                                  <span style={{ opacity: 0.6, fontSize: 11 }}>
                                    ({(att.size / 1024 / 1024).toFixed(1)}MB)
                                  </span>
                                </Tag>
                              ))}
                            </div>
                          )}

                          <input
                            ref={chatFileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.tar,.gz,.txt"
                            style={{ display: 'none' }}
                            onChange={handleChatFilesSelected}
                          />

                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <Button
                              type="dashed"
                              icon={uploadingChatFiles ? <LoadingOutlined /> : <PaperClipOutlined />}
                              disabled={uploadingChatFiles || chatAttachments.length >= MAX_CHAT_ATTACHMENTS}
                              onClick={() => chatFileInputRef.current?.click()}
                              title="Anexar arquivos (máx 9 de até 30MB)"
                              style={{
                                height: 38,
                                minWidth: 38,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 8
                              }}
                            >
                              {chatAttachments.length > 0 ? `(${chatAttachments.length}/${MAX_CHAT_ATTACHMENTS})` : ''}
                            </Button>
                            <div style={{ flex: 1 }}>
                              <UniversalRichEditor
                                variant="chat"
                                value={newMessageText}
                                onChange={setNewMessageText}
                                onSend={handleSendMessage}
                                placeholder="Escreva uma mensagem para a equipe... (Ctrl+Enter para enviar)"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Empty description="Nenhuma sala selecionada" style={{ padding: '80px 0' }} />
                    )}
                  </Col>
                </Row>
              )
            },
            {
              key: 'announcements',
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <NotificationOutlined style={{ marginRight: 6 }} />
                  Mural de Comunicados
                  <GlowingCount count={posts.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
                </span>
              ),
              children: (
                <div>
                  {/* Announcement Filter Controls */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 20
                    }}
                  >
                    <Space wrap>
                      <Select
                        value={channelFilter}
                        onChange={setChannelFilter}
                        style={{ width: 200 }}
                        options={[
                          { value: 'all', label: 'Todos os Canais' },
                          ...channels.map(c => ({ value: c.id, label: `# ${c.name}` }))
                        ]}
                      />
                      <Select
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        style={{ width: 180 }}
                        options={[
                          { value: 'all', label: 'Todas as Prioridades' },
                          ...Object.entries(POST_PRIORITIES).map(([v, conf]) => ({
                            value: v,
                            label: conf.label
                          }))
                        ]}
                      />
                    </Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingPost(null);
                        setPostModalOpen(true);
                      }}
                    >
                      Novo Comunicado
                    </Button>
                  </div>

                  {/* Post Cards Feed */}
                  {filteredPosts.length === 0 ? (
                    <Empty description="Nenhum comunicado encontrado" style={{ padding: '60px 0' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {filteredPosts.map(post => {
                        const channel = channels.find(c => c.id === post.channel_id);
                        const author = users.find(u => u.id === post.author_id);
                        const postComms = comments.filter(c => c.post_id === post.id);
                        const likesCount = postLikes.filter(l => l.post_id === post.id).length;
                        const hasLiked = postLikes.some(
                          l => l.post_id === post.id && l.user_id === currentUser?.id
                        );
                        const priorityConf = POST_PRIORITIES[post.priority_level] || POST_PRIORITIES.routine;

                        return (
                          <Card
                            key={post.id}
                            variant="outlined"
                            style={{
                              borderRadius: 12,
                              borderLeft: `4px solid ${priorityConf.color === 'red' ? '#ef4444' : (priorityConf.color === 'orange' ? '#f59e0b' : '#3b82f6')}`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <div>
                                <Space wrap style={{ marginBottom: 6 }}>
                                  {post.is_pinned && <Tag color="gold"><PushpinOutlined /> Fixado</Tag>}
                                  <Tag color={priorityConf.color}>{priorityConf.label}</Tag>
                                  {channel && <Tag color="cyan"># {channel.name}</Tag>}
                                </Space>
                                <Title level={4} style={{ margin: 0 }}>
                                  {post.title}
                                </Title>
                              </div>
                              <Space>
                                <Button
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => {
                                    setEditingPost(post);
                                    setPostModalOpen(true);
                                  }}
                                />
                                <Popconfirm
                                  title="Excluir comunicado?"
                                  onConfirm={() => handleDeletePost(post.id)}
                                  okText="Sim"
                                  cancelText="Não"
                                >
                                  <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                              </Space>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <Avatar size="small" src={author?.avatar_url} icon={<UserOutlined />} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Por <strong>{author?.full_name || 'Equipe'}</strong> em{' '}
                                {dayjs(post.published_at || post.created_at).format('DD/MM/YYYY [às] HH:mm')}
                              </Text>
                            </div>

                            {post.summary && (
                              <Paragraph style={{ fontStyle: 'italic', color: isDark ? '#94a3b8' : '#64748b' }}>
                                {post.summary}
                              </Paragraph>
                            )}

                            <div
                              style={{ fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word' }}
                              className="selene-rich-content"
                              dangerouslySetInnerHTML={{
                                __html: post.content_rich_text?.startsWith('<')
                                  ? post.content_rich_text
                                  : (post.content_rich_text?.replace(/\n/g, '<br/>') || '')
                              }}
                            />

                            <Divider style={{ margin: '12px 0' }} />

                            {/* Actions & Comments section */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <Space>
                                <Button
                                  type={hasLiked ? 'primary' : 'default'}
                                  icon={hasLiked ? <LikeFilled /> : <LikeOutlined />}
                                  onClick={() => handleTogglePostLike(post.id)}
                                >
                                  {likesCount} {likesCount === 1 ? 'Curtida' : 'Curtidas'}
                                </Button>
                                <Text type="secondary">
                                  <CommentOutlined /> {postComms.length} comentários
                                </Text>
                              </Space>
                            </div>

                            {/* Comments List */}
                            {postComms.length > 0 && (
                              <div
                                style={{
                                  background: isDark ? '#0f172a' : '#f8fafc',
                                  padding: 12,
                                  borderRadius: 8,
                                  marginBottom: 12,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 8
                                }}
                              >
                                {postComms.map(comm => {
                                  const commAuthor = users.find(u => u.id === comm.user_id);
                                  return (
                                    <div key={comm.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                      <Avatar size="small" src={commAuthor?.avatar_url} icon={<UserOutlined />} />
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                          <Text strong style={{ fontSize: 12 }}>
                                            {commAuthor?.full_name || 'Colaborador'}
                                          </Text>
                                          <Text type="secondary" style={{ fontSize: 11 }}>
                                            {dayjs(comm.created_at).format('DD/MM HH:mm')}
                                          </Text>
                                        </div>
                                        <Text style={{ fontSize: 13 }}>{comm.content_text}</Text>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add Comment Input */}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Input
                                placeholder="Adicionar um comentário..."
                                size="small"
                                value={newCommentTexts[post.id] || ''}
                                onChange={e =>
                                  setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))
                                }
                                onPressEnter={() => handleAddComment(post.id)}
                              />
                              <Button
                                size="small"
                                type="primary"
                                onClick={() => handleAddComment(post.id)}
                              >
                                Comentar
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'calendar',
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  Agenda & Reuniões
                  <GlowingCount count={events.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 20
                    }}
                  >
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        Próximas Reuniões e Compromissos
                      </Title>
                      <Text type="secondary">
                        Sincronização de eventos, links de Google Meet / Zoom e atas de reuniões
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingEvent(null);
                        setEventModalOpen(true);
                      }}
                    >
                      Agendar Reunião
                    </Button>
                  </div>

                  {events.length === 0 ? (
                    <Empty description="Nenhum evento agendado" style={{ padding: '60px 0' }} />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {events.map(evt => {
                        const organizer = users.find(u => u.id === evt.organizer_id);
                        const cal = calendars.find(c => c.id === evt.calendar_id);
                        const loc = EVENT_LOCATIONS.find(l => l.value === evt.location_type);

                        return (
                          <Col xs={24} sm={12} lg={8} key={evt.id}>
                            <Card
                              variant="outlined"
                              style={{
                                borderRadius: 12,
                                borderTop: `4px solid ${cal?.color_hex || '#3b82f6'}`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                  <Tag color={cal?.color_hex || 'blue'}>{cal?.name || 'Geral'}</Tag>
                                  <Space>
                                    <Button
                                      size="small"
                                      type="text"
                                      icon={<EditOutlined />}
                                      onClick={() => {
                                        setEditingEvent(evt);
                                        setEventModalOpen(true);
                                      }}
                                    />
                                    <Popconfirm
                                      title="Cancelar este evento?"
                                      onConfirm={() => handleDeleteEvent(evt.id)}
                                    >
                                      <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </Space>
                                </div>

                                <Title level={5} style={{ margin: '0 0 6px 0' }}>
                                  {evt.title}
                                </Title>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                  <ClockCircleOutlined style={{ color: '#0284c7' }} />
                                  <Text strong style={{ fontSize: 13 }}>
                                    {dayjs(evt.start_at).format('DD/MM/YYYY HH:mm')} - {dayjs(evt.end_at).format('HH:mm')}
                                  </Text>
                                </div>

                                {evt.description && (
                                  <Paragraph
                                    ellipsis={{ rows: 2 }}
                                    style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 13 }}
                                  >
                                    {evt.description}
                                  </Paragraph>
                                )}

                                {evt.physical_location && (
                                  <div style={{ fontSize: 12, marginBottom: 6 }}>
                                    📍 <strong>Local:</strong> {evt.physical_location}
                                  </div>
                                )}
                              </div>

                              <div style={{ marginTop: 16 }}>
                                {evt.meeting_url ? (
                                  <Button
                                    type="primary"
                                    block
                                    icon={<VideoCameraOutlined />}
                                    href={evt.meeting_url}
                                    target="_blank"
                                    style={{ borderRadius: 6 }}
                                  >
                                    Entrar na Reunião ({loc?.label || 'Virtual'})
                                  </Button>
                                ) : (
                                  <Button block disabled style={{ borderRadius: 6 }}>
                                    Reunião Presencial
                                  </Button>
                                )}
                              </div>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>
              )
            },
            {
              key: 'notes',
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FileTextOutlined style={{ marginRight: 6 }} />
                  Notas & Ideias
                  <GlowingCount count={notes.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
                </span>
              ),
              children: (
                <div>
                  {/* Notes Filter Bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 20
                    }}
                  >
                    <Space wrap>
                      <Select
                        value={noteFolderFilter}
                        onChange={setNoteFolderFilter}
                        style={{ width: 200 }}
                        options={[
                          { value: 'all', label: 'Todas as Pastas' },
                          ...noteFolders.map(f => ({ value: f, label: f }))
                        ]}
                      />
                    </Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingNote(null);
                        setNoteModalOpen(true);
                      }}
                    >
                      Nova Nota
                    </Button>
                  </div>

                  {filteredNotes.length === 0 ? (
                    <Empty description="Nenhuma nota encontrada" style={{ padding: '60px 0' }} />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {filteredNotes.map(note => {
                        const tags = Array.isArray(note.tags_json) ? note.tags_json : [];
                        return (
                          <Col xs={24} sm={12} md={8} lg={6} key={note.id}>
                            <Card
                              variant="outlined"
                              style={{
                                borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(26, 35, 56, 0.85)' : (note.color_hex || '#ffffff'),
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.06)'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                  <Tag color="cyan">{note.folder_name || 'Geral'}</Tag>
                                  <Space>
                                    {note.is_pinned && <PushpinOutlined style={{ color: '#eab308' }} />}
                                    <Button
                                      size="small"
                                      type="text"
                                      icon={<EditOutlined />}
                                      onClick={() => {
                                        setEditingNote(note);
                                        setNoteModalOpen(true);
                                      }}
                                    />
                                    <Popconfirm
                                      title="Excluir anotação?"
                                      onConfirm={() => handleDeleteNote(note.id)}
                                    >
                                      <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </Space>
                                </div>

                                <Title level={5} style={{ margin: '0 0 8px 0' }}>
                                  {note.title}
                                </Title>

                                <div
                                  style={{
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    color: isDark ? '#cbd5e1' : '#334155',
                                    maxHeight: 180,
                                    overflowY: 'auto',
                                    wordBreak: 'break-word'
                                  }}
                                  className="selene-rich-content"
                                  dangerouslySetInnerHTML={{
                                    __html: note.content_rich_text?.startsWith('<')
                                      ? note.content_rich_text
                                      : (note.content_rich_text?.replace(/\n/g, '<br/>') || '')
                                  }}
                                />
                              </div>

                              <div style={{ marginTop: 12 }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                  {tags.map((t, idx) => (
                                    <Tag key={idx} style={{ fontSize: 11 }}>#{t}</Tag>
                                  ))}
                                </div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  Atualizado em {dayjs(note.updated_at || note.created_at).format('DD/MM/YYYY')}
                                </Text>
                              </div>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Modals */}
      <ChatRoomModal
        visible={roomModalOpen}
        initialValues={editingRoom}
        onClose={() => setRoomModalOpen(false)}
        onSuccess={onRefresh}
        users={users}
      />

      <CalendarEventModal
        visible={eventModalOpen}
        initialValues={editingEvent}
        onClose={() => setEventModalOpen(false)}
        onSuccess={onRefresh}
        calendars={calendars}
        users={users}
        currentUser={currentUser}
      />

      <CollabNoteModal
        visible={noteModalOpen}
        initialValues={editingNote}
        onClose={() => setNoteModalOpen(false)}
        onSuccess={onRefresh}
        currentUser={currentUser}
      />

      <AnnouncementModal
        visible={postModalOpen}
        initialValues={editingPost}
        onClose={() => setPostModalOpen(false)}
        onSuccess={onRefresh}
        channels={channels}
        currentUser={currentUser}
      />
    </div>
  );
};
