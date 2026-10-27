import React, { useState, useRef } from 'react';
import { Card, Input, Button, Avatar, Select, Space, Tag, message, Spin, Tooltip } from 'antd';
import {
  SendOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  PaperClipOutlined,
  NotificationOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  DeleteOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';
import { uploadTusFile } from '../../../../services/tusUploader';
import { apiRequest } from '../../../../services/api';

const MAX_ATTACHMENTS = 9;
const MAX_FILE_SIZE_BYTES = Number(import.meta.env.VITE_TUSD_MAX_SIZE) || 32000000;
const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));

export const PostComposer = ({ groups = [], currentUser, onPostCreated }) => {
  const { isDark } = useAppTheme();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('post');
  const [groupId, setGroupId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      message.warning(`Você pode anexar no máximo ${MAX_ATTACHMENTS} arquivos por publicação.`);
      e.target.value = '';
      return;
    }

    setUploadingFiles(true);
    const newAttachments = [...attachments];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        message.error(`O arquivo "${file.name}" excede o limite máximo de ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      let type = 'document';
      if (file.type?.startsWith('image/')) type = 'image';
      else if (file.type?.startsWith('video/')) type = 'video';

      try {
        message.loading({ content: `Enviando "${file.name}"...`, key: `upload-${file.name}`, duration: 0 });
        const res = await uploadTusFile(file);
        if (res?.url) {
          newAttachments.push({
            id: Math.random().toString(36).substring(2, 9),
            url: res.url,
            name: file.name,
            size: file.size,
            type
          });
          message.success({ content: `"${file.name}" anexado!`, key: `upload-${file.name}` });
        }
      } catch (err) {
        console.error('Erro no upload de anexo:', err);
        message.error({ content: `Erro ao enviar "${file.name}".`, key: `upload-${file.name}` });
      }
    }

    setAttachments(newAttachments);
    setUploadingFiles(false);
    e.target.value = '';
  };

  const handleRemoveAttachment = (attId) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handlePublish = async () => {
    const stripped = content.replace(/<[^>]*>/g, '').trim();
    if (!stripped && !content.includes('<img') && attachments.length === 0) {
      message.warning('Por favor, digite o conteúdo ou adicione anexos à sua publicação.');
      return;
    }

    setLoading(true);
    try {
      // 1. Resolve current user ID if not passed
      let tenantId = currentUser?.tenant_id;
      let authorId = currentUser?.id;
      if (!authorId || !tenantId) {
        try {
          const meRes = await apiRequest('/me');
          const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
          authorId = authorId || meData?.id;
          tenantId = tenantId || meData?.tenant_id;
        } catch (e) {
          console.warn('Erro ao consultar /me no PostComposer:', e);
        }
      }

      // 2. Insert into posts
      const postPayload = {
        group_id: groupId || null,
        post_type: postType,
        content_text: content.trim() || ' ',
        metrics_json: { likes: 0, shares: 0, views: 0 },
        relevance_score: 10.0,
        status: 'published'
      };
      if (tenantId) postPayload.tenant_id = tenantId;
      if (authorId) postPayload.user_id = authorId;

      const res = await apiRequest('/posts', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(postPayload)
      });

      if (!res.ok) {
        message.error(res.data?.message || 'Erro ao publicar post');
        return;
      }

      // 3. Resolve created post ID (from response or latest user post)
      let createdPost = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!createdPost?.id) {
        const checkRes = await apiRequest(`/posts?user_id=eq.${authorId}&order=created_at.desc&limit=1`);
        if (checkRes.ok && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
          createdPost = checkRes.data[0];
        }
      }

      // 4. Save up to 9 attachments
      if (createdPost?.id && attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          const att = attachments[i];
          await apiRequest('/posts_attachments', {
            method: 'POST',
            headers: { 'Prefer': 'return=representation' },
            body: JSON.stringify({
              tenant_id: tenantId,
              post_id: createdPost.id,
              url: att.url,
              attachment_type: att.type,
              display_order: i,
              is_deleted: false
            })
          });
        }
      }

      message.success('Publicação realizada com sucesso!');
      setContent('');
      setAttachments([]);
      setGroupId(null);
      setPostType('post');

      if (onPostCreated) onPostCreated();
    } catch {
      message.error('Erro de conexão ao publicar.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
    backdropFilter: 'blur(12px)',
    marginBottom: '20px'
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: '20px' } }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <Avatar
          size={44}
          src={currentUser?.avatar_url}
          icon={<UserOutlined />}
          style={{
            background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)',
            flexShrink: 0
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <UniversalRichEditor
            variant="compact"
            value={content}
            onChange={setContent}
            placeholder="Compartilhe novidades, ideias ou comunicados com a organização..."
            minHeight={100}
          />

          {/* Bandeja de Anexos do Post (Até 9 arquivos, máx 30MB) */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFilesSelected}
            accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
            style={{ display: 'none' }}
          />

          {attachments.length > 0 && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                background: isDark ? 'rgba(15, 23, 42, 0.7)' : '#f8fafc',
                border: isDark ? '1px dashed #334155' : '1px dashed #cbd5e1',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                  Bandeja de Anexos ({attachments.length}/9) • Limite de 30MB cada
                </span>
                {attachments.length < MAX_ATTACHMENTS && (
                  <Button
                    type="link"
                    size="small"
                    icon={<PaperClipOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFiles}
                  >
                    Adicionar mais
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {attachments.map((att) => {
                  let icon = <PaperClipOutlined />;
                  let color = 'default';
                  if (att.type === 'video') {
                    icon = <VideoCameraOutlined />;
                    color = 'purple';
                  } else if (att.type === 'image') {
                    icon = <PictureOutlined />;
                    color = 'blue';
                  } else {
                    color = 'orange';
                  }

                  const sizeMb = (att.size / (1024 * 1024)).toFixed(1);
                  return (
                    <Tag
                      key={att.id}
                      color={color}
                      closable
                      onClose={() => handleRemoveAttachment(att.id)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {icon}
                      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.name}
                      </span>
                      <span style={{ opacity: 0.75, fontSize: '10px' }}>({sizeMb} MB)</span>
                    </Tag>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '14px'
          }}>
            <Space wrap size="small">
              <Button
                type={attachments.length > 0 ? 'primary' : 'default'}
                icon={uploadingFiles ? <LoadingOutlined /> : <PaperClipOutlined />}
                loading={uploadingFiles}
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= MAX_ATTACHMENTS}
                style={{ borderRadius: '8px', fontSize: '13px' }}
              >
                Anexar Mídias / Docs ({attachments.length}/9)
              </Button>

              <Select
                placeholder="Tipo"
                value={postType}
                onChange={setPostType}
                style={{ width: 140 }}
                options={[
                  { value: 'post', label: '💬 Post Regular' },
                  { value: 'announcement', label: '📢 Comunicado' },
                  { value: 'discussion', label: '💡 Ideia / Tópico' }
                ]}
              />

              {groups.length > 0 && (
                <Select
                  placeholder="Feed Geral (Todos)"
                  allowClear
                  value={groupId}
                  onChange={setGroupId}
                  style={{ width: 170 }}
                  options={groups.map(g => ({
                    value: g.id,
                    label: `👥 ${g.name}`
                  }))}
                />
              )}
            </Space>

            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading}
              onClick={handlePublish}
              style={{
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
                border: 'none',
                fontWeight: 600,
                padding: '0 20px',
                height: '38px',
                boxShadow: '0 4px 14px rgba(217, 70, 239, 0.3)'
              }}
            >
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
