import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Input, Tag, Space, Image, Tooltip, Popconfirm, Dropdown, message, Carousel } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  BookOutlined,
  BookFilled,
  SendOutlined,
  MoreOutlined,
  DeleteOutlined,
  UserOutlined,
  NotificationOutlined,
  FireOutlined,
  TeamOutlined,
  PaperClipOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Text, Paragraph } = Typography;

export const DEFAULT_IMAGE_FALLBACK = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22350%22%20viewBox%3D%220%200%20600%20350%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%231e1b4b%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23312e81%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23g)%22%20width%3D%22600%22%20height%3D%22350%22%2F%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22150%22%20r%3D%2240%22%20fill%3D%22%236366f1%22%20opacity%3D%220.4%22%2F%3E%3Cpath%20d%3D%22M280%20165l15-20%2020%2025%2015-15%2020%2025H250z%22%20fill%3D%22%23a5b4fc%22%2F%3E%3Ctext%20fill%3D%22%23c7d2fe%22%20font-family%3D%22system-ui%2C%20sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22500%22%20x%3D%2250%25%22%20y%3D%22240%22%20text-anchor%3D%22middle%22%3EM%C3%ADdia%20da%20Publica%C3%A7%C3%A3o%3C%2Ftext%3E%3C%2Fsvg%3E";

export const PostCard = ({
  post,
  attachments = [],
  comments = [],
  likes = [],
  savedPosts = [],
  groups = [],
  profiles = [],
  users = [],
  currentUser,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentingLoading, setCommentingLoading] = useState(false);

  // Author resolution helper
  const resolveAuthor = (userId, rawAuthorName) => {
    if (currentUser && (userId === currentUser.id || (!userId && rawAuthorName && rawAuthorName === currentUser.full_name))) {
      return {
        name: currentUser.full_name || currentUser.username || currentUser.email || 'Você',
        avatar: currentUser.avatar_url,
        isMe: true
      };
    }
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        return {
          name: user.full_name || user.username || user.email || 'Usuário',
          avatar: user.avatar_url,
          isMe: false
        };
      }
      const profile = profiles.find(p => p.user_id === userId || p.id === userId);
      if (profile) {
        return {
          name: profile.display_name || profile.full_name || profile.username || 'Usuário',
          avatar: profile.avatar_url,
          isMe: false
        };
      }
    }
    if (rawAuthorName && rawAuthorName !== 'Colega de Equipe' && rawAuthorName !== 'Membro da Organização') {
      return { name: rawAuthorName, avatar: null, isMe: false };
    }
    if (userId) {
      return { name: `Membro (${userId.slice(0, 8)})`, avatar: null, isMe: false };
    }
    return { name: 'Membro da Organização', avatar: null, isMe: false };
  };

  // Collect attachments from relations AND direct post fields if present
  let postAttachments = attachments.filter(a => a.post_id === post.id && !a.is_deleted);
  if (postAttachments.length === 0) {
    if (post.image_url) postAttachments.push({ id: 'direct-img', url: post.image_url });
    else if (post.media_url) postAttachments.push({ id: 'direct-media', url: post.media_url });
    else if (post.attachment_url) postAttachments.push({ id: 'direct-att', url: post.attachment_url });
    else if (Array.isArray(post.attachments)) {
      postAttachments = post.attachments.map((u, i) => typeof u === 'string' ? { id: `att-${i}`, url: u } : u);
    }
  }

  const isVideo = (att) => {
    const type = (att?.attachment_type || '').toLowerCase();
    const url = (att?.url || '').toLowerCase();
    return type === 'video' || !!url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
  };

  const isImage = (att) => {
    const type = (att?.attachment_type || '').toLowerCase();
    const url = (att?.url || '').toLowerCase();
    return type === 'image' || !!url.match(/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i);
  };

  const mediaAttachments = postAttachments.filter(att => isVideo(att) || isImage(att));
  const docAttachments = postAttachments.filter(att => !mediaAttachments.includes(att));

  const postComments = comments.filter(c => c.post_id === post.id);
  const postLikes = likes.filter(l => l.post_id === post.id);
  
  const currentUserId = currentUser?.id;
  const isLikedByMe = postLikes.some(l => l.user_id === currentUserId);
  const isSavedByMe = savedPosts.some(s => s.post_id === post.id && s.user_id === currentUserId);
  const targetGroup = groups.find(g => g.id === post.group_id);
  const postAuthor = resolveAuthor(post.user_id || post.author_id, post.author_name);

  // Toggle Like
  const handleToggleLike = async () => {
    if (!currentUserId) {
      message.warning('Faça login para curtir');
      return;
    }

    try {
      if (isLikedByMe) {
        const myLike = postLikes.find(l => l.user_id === currentUserId);
        if (myLike?.id) {
          await apiRequest(`/likes?id=eq.${myLike.id}`, { method: 'DELETE' });
        }
      } else {
        await apiRequest('/likes', {
          method: 'POST',
          body: JSON.stringify({
            tenant_id: currentUser?.tenant_id || post.tenant_id,
            post_id: post.id,
            user_id: currentUserId,
            reaction_type: 'like'
          })
        });
      }
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao registrar reação');
    }
  };

  // Toggle Bookmark
  const handleToggleSave = async () => {
    if (!currentUserId) return;
    try {
      if (isSavedByMe) {
        const mySaved = savedPosts.find(s => s.post_id === post.id && s.user_id === currentUserId);
        if (mySaved?.id) {
          await apiRequest(`/saved_posts?id=eq.${mySaved.id}`, { method: 'DELETE' });
          message.info('Removido dos salvos');
        }
      } else {
        await apiRequest('/saved_posts', {
          method: 'POST',
          body: JSON.stringify({
            tenant_id: currentUser?.tenant_id || post.tenant_id,
            post_id: post.id,
            user_id: currentUserId
          })
        });
        message.success('Publicação salva nos seus favoritos!');
      }
      if (onRefresh) onRefresh();
    } catch {
      message.error('Erro ao salvar publicação');
    }
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommentingLoading(true);
    try {
      let authorId = currentUserId;
      let tenantId = currentUser?.tenant_id || post.tenant_id;
      if (!authorId || !tenantId) {
        const meRes = await apiRequest('/me');
        const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
        authorId = authorId || meData?.id;
        tenantId = tenantId || meData?.tenant_id;
      }

      const res = await apiRequest('/comments', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: tenantId,
          post_id: post.id,
          user_id: authorId,
          content_text: commentText.trim()
        })
      });
      if (res.ok) {
        message.success('Comentário enviado!');
        setCommentText('');
        if (onRefresh) onRefresh();
      } else {
        message.error('Falha ao enviar comentário');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setCommentingLoading(false);
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    try {
      const res = await apiRequest(`/posts?id=eq.${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('Publicação removida');
        if (onRefresh) onRefresh();
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  // Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const cardStyle = {
    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: isDark ? '0 6px 24px rgba(0, 0, 0, 0.2)' : '0 2px 12px rgba(0, 0, 0, 0.03)',
    backdropFilter: 'blur(10px)',
    marginBottom: '20px',
    transition: 'all 0.2s ease-in-out'
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'announcement':
        return <Tag color="error" icon={<NotificationOutlined />}>Comunicado Oficial</Tag>;
      case 'discussion':
        return <Tag color="processing" icon={<FireOutlined />}>Tópico / Discussão</Tag>;
      default:
        return null;
    }
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: '20px' } }}>
      {/* Post Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Avatar
            size={46}
            src={postAuthor.avatar}
            icon={<UserOutlined />}
            style={{
              background: postAuthor.isMe
                ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              boxShadow: '0 4px 10px rgba(168, 85, 247, 0.3)'
            }}
          >
            {postAuthor.name ? postAuthor.name.charAt(0).toUpperCase() : <UserOutlined />}
          </Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Text strong style={{ fontSize: '15px', color: isDark ? '#f8fafc' : '#0f172a' }}>
                {postAuthor.name}
              </Text>
              {postAuthor.isMe && (
                <Tag color="purple" style={{ fontSize: '11px', margin: 0 }}>Você</Tag>
              )}
              {getTypeBadge(post.post_type)}
              {targetGroup && (
                <Tag color="cyan" icon={<TeamOutlined />}>
                  {targetGroup.name}
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatDate(post.created_at)}
            </Text>
          </div>
        </div>

        <Dropdown
          menu={{
            items: [
              {
                key: 'delete',
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Excluir publicação?"
                    description="Esta ação não poderá ser desfeita."
                    onConfirm={handleDeletePost}
                    okText="Sim, excluir"
                    cancelText="Cancelar"
                  >
                    <span>Excluir publicação</span>
                  </Popconfirm>
                )
              }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" shape="circle" icon={<MoreOutlined />} />
        </Dropdown>
      </div>

      {/* Post Content */}
      <div
        style={{
          fontSize: '14.5px',
          lineHeight: '1.65',
          color: isDark ? '#e2e8f0' : 'rgba(26, 35, 56, 0.85)',
          marginBottom: '16px',
          wordBreak: 'break-word'
        }}
        className="selene-rich-content"
        dangerouslySetInnerHTML={{
          __html: post.content_text?.startsWith('<')
            ? post.content_text
            : (post.content_text?.replace(/\n/g, '<br/>') || '')
        }}
      />

      {/* Single Media (1 Image or 1 Video) */}
      {mediaAttachments.length === 1 && (
        <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden' }}>
          {isVideo(mediaAttachments[0]) ? (
            <video
              controls
              src={mediaAttachments[0].url}
              style={{
                width: '100%',
                maxHeight: '440px',
                borderRadius: '12px',
                backgroundColor: '#000',
                display: 'block'
              }}
            />
          ) : (
            <Image
              src={mediaAttachments[0].url}
              fallback={DEFAULT_IMAGE_FALLBACK}
              alt="Mídia da publicação"
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
          )}
        </div>
      )}

      {/* Slide / Carousel if more than 1 media (> 1 image or video) */}
      {mediaAttachments.length > 1 && (
        <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              padding: '3px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              backdropFilter: 'blur(4px)'
            }}
          >
            {mediaAttachments.length} mídias
          </div>
          <Carousel arrows dots style={{ borderRadius: '12px', overflow: 'hidden' }}>
            {mediaAttachments.map((att, idx) => (
              <div key={att.id || idx}>
                <div
                  style={{
                    height: '420px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark ? '#020617' : '#0f172a',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  {isVideo(att) ? (
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
                      fallback={DEFAULT_IMAGE_FALLBACK}
                      alt={`Mídia ${idx + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '420px',
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

      {/* Document Attachments (PDFs, Docs, Spreadsheets, Zips) */}
      {docAttachments.length > 0 && (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {docAttachments.map((doc, idx) => {
            const fileName = doc.url.split('/').pop() || 'Arquivo Anexo';
            return (
              <a
                key={doc.id || idx}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  textDecoration: 'none'
                }}
              >
                <PaperClipOutlined style={{ fontSize: '18px', color: '#0284c7' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fileName}
                  </div>
                  <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Documento Anexo • Clique para baixar
                  </div>
                </div>
                <Button size="small" icon={<DownloadOutlined />}>
                  Baixar
                </Button>
              </a>
            );
          })}
        </div>
      )}

      {/* Actions & Metrics Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9'
      }}>
        <Space size="large">
          <Button
            type="text"
            icon={isLikedByMe ? <HeartFilled style={{ color: '#ec4899' }} /> : <HeartOutlined />}
            onClick={handleToggleLike}
            style={{
              color: isLikedByMe ? '#ec4899' : (isDark ? '#94a3b8' : '#64748b'),
              fontWeight: isLikedByMe ? 600 : 400
            }}
          >
            {postLikes.length} {postLikes.length === 1 ? 'Curtida' : 'Curtidas'}
          </Button>

          <Button
            type="text"
            icon={<CommentOutlined />}
            onClick={() => setShowComments(!showComments)}
            style={{ color: showComments ? '#a855f7' : (isDark ? '#94a3b8' : '#64748b') }}
          >
            {postComments.length} {postComments.length === 1 ? 'Comentário' : 'Comentários'}
          </Button>
        </Space>

        <Tooltip title={isSavedByMe ? 'Remover dos favoritos' : 'Salvar publicação'}>
          <Button
            type="text"
            icon={isSavedByMe ? <BookFilled style={{ color: '#8b5cf6' }} /> : <BookOutlined />}
            onClick={handleToggleSave}
            style={{ color: isSavedByMe ? '#8b5cf6' : (isDark ? '#94a3b8' : '#64748b') }}
          />
        </Tooltip>
      </div>

      {/* Comments Section Drawer */}
      {showComments && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9'
        }}>
          {/* New Comment Input */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <Avatar
              size={32}
              src={currentUser?.avatar_url}
              icon={<UserOutlined />}
              style={{ background: '#a855f7', flexShrink: 0 }}
            />
            <Input
              placeholder="Escreva um comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onPressEnter={handleAddComment}
              suffix={
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  loading={commentingLoading}
                  onClick={handleAddComment}
                  style={{
                    background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                />
              }
              style={{
                borderRadius: '20px',
                padding: '6px 14px',
                background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc'
              }}
            />
          </div>

          {/* Comments List */}
          {postComments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {postComments.map((c) => {
                const commentAuthor = resolveAuthor(c.user_id, c.author_name);
                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '10px 14px',
                      background: isDark ? 'rgba(26, 35, 56, 0.4)' : '#f8fafc',
                      borderRadius: '12px',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9'
                    }}
                  >
                    <Avatar
                      size={30}
                      src={commentAuthor.avatar}
                      icon={<UserOutlined />}
                      style={{
                        background: commentAuthor.isMe ? '#a855f7' : '#64748b'
                      }}
                    >
                      {commentAuthor.name ? commentAuthor.name.charAt(0).toUpperCase() : <UserOutlined />}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size={6}>
                          <Text strong style={{ fontSize: '13px' }}>
                            {commentAuthor.name}
                          </Text>
                          {commentAuthor.isMe && (
                            <Tag color="purple" style={{ fontSize: '10px', margin: 0, padding: '0 4px', lineHeight: '16px' }}>
                              Você
                            </Tag>
                          )}
                        </Space>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatDate(c.created_at)}
                        </Text>
                      </div>
                      <Paragraph style={{ margin: '4px 0 0', fontSize: '13.5px', color: isDark ? '#cbd5e1' : '#334155' }}>
                        {c.content_text}
                      </Paragraph>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0', color: '#94a3b8', fontSize: '13px' }}>
              Seja o primeiro a comentar nesta publicação!
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
