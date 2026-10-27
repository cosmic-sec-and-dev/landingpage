import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Avatar,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Select,
  Divider,
  message,
  Image,
  Spin
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  PictureOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TusUpload } from '../../../../components/upload/TusUpload';
import { apiRequest } from '../../../../services/api';
import { DEFAULT_IMAGE_FALLBACK } from './PostCard';

const { Text, Paragraph } = Typography;

export const DirectChatDrawer = ({ open, onClose, chats = [], currentUser, onRefresh }) => {
  const { isDark } = useAppTheme();
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?.id || null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats]);

  const fetchChatMessages = async (chatId) => {
    if (!chatId) return;
    setLoading(true);
    try {
      const [msgsRes, attsRes] = await Promise.all([
        apiRequest(`/social_chat_messages?chat_id=eq.${chatId}&order=created_at.asc`),
        apiRequest('/social_chat_messages_attachments')
      ]);

      if (msgsRes.ok && Array.isArray(msgsRes.data)) {
        setMessages(msgsRes.data);
      }
      if (attsRes.ok && Array.isArray(attsRes.data)) {
        setAttachments(attsRes.data);
      }
    } catch {
      message.error('Erro ao carregar mensagens do chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      fetchChatMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!msgText.trim() && !mediaUrl) return;
    if (!selectedChatId) {
      message.warning('Selecione ou inicie uma conversa');
      return;
    }

    setSending(true);
    try {
      let senderId = currentUser?.id;
      if (!senderId) {
        const meRes = await apiRequest('/me');
        const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
        senderId = meData?.id;
      }

      const res = await apiRequest('/social_chat_messages', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: selectedChatId,
          sender_id: senderId,
          content_text: msgText.trim() || 'Foto anexa',
          type: 'active'
        })
      });

      if (res.ok) {
        const createdMsg = Array.isArray(res.data) ? res.data[0] : res.data;
        if (createdMsg?.id && mediaUrl) {
          await apiRequest('/social_chat_messages_attachments', {
            method: 'POST',
            body: JSON.stringify({
              social_chat_message_id: createdMsg.id,
              url: mediaUrl,
              attachment_type: 'image'
            })
          });
        }

        setMsgText('');
        setMediaUrl('');
        setShowUpload(false);
        fetchChatMessages(selectedChatId);
      } else {
        message.error('Erro ao enviar mensagem');
      }
    } catch {
      message.error('Erro de conexão ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const currentChat = chats.find(c => c.id === selectedChatId);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageOutlined style={{ color: '#d946ef', fontSize: '18px' }} />
          <span>Mensagens & Conversas Diretas</span>
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      destroyOnHidden
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          background: isDark ? '#0f172a' : '#f8fafc'
        }
      }}
    >
      {/* Chat Room Selector */}
      <div style={{ marginBottom: '16px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="Selecione uma conversa..."
          value={selectedChatId}
          onChange={setSelectedChatId}
          options={chats.map(c => ({
            value: c.id,
            label: `${c.chat_type === 'group' ? '👥' : '💬'} ${c.name || 'Chat Privado'}`
          }))}
        />
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
        borderRadius: '12px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
        ) : messages.length > 0 ? (
          messages.map((m) => {
            const isMine = m.sender_id === currentUser?.id;
            const msgAtts = attachments.filter(a => a.social_chat_message_id === m.id && !a.is_deleted);

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}
              >
                {!isMine && (
                  <Avatar size={28} icon={<UserOutlined />} style={{ background: '#64748b' }} />
                )}

                <div style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: isMine
                    ? 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)'
                    : (isDark ? 'rgba(26, 35, 56, 0.85)' : '#f1f5f9'),
                  color: isMine ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div
                    style={{ margin: 0, color: 'inherit', fontSize: '13.5px', wordBreak: 'break-word' }}
                    className="selene-rich-content"
                    dangerouslySetInnerHTML={{
                      __html: m.content_text?.startsWith('<')
                        ? m.content_text
                        : (m.content_text?.replace(/\n/g, '<br/>') || '')
                    }}
                  />

                  {msgAtts.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {msgAtts.map(att => (
                        <Image
                          key={att.id}
                          src={att.url}
                          fallback={DEFAULT_IMAGE_FALLBACK}
                          style={{ maxHeight: '140px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{
                    textAlign: isMine ? 'right' : 'left',
                    fontSize: '10px',
                    opacity: 0.75,
                    marginTop: '4px'
                  }}>
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            Nenhuma mensagem enviada nesta conversa ainda. Diga olá! 👋
          </div>
        )}
      </div>

      {/* Upload Box */}
      {showUpload && (
        <div style={{ marginTop: '12px', padding: '10px', background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#f1f5f9', borderRadius: '8px' }}>
          <TusUpload value={mediaUrl} onChange={setMediaUrl} placeholder="Foto para o chat" />
        </div>
      )}

      {/* Chat Composer Bottom */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button
          type={showUpload ? 'primary' : 'default'}
          shape="circle"
          icon={<PictureOutlined />}
          onClick={() => setShowUpload(!showUpload)}
        />

        <Input
          placeholder="Digite uma mensagem..."
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          onPressEnter={handleSendMessage}
          style={{
            borderRadius: '20px',
            padding: '8px 14px',
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff'
          }}
        />

        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          loading={sending}
          onClick={handleSendMessage}
          style={{
            background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
            border: 'none',
            flexShrink: 0
          }}
        />
      </div>
    </Drawer>
  );
};
