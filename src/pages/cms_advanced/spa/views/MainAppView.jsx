import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Radio,
  Tabs,
  Button,
  Tag,
  Statistic,
  Empty,
  Space,
  Switch,
  Typography,
  Popconfirm,
  message,
  Table,
  Image
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  LayoutOutlined,
  FormatPainterOutlined,
  PictureOutlined,
  GlobalOutlined,
  CodeOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { ArticleWriterView } from '../components/ArticleWriterView';
import { ArticleCard } from '../components/ArticleCard';
import { ThemeEditorModal } from '../components/ThemeEditorModal';
import { SidebarBuilderModal } from '../components/SidebarBuilderModal';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { apiRequest } from '../../../../services/api';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;

export const MainAppView = ({
  pages = [],
  attachments = [],
  sidebars = [],
  themes = [],
  themeAttachments = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'sidebars' | 'themes' | 'media'
  const [articleFilter, setArticleFilter] = useState('all'); // 'all' | 'published' | 'drafts'
  const [searchQuery, setSearchQuery] = useState('');

  // State
  const [editingArticle, setEditingArticle] = useState(null);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const [editingSidebar, setEditingSidebar] = useState(null);

  // Statistics
  const totalArticles = pages.length;
  const publishedCount = pages.filter(p => p.is_published).length;
  const draftsCount = pages.filter(p => !p.is_published).length;
  const activeThemesCount = themes.filter(t => t.is_active).length;
  const activeSidebarsCount = sidebars.filter(s => s.is_active).length;

  // Filter articles
  const filteredArticles = pages.filter(p => {
    if (articleFilter === 'published' && !p.is_published) return false;
    if (articleFilter === 'drafts' && p.is_published) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchSlug = (p.slug || '').toLowerCase().includes(q);
      const matchExcerpt = (p.excerpt || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchExcerpt) return false;
    }
    return true;
  });

  const handleDeleteSidebar = async (id) => {
    try {
      const res = await apiRequest(`/blogger_sidebars?id=eq.${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('Barra lateral removida');
        onRefresh();
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  const handleDeleteTheme = async (id) => {
    try {
      const res = await apiRequest(`/blogger_themes?id=eq.${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('Tema removido');
        onRefresh();
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  const mainTabs = [
    {
      key: 'writer',
      label: (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '3px 12px',
            borderRadius: 8,
            background: isDark
              ? (activeTab === 'writer'
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 116, 144, 0.35) 100%)'
                  : 'rgba(56, 189, 248, 0.12)')
              : (activeTab === 'writer'
                  ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
                  : '#f0f9ff'),
            border: isDark
              ? (activeTab === 'writer' ? '1.5px solid #38bdf8' : '1px dashed rgba(56, 189, 248, 0.6)')
              : (activeTab === 'writer' ? '1.5px solid #0284c7' : '1px dashed #7dd3fc'),
            color: isDark ? '#38bdf8' : '#0284c7',
            fontWeight: 700,
            boxShadow: activeTab === 'writer'
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
        <ArticleWriterView
          key={editingArticle?.id || 'new-draft'}
          initialRecord={editingArticle}
          attachments={attachments}
          currentUser={currentUser}
          onClose={() => {
            setActiveTab('articles');
            setEditingArticle(null);
            onRefresh();
          }}
          onSaved={() => {
            onRefresh();
          }}
        />
      )
    },
    {
      key: 'articles',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ marginRight: 6 }} />
          Artigos & Páginas
          <GlowingCount
            count={totalArticles}
            color={isDark ? '#38bdf8' : '#0284c7'}
            isDark={isDark}
          />
        </span>
      ),
      children: (
        <div>
          <Card
            variant="borderless"
            style={{
              marginBottom: 20,
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12
            }}
            styles={{ body: {padding: '14px 20px'} }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} sm={12} md={10}>
                <Radio.Group
                  value={articleFilter}
                  onChange={e => setArticleFilter(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">Todos ({totalArticles})</Radio.Button>
                  <Radio.Button value="published">Publicados ({publishedCount})</Radio.Button>
                  <Radio.Button value="drafts">Rascunhos ({draftsCount})</Radio.Button>
                </Radio.Group>
              </Col>

              <Col xs={24} sm={12} md={14}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar artigo ou URL slug..."
                    allowClear
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 220 }}
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
                      setEditingArticle(null);
                      setActiveTab('writer');
                    }}
                  >
                    Novo Artigo / Página
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {filteredArticles.length === 0 ? (
            <Empty
              description="Nenhum artigo ou página encontrado."
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingArticle(null);
                  setActiveTab('writer');
                }}
              >
                Escrever Primeiro Artigo
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredArticles.map(article => (
                <Col xs={24} sm={12} lg={8} xl={6} key={article.id}>
                  <ArticleCard
                    article={article}
                    attachments={attachments}
                    onEdit={(rec) => {
                      setEditingArticle(rec);
                      setActiveTab('writer');
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    },
    {
      key: 'sidebars',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <LayoutOutlined style={{ marginRight: 6 }} />
          Barras Laterais & Widgets
          <GlowingCount
            count={sidebars.length}
            color={isDark ? '#c084fc' : '#9333ea'}
            isDark={isDark}
          />
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingSidebar(null);
                setSidebarModalOpen(true);
              }}
            >
              Nova Barra Lateral
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            {sidebars.map(sidebar => (
              <Col xs={24} sm={12} md={8} key={sidebar.id}>
                <Card
                  title={sidebar.name}
                  extra={
                    <Tag color={sidebar.is_active ? 'green' : 'default'}>
                      {sidebar.is_active ? 'Ativo' : 'Inativo'}
                    </Tag>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingSidebar(sidebar);
                        setSidebarModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>,
                    <Popconfirm
                      title="Excluir barra lateral?"
                      okText="Sim"
                      cancelText="Não"
                      onConfirm={() => handleDeleteSidebar(sidebar.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        Excluir
                      </Button>
                    </Popconfirm>
                  ]}
                  style={{
                    borderRadius: 12,
                    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff'
                  }}
                >
                  <p><strong>Posição:</strong> <Tag color="blue">{sidebar.position || 'Direita'}</Tag></p>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Configuração de Widgets:</Text>
                    <pre style={{
                      maxHeight: 120,
                      overflow: 'auto',
                      fontSize: 11,
                      background: isDark ? '#0f172a' : '#f8fafc',
                      padding: 8,
                      borderRadius: 6,
                      marginTop: 6
                    }}>
                      {sidebar.widgets_order_json ? JSON.stringify(sidebar.widgets_order_json, null, 2) : 'Nenhum widget'}
                    </pre>
                  </div>
                </Card>
              </Col>
            ))}
            {sidebars.length === 0 && (
              <Col span={24}>
                <Empty description="Nenhuma barra lateral cadastrada." />
              </Col>
            )}
          </Row>
        </div>
      )
    },
    {
      key: 'themes',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <FormatPainterOutlined style={{ marginRight: 6 }} />
          Temas Visuais & Código
          <GlowingCount
            count={themes.length}
            color={isDark ? '#2dd4bf' : '#0d9488'}
            isDark={isDark}
          />
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTheme(null);
                setThemeModalOpen(true);
              }}
            >
              Criar Novo Tema
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            {themes.map(theme => (
              <Col xs={24} sm={12} md={8} key={theme.id}>
                <Card
                  title={theme.name}
                  extra={
                    <Tag color={theme.is_active ? 'green' : 'default'}>
                      {theme.is_active ? 'Tema Padrão' : 'Inativo'}
                    </Tag>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingTheme(theme);
                        setThemeModalOpen(true);
                      }}
                    >
                      Editar Código
                    </Button>,
                    <Popconfirm
                      title="Excluir tema?"
                      okText="Sim"
                      cancelText="Não"
                      onConfirm={() => handleDeleteTheme(theme.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        Excluir
                      </Button>
                    </Popconfirm>
                  ]}
                  style={{
                    borderRadius: 12,
                    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff'
                  }}
                >
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <div>
                      <Tag color="cyan">CSS Customizado: {theme.custom_css ? 'Sim' : 'Não'}</Tag>
                      <Tag color="purple">JavaScript: {theme.custom_js ? 'Sim' : 'Não'}</Tag>
                    </div>
                    {theme.custom_css && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Trecho CSS:</Text>
                        <pre style={{
                          maxHeight: 100,
                          overflow: 'auto',
                          fontSize: 11,
                          background: isDark ? '#0f172a' : '#f8fafc',
                          padding: 8,
                          borderRadius: 6
                        }}>
                          {theme.custom_css}
                        </pre>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
            {themes.length === 0 && (
              <Col span={24}>
                <Empty description="Nenhum tema customizado cadastrado." />
              </Col>
            )}
          </Row>
        </div>
      )
    },
    {
      key: 'media',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <PictureOutlined style={{ marginRight: 6 }} />
          Biblioteca de Mídias
          <GlowingCount
            count={attachments.length}
            color={isDark ? '#fbbf24' : '#d97706'}
            isDark={isDark}
          />
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]}>
            {attachments.filter(a => !a.is_deleted).map(att => (
              <Col xs={24} sm={12} md={8} lg={6} key={att.id}>
                <Card
                  cover={
                    <div style={{ height: 160, background: '#0f172a', overflow: 'hidden' }}>
                      <Image
                        src={att.url}
                        alt="Attachment"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(att.url);
                        message.success('URL da mídia copiada!');
                      }}
                    >
                      Copiar URL
                    </Button>
                  ]}
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                >
                  <Text ellipsis style={{ fontSize: 12 }}>{att.url}</Text>
                </Card>
              </Col>
            ))}
            {attachments.length === 0 && (
              <Col span={24}>
                <Empty description="Nenhuma mídia enviada ainda." />
              </Col>
            )}
          </Row>
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6} lg={4}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total Artigos</span>}
              value={totalArticles}
              prefix={<FileTextOutlined style={{ color: '#0284c7' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Publicados (No Ar)</span>}
              value={publishedCount}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Rascunhos</span>}
              value={draftsCount}
              prefix={<EditOutlined style={{ color: '#f59e0b' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Barras Laterais</span>}
              value={activeSidebarsCount}
              prefix={<LayoutOutlined style={{ color: '#a855f7' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Temas Ativos</span>}
              value={activeThemesCount}
              prefix={<FormatPainterOutlined style={{ color: '#06b6d4' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={mainTabs}
        size="large"
      />

      {/* Modals */}
      <ThemeEditorModal
        visible={themeModalOpen}
        record={editingTheme}
        onClose={() => {
          setThemeModalOpen(false);
          setEditingTheme(null);
        }}
        onSaved={() => {
          setThemeModalOpen(false);
          setEditingTheme(null);
          onRefresh();
        }}
      />

      <SidebarBuilderModal
        visible={sidebarModalOpen}
        record={editingSidebar}
        onClose={() => {
          setSidebarModalOpen(false);
          setEditingSidebar(null);
        }}
        onSaved={() => {
          setSidebarModalOpen(false);
          setEditingSidebar(null);
          onRefresh();
        }}
      />
    </div>
  );
};
