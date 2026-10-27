import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  message,
  Spin,
  Modal,
  QRCode,
  Switch,
  DatePicker
} from 'antd';
import {
  SaveOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SendOutlined,
  EyeOutlined,
  SettingOutlined,
  QrcodeOutlined,
  CopyOutlined,
  DownloadOutlined,
  PictureOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TusUpload } from '../../../../components/upload/TusUpload';
import { apiRequest } from '../../../../services/api';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const ArticleWriterView = ({
  initialRecord = null,
  attachments = [],
  currentUser,
  onClose,
  onSaved
}) => {
  const { isDark } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(0); // 0: Editor, 1: Config & Publicação

  // Document state
  const [pageId, setPageId] = useState(initialRecord?.id || null);
  const [title, setTitle] = useState(initialRecord?.title || '');
  const [slug, setSlug] = useState(initialRecord?.slug || '');
  const [contentRichText, setContentRichText] = useState(initialRecord?.content_rich_text || '');
  const [excerpt, setExcerpt] = useState(initialRecord?.excerpt || '');
  const [bannerUrl, setBannerUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState(initialRecord?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialRecord?.meta_description || '');
  const [isPublished, setIsPublished] = useState(initialRecord?.is_published || false);
  const [publishedAt, setPublishedAt] = useState(
    initialRecord?.published_at ? dayjs(initialRecord.published_at) : null
  );

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // References
  const isSavingRef = useRef(false);
  const stateRef = useRef({
    pageId,
    title,
    slug,
    contentRichText,
    excerpt,
    bannerUrl,
    metaTitle,
    metaDescription,
    isPublished,
    publishedAt,
    isDirty
  });

  // Keep stateRef fresh for intervals
  useEffect(() => {
    stateRef.current = {
      pageId,
      title,
      slug,
      contentRichText,
      excerpt,
      bannerUrl,
      metaTitle,
      metaDescription,
      isPublished,
      publishedAt,
      isDirty
    };
  }, [
    pageId,
    title,
    slug,
    contentRichText,
    excerpt,
    bannerUrl,
    metaTitle,
    metaDescription,
    isPublished,
    publishedAt,
    isDirty
  ]);

  // Load initial banner
  useEffect(() => {
    if (initialRecord?.id) {
      const existing = attachments.find(a => a.page_id === initialRecord.id && !a.is_deleted);
      if (existing?.url) {
        setBannerUrl(existing.url);
      } else {
        apiRequest(`/pages_attachments?page_id=eq.${initialRecord.id}&is_deleted=eq.false&limit=1`)
          .then(res => {
            if (res.ok && Array.isArray(res.data) && res.data[0]?.url) {
              setBannerUrl(res.data[0].url);
            }
          })
          .catch(() => {});
      }
    }
  }, [initialRecord?.id]);

  // Helper to resolve user tenant/author
  const resolveTenantAndAuthor = useCallback(async () => {
    let tenantId = currentUser?.tenant_id;
    let authorId = currentUser?.id;
    if (!tenantId || !authorId) {
      try {
        const meRes = await apiRequest('/me');
        if (meRes.ok && meRes.data) {
          const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
          tenantId = tenantId || meData?.tenant_id;
          authorId = authorId || meData?.id;
        }
      } catch (err) {
        console.warn('Falha ao obter /me:', err);
      }
    }
    return { tenantId, authorId };
  }, [currentUser]);

  // Create initial empty draft if starting fresh
  useEffect(() => {
    if (!initialRecord?.id && !pageId) {
      setLoadingInitial(true);
      (async () => {
        try {
          const { tenantId, authorId } = await resolveTenantAndAuthor();
          const initialDraftSlug = `rascunho-${Date.now().toString(36)}`;
          const initialDraftTitle = 'Rascunho sem título';

          const createPayload = {
            title: initialDraftTitle,
            slug: initialDraftSlug,
            content_type: 'rich_text',
            content_rich_text: '<p></p>',
            is_published: false
          };
          if (tenantId) createPayload.tenant_id = tenantId;
          if (authorId) createPayload.author_id = authorId;

          const res = await apiRequest('/pages', {
            method: 'POST',
            body: JSON.stringify(createPayload)
          });

          if (res.ok) {
            const pageData = Array.isArray(res.data) ? res.data[0] : res.data;
            if (pageData?.id) {
              setPageId(pageData.id);
              setTitle(initialDraftTitle);
              setSlug(initialDraftSlug);
              setContentRichText('<p></p>');
              setLastSavedTime(new Date());
              setSaveStatus('saved');
            }
          }
        } catch (err) {
          console.error('Erro ao inicializar rascunho:', err);
        } finally {
          setLoadingInitial(false);
        }
      })();
    } else if (initialRecord?.id) {
      setPageId(initialRecord.id);
      setTitle(initialRecord.title || '');
      setSlug(initialRecord.slug || '');
      setContentRichText(initialRecord.content_rich_text || '');
      setLastSavedTime(new Date());
      setSaveStatus('saved');
    }
  }, [initialRecord?.id]);

  // Save changes to database (PATCH)
  const saveDocument = useCallback(async (isManual = false) => {
    const s = stateRef.current;
    if (!s.pageId || isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const cleanTitle = s.title.trim() || 'Rascunho sem título';
      const cleanSlug = s.slug.trim() || `artigo-${Date.now().toString(36)}`;

      let resolvedDate = null;
      if (s.publishedAt) {
        resolvedDate = dayjs.isDayjs(s.publishedAt)
          ? s.publishedAt.toISOString()
          : new Date(s.publishedAt).toISOString();
      } else if (s.isPublished) {
        resolvedDate = new Date().toISOString();
      }

      const patchPayload = {
        title: cleanTitle,
        slug: cleanSlug,
        content_type: 'rich_text',
        content_rich_text: s.contentRichText || '<p></p>',
        excerpt: s.excerpt?.trim() || null,
        meta_title: s.metaTitle?.trim() || null,
        meta_description: s.metaDescription?.trim() || null,
        is_published: s.isPublished,
        published_at: resolvedDate
      };

      const res = await apiRequest(`/pages?id=eq.${s.pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(patchPayload)
      });

      if (res.ok) {
        // Save banner in pages_attachments
        const banner = s.bannerUrl?.trim();
        if (banner) {
          const checkAtt = await apiRequest(`/pages_attachments?page_id=eq.${s.pageId}&is_deleted=eq.false&limit=1`);
          let existingAtt = checkAtt.ok && Array.isArray(checkAtt.data) && checkAtt.data.length > 0
            ? checkAtt.data[0]
            : null;

          if (existingAtt) {
            if (existingAtt.url !== banner) {
              await apiRequest(`/pages_attachments?id=eq.${existingAtt.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ url: banner, updated_at: new Date().toISOString() })
              });
            }
          } else {
            const { tenantId } = await resolveTenantAndAuthor();
            const attPayload = {
              page_id: s.pageId,
              url: banner,
              attachment_type: 'featured_image',
              display_order: 0,
              is_deleted: false
            };
            if (tenantId) attPayload.tenant_id = tenantId;

            await apiRequest('/pages_attachments', {
              method: 'POST',
              body: JSON.stringify(attPayload)
            });
          }
        }

        setSaveStatus('saved');
        setLastSavedTime(new Date());
        setIsDirty(false);
        if (isManual) {
          message.success('Documento salvo com sucesso!');
        }
      } else {
        setSaveStatus('error');
        if (isManual) {
          message.error('Erro ao salvar documento.');
        }
      }
    } catch (err) {
      console.error('Erro no salvamento:', err);
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [resolveTenantAndAuthor]);

  // Auto-save every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (stateRef.current.isDirty && stateRef.current.pageId) {
        saveDocument(false);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [saveDocument]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveDocument]);

  // Title change with auto-slug
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    stateRef.current.title = val;
    setIsDirty(true);
    setSaveStatus('dirty');

    // If new draft, auto-generate clean slug
    if (!initialRecord?.id) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      if (autoSlug) {
        setSlug(autoSlug);
        stateRef.current.slug = autoSlug;
      }
    }
  };

  // Callback de registro de imagem em pages_attachments quando upload for feito via TipTap
  const handleImageUploaded = async (uploadedUrl) => {
    const currentPageId = stateRef.current.pageId;
    if (currentPageId) {
      try {
        const { tenantId } = await resolveTenantAndAuthor();
        const attPayload = {
          page_id: currentPageId,
          url: uploadedUrl,
          attachment_type: 'inline_image',
          display_order: 1,
          is_deleted: false
        };
        if (tenantId) attPayload.tenant_id = tenantId;
        await apiRequest('/pages_attachments', {
          method: 'POST',
          body: JSON.stringify(attPayload)
        });
      } catch (attErr) {
        console.warn('Aviso: falha ao registrar em pages_attachments:', attErr);
      }
    }
  };

  // Complete and publish post
  const handleFinalPublish = async () => {
    setIsPublished(true);
    stateRef.current.isPublished = true;
    await saveDocument(false);
    message.success('Artigo salvo e publicado com sucesso!');
    if (onSaved) onSaved();
  };

  const cleanSlug = (slug || '').trim().replace(/^\/+/, '');
  const articleUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${cleanSlug || 'artigo'}`
    : `https://seusite.com/${cleanSlug || 'artigo'}`;

  const handleDownloadQrCode = (elementId = 'cms-article-qrcode') => {
    const container = document.getElementById(elementId);
    const canvas = container?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `qrcode-${cleanSlug || 'artigo'}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      message.success('Download do QR Code concluído!');
    } else {
      const svg = container?.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `qrcode-${cleanSlug || 'artigo'}.svg`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        message.success('Download do QR Code concluído!');
      } else {
        message.error('Não foi possível capturar o QR Code.');
      }
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Top Header / Actions Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          background: isDark ? 'rgba(26, 35, 56, 0.9)' : '#ffffff',
          padding: '12px 20px',
          borderRadius: 12,
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <Space size="middle">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (isDirty) {
                saveDocument(false);
              }
              if (onClose) onClose();
            }}
          >
            Voltar para Artigos
          </Button>

          <Divider type="vertical" style={{ height: 24 }} />

          {/* Auto-save Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {saveStatus === 'saving' && (
              <Tag icon={<Spin size="small" />} color="processing">
                Salvando rascunho...
              </Tag>
            )}
            {saveStatus === 'saved' && (
              <Tag icon={<CheckCircleOutlined style={{ color: '#10b981' }} />} color="success">
                Salvo {lastSavedTime ? dayjs(lastSavedTime).format('HH:mm:ss') : 'agora'}
              </Tag>
            )}
            {saveStatus === 'dirty' && (
              <Tag icon={<CloudSyncOutlined />} color="warning">
                Alterações pendentes (salvando em 5s)
              </Tag>
            )}
            {saveStatus === 'error' && (
              <Tag color="error">
                Erro ao salvar rascunho
              </Tag>
            )}
          </div>
        </Space>

        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={() => saveDocument(true)}
            loading={saveStatus === 'saving'}
          >
            Salvar (Ctrl+S)
          </Button>

          {currentStep === 0 ? (
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => {
                saveDocument(false);
                setCurrentStep(1);
              }}
            >
              Configurar & Publicar
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleFinalPublish}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Publicar Artigo
            </Button>
          )}
        </Space>
      </div>

      {/* Wizard Steps Navigation Bar (Tabs com Número Capitalizado Drop-Cap em Grid) */}
      <Card
        variant="borderless"
        style={{
          marginBottom: 20,
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderRadius: 12,
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
        }}
        styles={{ body: { padding: '8px 12px' } }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 10
          }}
        >
          {[
            {
              index: 0,
              number: '01',
              title: 'Redação & Conteúdo',
              description: 'Processador visual de texto ou markdown',
              icon: <FileTextOutlined />
            },
            {
              index: 1,
              number: '02',
              title: 'Configurações & Publicação',
              description: 'Banner, slug, SEO e agendamento',
              icon: <SettingOutlined />
            }
          ].map((s) => {
            const isActive = currentStep === s.index;
            const primaryColor = isDark ? '#38bdf8' : '#0284c7';
            const activeBg = isDark
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(14, 116, 144, 0.25) 100%)'
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
            const inactiveBg = isDark ? 'rgba(15, 23, 42, 0.35)' : '#f8fafc';
            const activeBorder = isDark ? '#38bdf8' : '#0284c7';
            const inactiveBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

            return (
              <div
                key={s.index}
                role="button"
                tabIndex={0}
                onClick={() => {
                  saveDocument(false);
                  setCurrentStep(s.index);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    saveDocument(false);
                    setCurrentStep(s.index);
                  }
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: isActive ? activeBg : inactiveBg,
                  border: `2px solid ${isActive ? activeBorder : inactiveBorder}`,
                  boxShadow: isActive
                    ? (isDark ? '0 2px 10px rgba(56, 189, 248, 0.25)' : '0 2px 8px rgba(2, 132, 199, 0.15)')
                    : 'none',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                {/* Coluna 1: Número Enorme / Capitalizado (Drop-Cap) */}
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                    lineHeight: 1,
                    fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
                    color: isActive ? primaryColor : (isDark ? '#475569' : '#94a3b8'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 44,
                    letterSpacing: '-1.5px',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {s.number}
                </div>

                {/* Coluna 2: Grid 1 Coluna x 2 Linhas */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: 'auto auto',
                    gap: 2,
                    minWidth: 0
                  }}
                >
                  {/* Linha 1: Título e Ícone */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 700,
                      color: isActive ? (isDark ? '#f8fafc' : '#0f172a') : (isDark ? '#94a3b8' : '#475569'),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    <span style={{ color: isActive ? primaryColor : 'inherit', fontSize: 15 }}>
                      {s.icon}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </span>
                    {isActive && (
                      <Tag
                        color={isDark ? 'cyan' : 'blue'}
                        bordered={false}
                        style={{
                          marginLeft: 'auto',
                          fontSize: 10,
                          lineHeight: '18px',
                          padding: '0 6px',
                          borderRadius: 4,
                          fontWeight: 700
                        }}
                      >
                        Ativo
                      </Tag>
                    )}
                  </div>

                  {/* Linha 2: Descrição */}
                  <div
                    style={{
                      fontSize: 12,
                      color: isDark ? '#64748b' : '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {s.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* STEP 0: WRITER / DOCUMENT EDITOR */}
      {currentStep === 0 && (
        <div>
          {loadingInitial ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Space direction="vertical" align="center" size="middle">
                <Spin size="large" />
                <Typography.Text type="secondary">Inicializando documento de rascunho...</Typography.Text>
              </Space>
            </div>
          ) : (
            <div>
              {/* Document Title Header */}
              <div
                style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  borderRadius: 12,
                  padding: '16px 24px',
                  marginBottom: 16
                }}
              >
                <Input
                  variant="borderless"
                  size="large"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Título do Documento..."
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    padding: 0,
                    color: isDark ? '#f8fafc' : '#0f172a',
                    lineHeight: 1.2
                  }}
                />
              </div>

              {/* Universal TipTap Rich Text Editor */}
              <UniversalRichEditor
                variant="document"
                value={contentRichText}
                onChange={(html) => {
                  setContentRichText(html);
                  stateRef.current.contentRichText = html;
                  setIsDirty(true);
                  setSaveStatus('dirty');
                }}
                onImageUploaded={handleImageUploaded}
                placeholder="Comece a redigir seu artigo aqui..."
                minHeight={550}
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 1: CONFIGURAÇÕES DO POST & PUBLICAÇÃO */}
      {currentStep === 1 && (
        <Row gutter={[20, 20]}>
          {/* Coluna Esquerda: Mídia e SEO */}
          <Col xs={24} lg={15}>
            {/* Imagem de Destaque / Banner */}
            <Card
              title={
                <span>
                  <PictureOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
                  Imagem de Destaque / Banner
                </span>
              }
              style={{ marginBottom: 20, borderRadius: 12 }}
            >
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                Faça upload do arquivo da imagem ou informe uma URL direta para a capa do artigo.
              </Text>

              <TusUpload
                value={bannerUrl}
                onChange={(url) => {
                  const clean = url || '';
                  setBannerUrl(clean);
                  setIsDirty(true);
                  setSaveStatus('dirty');
                }}
                placeholder="Cole a URL ou envie o arquivo da imagem de destaque..."
                accept="image/*"
                showPreview={true}
              />

              {bannerUrl && (
                <div style={{ marginTop: 16 }}>
                  <Divider style={{ margin: '12px 0 16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text strong style={{ fontSize: 13 }}>Pré-visualização do Banner</Text>
                    <Button
                      size="small"
                      danger
                      onClick={() => {
                        setBannerUrl('');
                        setIsDirty(true);
                        setSaveStatus('dirty');
                      }}
                    >
                      Remover Capa
                    </Button>
                  </div>
                  <div
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                      maxHeight: 260,
                      background: '#020617',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      style={{ width: '100%', maxHeight: 260, objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Otimização para Motores de Busca (SEO) */}
            <Card
              title={
                <span>
                  <GlobalOutlined style={{ marginRight: 8, color: '#10b981' }} />
                  Otimização para Motores de Busca (Google SEO)
                </span>
              }
              style={{ borderRadius: 12 }}
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Título SEO (Meta Title)
                </Text>
                <Input
                  value={metaTitle}
                  onChange={(e) => {
                    setMetaTitle(e.target.value);
                    setIsDirty(true);
                    setSaveStatus('dirty');
                  }}
                  placeholder="Título otimizado para motores de busca (50-60 caracteres)"
                  maxLength={70}
                  showCount
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Descrição SEO (Meta Description)
                </Text>
                <TextArea
                  value={metaDescription}
                  onChange={(e) => {
                    setMetaDescription(e.target.value);
                    setIsDirty(true);
                    setSaveStatus('dirty');
                  }}
                  rows={3}
                  placeholder="Resumo conciso que aparecerá na página de resultados de busca..."
                  maxLength={180}
                  showCount
                />
              </div>

              {/* Google Preview Snippet */}
              <div
                style={{
                  background: isDark ? '#0f172a' : '#f8fafc',
                  padding: 16,
                  borderRadius: 8,
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
                }}
              >
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Prévia do Resultado de Busca
                </Text>
                <div style={{ marginTop: 6, fontSize: 16, color: '#2563eb', fontWeight: 600 }}>
                  {metaTitle || title || 'Título do seu artigo'}
                </div>
                <div style={{ fontSize: 12, color: '#10b981', margin: '2px 0' }}>
                  https://seusite.com/{slug || 'slug-do-artigo'}
                </div>
                <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#475569' }}>
                  {metaDescription || excerpt || 'Nenhuma descrição informada. Escreva uma descrição atrativa para captar cliques nas buscas.'}
                </div>
              </div>
            </Card>
          </Col>

          {/* Coluna Direita: URL, Publicação e Ações */}
          <Col xs={24} lg={9}>
            <Card
              title={
                <span>
                  <SendOutlined style={{ marginRight: 8, color: '#8b5cf6' }} />
                  Publicação & Visibilidade
                </span>
              }
              style={{ marginBottom: 20, borderRadius: 12 }}
            >
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Status de Publicação
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch
                    checked={isPublished}
                    onChange={(checked) => {
                      setIsPublished(checked);
                      setIsDirty(true);
                      setSaveStatus('dirty');
                    }}
                    checkedChildren="No Ar"
                    unCheckedChildren="Rascunho"
                  />
                  <Text strong style={{ color: isPublished ? '#10b981' : '#64748b' }}>
                    {isPublished ? 'Artigo Disponível Publicamente' : 'Salvo como Rascunho Interno'}
                  </Text>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Data de Publicação / Agendamento
                </Text>
                <DatePicker
                  showTime
                  value={publishedAt}
                  onChange={(date) => {
                    setPublishedAt(date);
                    setIsDirty(true);
                    setSaveStatus('dirty');
                  }}
                  style={{ width: '100%' }}
                  placeholder="Selecione data e hora de publicação"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Slug (URL Amigável)
                </Text>
                <Input
                  addonBefore="/"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsDirty(true);
                    setSaveStatus('dirty');
                  }}
                  placeholder="slug-amigavel-do-artigo"
                />
              </div>

              {/* QR Code da URL */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text strong>
                    <QrcodeOutlined style={{ marginRight: 6, color: '#8b5cf6' }} />
                    QR Code da URL
                  </Text>
                  {showQrCode && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setQrModalOpen(true)}
                      style={{ padding: 0, height: 'auto', fontSize: 12 }}
                    >
                      Ampliar
                    </Button>
                  )}
                </div>

                {showQrCode ? (
                  <div
                    style={{
                      padding: 16,
                      background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: 10,
                      textAlign: 'center'
                    }}
                  >
                    <div
                      id="cms-article-qrcode"
                      style={{
                        background: '#ffffff',
                        padding: 12,
                        borderRadius: 8,
                        display: 'inline-block',
                        marginBottom: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      <QRCode
                        value={articleUrl}
                        size={140}
                        bordered={false}
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <Text
                        type="secondary"
                        ellipsis
                        style={{ fontSize: 12, display: 'block', maxWidth: '100%' }}
                        title={articleUrl}
                      >
                        {articleUrl}
                      </Text>
                    </div>
                    <Space size="small" wrap style={{ justifyContent: 'center' }}>
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(articleUrl);
                          message.success('URL copiada!');
                        }}
                      >
                        Copiar URL
                      </Button>
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadQrCode('cms-article-qrcode')}
                      >
                        Baixar PNG
                      </Button>
                      <Button
                        size="small"
                        type="text"
                        onClick={() => setShowQrCode(false)}
                      >
                        Ocultar
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <Button
                    icon={<QrcodeOutlined />}
                    onClick={() => setShowQrCode(true)}
                    block
                    style={{
                      borderRadius: 8,
                      borderColor: '#8b5cf6',
                      color: '#8b5cf6'
                    }}
                  >
                    Gerar QR Code da URL
                  </Button>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Resumo / Chamada (Excerpt)
                </Text>
                <TextArea
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    setIsDirty(true);
                    setSaveStatus('dirty');
                  }}
                  rows={4}
                  placeholder="Breve resumo exibido nos cartões de artigos e listagens..."
                  maxLength={500}
                  showCount
                />
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<SendOutlined />}
                onClick={handleFinalPublish}
                style={{
                  background: isPublished ? '#10b981' : '#3b82f6',
                  borderColor: isPublished ? '#10b981' : '#3b82f6',
                  height: 48,
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: 8
                }}
              >
                {isPublished ? 'Atualizar Artigo Publicado' : 'Publicar Artigo Agora'}
              </Button>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal para Visualização Ampliada do QR Code */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrcodeOutlined style={{ color: '#8b5cf6' }} />
            <span>QR Code da Publicação</span>
          </div>
        }
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalOpen(false)}>
            Fechar
          </Button>,
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(articleUrl);
              message.success('URL copiada!');
            }}
          >
            Copiar URL
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadQrCode('cms-article-qrcode-modal')}
          >
            Baixar Imagem PNG
          </Button>
        ]}
        width={380}
        centered
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            id="cms-article-qrcode-modal"
            style={{
              background: '#ffffff',
              padding: 16,
              borderRadius: 12,
              display: 'inline-block',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              marginBottom: 16
            }}
          >
            <QRCode
              value={articleUrl}
              size={220}
              bordered={false}
            />
          </div>
          <Paragraph
            copyable
            style={{
              fontSize: 13,
              wordBreak: 'break-all',
              margin: 0,
              background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
              padding: '8px 12px',
              borderRadius: 6
            }}
          >
            {articleUrl}
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
};
