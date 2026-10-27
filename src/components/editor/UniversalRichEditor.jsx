import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Space,
  Button,
  Tooltip,
  Select,
  Divider,
  Typography,
  message
} from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LinkOutlined,
  PictureOutlined,
  UndoOutlined,
  RedoOutlined,
  ClearOutlined,
  SendOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

import { useAppTheme } from '../../context/ThemeContext';
import { uploadTusFile } from '../../services/tusUploader';

const { Text } = Typography;

/**
 * UniversalRichEditor - Editor rico padronizado para todo o ecossistema Selene
 *
 * @param {string} value - Conteúdo HTML
 * @param {function} onChange - Callback invocado com o novo HTML
 * @param {string} variant - 'document' | 'compact' | 'chat' (padrão: 'document')
 * @param {string} placeholder - Texto placeholder
 * @param {number} minHeight - Altura mínima em pixels
 * @param {boolean} readOnly - Modo somente leitura
 * @param {function} onSend - Callback para variante 'chat' (Ctrl+Enter ou botão Enviar)
 * @param {function} onImageUploaded - Callback opcional após upload de imagem bem-sucedido
 */
export const UniversalRichEditor = ({
  value = '',
  onChange,
  variant = 'document',
  placeholder = 'Comece a redigir o conteúdo...',
  minHeight,
  readOnly = false,
  onSend,
  onImageUploaded,
  style = {}
}) => {
  const { isDark } = useAppTheme();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Calcular estatísticas básicas de texto
  const [stats, setStats] = useState({ words: 0, chars: 0, readTime: 1 });

  const calculateStats = useCallback((text) => {
    const clean = (text || '').trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const chars = clean.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    setStats({ words, chars, readTime });
  }, []);

  // Upload inline de imagem via TUS com inserção direta no TipTap
  const handleUploadImageFile = useCallback(async (file, editorInstance) => {
    if (!file || !file.type?.startsWith('image/')) {
      message.warning('Apenas imagens (PNG, JPG, WebP, GIF, SVG) são permitidas no corpo deste editor. Arquivos e vídeos devem ser adicionados na bandeja de anexos da publicação/mensagem.');
      return;
    }

    const maxSizeBytes = Number(import.meta.env.VITE_TUSD_MAX_SIZE) || 32000000;
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));

    if (file.size > maxSizeBytes) {
      message.error(`A imagem "${file.name}" excede o limite máximo permitido de ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);
    message.loading({ content: `Enviando imagem "${file.name}"...`, key: 'editor-upload', duration: 0 });

    try {
      const res = await uploadTusFile(file);
      const url = res?.url;
      if (!url) throw new Error('Falha ao obter URL pública do anexo.');

      if (editorInstance) {
        editorInstance.chain().focus().setImage({ src: url, alt: file.name || 'imagem' }).run();
      }

      message.success({ content: 'Imagem inserida com sucesso!', key: 'editor-upload' });
      if (onImageUploaded) onImageUploaded(url, file);
    } catch (err) {
      console.error('Erro no upload de imagem do editor:', err);
      message.error({ content: err.message || 'Erro ao enviar imagem.', key: 'editor-upload' });
    } finally {
      setIsUploading(false);
    }
  }, [onImageUploaded]);

  // Configuração do Editor TipTap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: isDark ? '#38bdf8' : '#0284c7', width: 2 }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'editor-link'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value || '',
    editable: !readOnly,
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.type?.startsWith('image/')) {
            event.preventDefault();
            handleUploadImageFile(file, editor);
            return true;
          } else {
            event.preventDefault();
            message.warning('Apenas imagens (PNG, JPG, WebP, GIF, SVG) são permitidas no corpo deste editor. Arquivos e vídeos devem ser adicionados na bandeja de anexos da publicação/mensagem.');
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
              if (item.type?.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                  handleUploadImageFile(file, editor);
                }
                return true;
              } else {
                event.preventDefault();
                message.warning('Apenas imagens (PNG, JPG, WebP, GIF, SVG) são permitidas no corpo deste editor. Arquivos e vídeos devem ser adicionados na bandeja de anexos da publicação/mensagem.');
                return true;
              }
            }
          }
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        if (variant === 'chat' && onSend && (event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          onSend();
          return true;
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
      calculateStats(editor.getText());
    }
  });

  // Sincronizar valor externo sem resetar cursor quando o usuário estiver digitando
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      if (value !== currentHtml && !editor.isFocused) {
        editor.commands.setContent(value || '', false);
        calculateStats(editor.getText());
      }
    }
  }, [value, editor, calculateStats]);

  // Seletor de Títulos H1-H3
  const getHeadingLevel = () => {
    if (!editor) return 'p';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'p';
  };

  const setHeadingLevel = (val) => {
    if (!editor) return;
    if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
  };

  // Diálogo para Link
  const handleInsertLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = prompt('Informe a URL do link:', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Cores dinâmicas de tema
  const colors = {
    toolbarBg: isDark ? '#1e293b' : '#f8fafc',
    toolbarBorder: isDark ? '#334155' : '#cbd5e1',
    paperBg: isDark ? '#1e293b' : '#ffffff',
    canvasBg: isDark ? '#0b1120' : '#e2e8f0',
    text: isDark ? '#e2e8f0' : '#1e293b',
    activeBg: isDark ? '#0284c7' : '#e0f2fe',
    activeText: isDark ? '#ffffff' : '#0284c7',
    btnText: isDark ? '#94a3b8' : '#64748b'
  };

  const defaultMinHeight = variant === 'document' ? 480 : (variant === 'compact' ? 140 : 80);
  const resolvedMinHeight = minHeight || defaultMinHeight;

  return (
    <div
      className={`universal-tiptap-editor variant-${variant}`}
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Hidden File Input para inserção de imagem */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadImageFile(file, editor);
          e.target.value = '';
        }}
      />

      {/* 1. BARRA DE FERRAMENTAS / TOOLBAR */}
      {!readOnly && editor && (
        <div
          style={{
            background: colors.toolbarBg,
            border: `1px solid ${colors.toolbarBorder}`,
            borderRadius: variant === 'document' ? '12px 12px 0 0' : '8px 8px 0 0',
            padding: variant === 'compact' ? '4px 8px' : '6px 14px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 4,
            borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
          }}
        >
          {/* Seletor de Título (somente Document ou Compact) */}
          {variant === 'document' && (
            <>
              <Select
                size="small"
                value={getHeadingLevel()}
                onChange={setHeadingLevel}
                style={{ width: 130 }}
                options={[
                  { label: 'Normal (Parágrafo)', value: 'p' },
                  { label: 'Título Principal (H1)', value: 'h1' },
                  { label: 'Subtítulo (H2)', value: 'h2' },
                  { label: 'Seção (H3)', value: 'h3' }
                ]}
              />
              <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
            </>
          )}

          {/* Formatação Básica: Bold, Italic, Underline, Strikethrough */}
          <Space size={2}>
            <Tooltip title="Negrito (Ctrl+B)">
              <Button
                size="small"
                type={editor.isActive('bold') ? 'primary' : 'text'}
                icon={<BoldOutlined />}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
            </Tooltip>
            <Tooltip title="Itálico (Ctrl+I)">
              <Button
                size="small"
                type={editor.isActive('italic') ? 'primary' : 'text'}
                icon={<ItalicOutlined />}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
            </Tooltip>
            <Tooltip title="Sublinhado (Ctrl+U)">
              <Button
                size="small"
                type={editor.isActive('underline') ? 'primary' : 'text'}
                icon={<UnderlineOutlined />}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              />
            </Tooltip>
            {variant !== 'chat' && (
              <Tooltip title="Tachado">
                <Button
                  size="small"
                  type={editor.isActive('strike') ? 'primary' : 'text'}
                  icon={<StrikethroughOutlined />}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                />
              </Tooltip>
            )}
          </Space>

          {/* Alinhamento de Texto */}
          {variant === 'document' && (
            <>
              <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
              <Space size={2}>
                <Tooltip title="Alinhar à Esquerda">
                  <Button
                    size="small"
                    type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'text'}
                    icon={<AlignLeftOutlined />}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  />
                </Tooltip>
                <Tooltip title="Centralizar">
                  <Button
                    size="small"
                    type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'text'}
                    icon={<AlignCenterOutlined />}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  />
                </Tooltip>
                <Tooltip title="Alinhar à Direita">
                  <Button
                    size="small"
                    type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'text'}
                    icon={<AlignRightOutlined />}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  />
                </Tooltip>
              </Space>
            </>
          )}

          {/* Listas e Citação */}
          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
          <Space size={2}>
            <Tooltip title="Lista com Marcadores">
              <Button
                size="small"
                type={editor.isActive('bulletList') ? 'primary' : 'text'}
                icon={<UnorderedListOutlined />}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
            </Tooltip>
            {variant !== 'chat' && (
              <Tooltip title="Lista Numerada">
                <Button
                  size="small"
                  type={editor.isActive('orderedList') ? 'primary' : 'text'}
                  icon={<OrderedListOutlined />}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                />
              </Tooltip>
            )}
            {variant === 'document' && (
              <Tooltip title="Citação em Bloco">
                <Button
                  size="small"
                  type={editor.isActive('blockquote') ? 'primary' : 'text'}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  “”
                </Button>
              </Tooltip>
            )}
          </Space>

          {/* Mídia e Links */}
          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
          <Space size={2}>
            <Tooltip title="Inserir Imagem (Upload TUS automático)">
              <Button
                size="small"
                type="text"
                loading={isUploading}
                icon={<PictureOutlined style={{ color: '#10b981' }} />}
                onClick={() => fileInputRef.current?.click()}
              />
            </Tooltip>
            <Tooltip title="Inserir Link">
              <Button
                size="small"
                type={editor.isActive('link') ? 'primary' : 'text'}
                icon={<LinkOutlined />}
                onClick={handleInsertLink}
              />
            </Tooltip>
            {variant === 'document' && (
              <Tooltip title="Divisor Horizontal">
                <Button
                  size="small"
                  type="text"
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                  ―
                </Button>
              </Tooltip>
            )}
          </Space>

          {/* Undo / Redo */}
          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
          <Space size={2}>
            <Tooltip title="Desfazer (Ctrl+Z)">
              <Button
                size="small"
                type="text"
                disabled={!editor.can().undo()}
                icon={<UndoOutlined />}
                onClick={() => editor.chain().focus().undo().run()}
              />
            </Tooltip>
            <Tooltip title="Refazer (Ctrl+Y)">
              <Button
                size="small"
                type="text"
                disabled={!editor.can().redo()}
                icon={<RedoOutlined />}
                onClick={() => editor.chain().focus().redo().run()}
              />
            </Tooltip>
            {variant === 'document' && (
              <Tooltip title="Limpar Formatação">
                <Button
                  size="small"
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                />
              </Tooltip>
            )}
          </Space>

          {/* Botão de Envio (variante chat) */}
          {variant === 'chat' && onSend && (
            <div style={{ marginLeft: 'auto' }}>
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={onSend}
              >
                Enviar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 2. ÁREA DO EDITOR (DOCUMENT PAPER OU CAIXA INTEGRADA) */}
      <div
        style={
          variant === 'document'
            ? {
              background: colors.canvasBg,
              padding: '24px 16px',
              border: `1px solid ${colors.toolbarBorder}`,
              borderTop: 'none',
              overflowX: 'auto',
              minHeight: resolvedMinHeight + 60
            }
            : {
              background: colors.paperBg,
              border: `1px solid ${colors.toolbarBorder}`,
              borderTop: readOnly ? `1px solid ${colors.toolbarBorder}` : 'none',
              borderRadius: readOnly ? 8 : (variant === 'compact' ? '0 0 8px 8px' : '0 0 8px 8px'),
              padding: '12px 16px',
              minHeight: resolvedMinHeight
            }
        }
      >
        <div
          style={
            variant === 'document'
              ? {
                width: '100%',
                maxWidth: 860,
                minWidth: 0,
                margin: '0 auto',
                minHeight: resolvedMinHeight,
                background: colors.paperBg,
                borderRadius: 6,
                boxShadow: isDark
                  ? '0 10px 30px rgba(0,0,0,0.5)'
                  : '0 8px 24px rgba(0,0,0,0.06)',
                padding: '36px 48px',
                boxSizing: 'border-box'
              }
              : {
                width: '100%',
                minHeight: resolvedMinHeight,
                boxSizing: 'border-box'
              }
          }
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 3. RODAPÉ DE STATUS (somente Document) */}
      {variant === 'document' && (
        <div
          style={{
            background: colors.toolbarBg,
            border: `1px solid ${colors.toolbarBorder}`,
            borderRadius: '0 0 12px 12px',
            borderTop: 'none',
            padding: '6px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#64748b'
          }}
        >
          <Space size="middle">
            <span><b>Palavras:</b> {stats.words}</span>
            <span><b>Caracteres:</b> {stats.chars}</span>
            <span><b>Tempo de leitura:</b> ~{stats.readTime} min</span>
          </Space>
          <span style={{ fontSize: 11, opacity: 0.8 }}>
            Dica: arraste ou cole imagens diretamente no documento
          </span>
        </div>
      )}

      {/* ESTILOS CSS ESCOPADOS DO TIPTAP */}
      <style>{`
        .universal-tiptap-editor .ProseMirror {
          outline: none !important;
          min-height: ${resolvedMinHeight - 40}px;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: ${variant === 'chat' ? '14px' : '15px'};
          line-height: ${variant === 'chat' ? '1.5' : '1.75'};
          color: ${colors.text};
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .universal-tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: ${isDark ? '#64748b' : '#94a3b8'};
          pointer-events: none;
          height: 0;
          font-style: normal;
        }

        .universal-tiptap-editor .ProseMirror img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          margin: 10px 0;
          vertical-align: middle;
          display: inline-block !important;
          object-fit: contain;
          box-sizing: border-box;
          border: ${isDark ? '1px solid #334155' : '1px solid #e2e8f0'};
        }

        .universal-tiptap-editor .ProseMirror h1 {
          font-size: 26px;
          font-weight: 800;
          margin: 18px 0 10px 0;
          line-height: 1.3;
          color: ${isDark ? '#f8fafc' : '#0f172a'};
        }

        .universal-tiptap-editor .ProseMirror h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 16px 0 8px 0;
          line-height: 1.35;
          color: ${isDark ? '#f1f5f9' : '#1e293b'};
        }

        .universal-tiptap-editor .ProseMirror h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 14px 0 6px 0;
          line-height: 1.4;
          color: ${isDark ? '#e2e8f0' : '#334155'};
        }

        .universal-tiptap-editor .ProseMirror blockquote {
          border-left: 3.5px solid ${isDark ? '#38bdf8' : '#0284c7'};
          padding-left: 14px;
          margin: 12px 0;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          font-style: italic;
        }

        .universal-tiptap-editor .ProseMirror hr {
          border: none;
          border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
          margin: 18px 0;
        }

        .universal-tiptap-editor .ProseMirror ul,
        .universal-tiptap-editor .ProseMirror ol {
          padding-left: 22px;
          margin: 8px 0;
        }

        .universal-tiptap-editor .ProseMirror a {
          color: ${isDark ? '#38bdf8' : '#0284c7'};
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
