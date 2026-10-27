import React, { useState } from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Switch,
  Tooltip,
  Modal,
  Popconfirm,
  message,
  Divider
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  GlobalOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleFilled,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Title, Text, Paragraph } = Typography;

export const ArticleCard = ({
  article,
  attachments = [],
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const featuredImg = attachments.find(a => a.page_id === article.id && !a.is_deleted);

  const handleTogglePublish = async (checked) => {
    setPublishing(true);
    try {
      const res = await apiRequest(`/pages?id=eq.${article.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_published: checked,
          published_at: checked ? (article.published_at || new Date().toISOString()) : article.published_at
        })
      });
      if (res.ok) {
        message.success(checked ? 'Artigo publicado!' : 'Artigo revertido para rascunho.');
        onRefresh();
      } else {
        message.error('Falha ao alterar status de publicação');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/pages?id=eq.${article.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Artigo excluído com sucesso');
        onRefresh();
      } else {
        message.error('Falha ao excluir artigo');
      }
    } catch {
      message.error('Erro de conexão ao excluir');
    }
  };

  return (
    <>
      <Card
        hoverable
        style={{
          borderRadius: 12,
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
        }}
        styles={{ body: {padding: 18,
          display: 'flex',
          flexDirection: 'column',
          flex: 1} }}
        cover={
          featuredImg ? (
            <div style={{ height: 160, overflow: 'hidden', background: '#0f172a' }}>
              <img
                src={featuredImg.url}
                alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : null
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <Tag color={article.is_published ? 'success' : 'default'} style={{ borderRadius: 6, fontWeight: 600 }}>
            {article.is_published ? 'PUBLICADO' : 'RASCUNHO'}
          </Tag>
          <Tag color="blue" style={{ borderRadius: 6, textTransform: 'uppercase', fontSize: 11 }}>
            {article.content_type || 'markdown'}
          </Tag>
        </div>

        <Title
          level={5}
          style={{
            marginBottom: 6,
            color: isDark ? '#f8fafc' : '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {article.title}
        </Title>

        <div style={{ marginBottom: 10 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <GlobalOutlined /> /{article.slug}
          </Text>
        </div>

        {article.excerpt && (
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{
              fontSize: 13,
              color: isDark ? '#94a3b8' : '#64748b',
              marginBottom: 12,
              flex: 1
            }}
          >
            {article.excerpt}
          </Paragraph>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarOutlined />
              {article.published_at ? dayjs(article.published_at).format('DD/MM/YYYY') : 'Não publicado'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Switch
                size="small"
                checked={article.is_published}
                loading={publishing}
                onChange={handleTogglePublish}
              />
              <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                {article.is_published ? 'No Ar' : 'Pausado'}
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Tooltip title="Pré-visualizar Conteúdo">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setPreviewVisible(true)}
              />
            </Tooltip>
            <Tooltip title="Editar Artigo">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<EditOutlined />}
                onClick={() => onEdit(article)}
              />
            </Tooltip>
            <Popconfirm
              title="Excluir este artigo?"
              description="A ação não pode ser desfeita."
              okText="Sim, Excluir"
              okType="danger"
              cancelText="Cancelar"
              onConfirm={handleDelete}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        title={`Pré-visualização: ${article.title}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Fechar
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setPreviewVisible(false);
              onEdit(article);
            }}
          >
            Editar Artigo
          </Button>
        ]}
        width={800}
      >
        <div style={{ padding: '12px 0' }}>
          <Title level={3}>{article.title}</Title>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Tag color={article.is_published ? 'green' : 'orange'}>
              {article.is_published ? 'Publicado' : 'Rascunho'}
            </Tag>
            <Tag color="blue">/{article.slug}</Tag>
            {article.meta_title && <Tag color="purple">SEO: {article.meta_title}</Tag>}
          </div>

          {featuredImg && (
            <div style={{ marginBottom: 20, maxHeight: 300, overflow: 'hidden', borderRadius: 8 }}>
              <img src={featuredImg.url} alt="Cover" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
            </div>
          )}

          {article.excerpt && (
            <blockquote style={{
              borderLeft: '4px solid #0284c7',
              paddingLeft: 16,
              margin: '0 0 20px 0',
              color: isDark ? '#94a3b8' : '#64748b',
              fontStyle: 'italic'
            }}>
              {article.excerpt}
            </blockquote>
          )}

          <Divider />

          {article.content_rich_text ? (
            <div
              className="cms-article-preview-content"
              dangerouslySetInnerHTML={{ __html: article.content_rich_text }}
              style={{ lineHeight: 1.8, fontSize: 15 }}
            />
          ) : article.content_markdown ? (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {article.content_markdown}
            </div>
          ) : (
            <Text type="secondary">Nenhum conteúdo textual preenchido.</Text>
          )}
          <style>{`
            .cms-article-preview-content img {
              max-width: 100% !important;
              height: auto !important;
              border-radius: 8px;
              margin: 12px 0;
              vertical-align: middle;
              display: inline-block !important;
            }
          `}</style>
        </div>
      </Modal>
    </>
  );
};
