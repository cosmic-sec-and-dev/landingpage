export const MODULE_TAG = 'cms_advanced';

export const ENDPOINTS = {
  pages: {
    name: 'Páginas & Artigos',
    path: '/pages',
    singular: 'Página / Artigo',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'author_id', type: 'string', format: 'uuid', required: true },
      { name: 'title', type: 'string', format: '', required: true },
      { name: 'slug', type: 'string', format: '', required: true },
      { name: 'content_type', type: 'string', format: '', required: false },
      { name: 'content_rich_text', type: 'string', format: '', required: false },
      { name: 'content_raw_html', type: 'string', format: '', required: false },
      { name: 'content_markdown', type: 'string', format: '', required: false },
      { name: 'content_json', type: 'object', format: '', required: false },
      { name: 'excerpt', type: 'string', format: '', required: false },
      { name: 'is_published', type: 'boolean', format: '', required: false },
      { name: 'published_at', type: 'string', format: 'date-time', required: false },
      { name: 'meta_title', type: 'string', format: '', required: false },
      { name: 'meta_description', type: 'string', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  },
  pages_attachments: {
    name: 'Anexos & Mídias de Páginas',
    path: '/pages_attachments',
    singular: 'Anexo de Página',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'page_id', type: 'string', format: 'uuid', required: true },
      { name: 'url', type: 'string', format: '', required: true },
      { name: 'attachment_type', type: 'string', format: '', required: false },
      { name: 'display_order', type: 'integer', format: '', required: false },
      { name: 'is_deleted', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  },
  blogger_sidebars: {
    name: 'Barras Laterais & Widgets',
    path: '/blogger_sidebars',
    singular: 'Barra Lateral',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'name', type: 'string', format: '', required: true },
      { name: 'position', type: 'string', format: '', required: false },
      { name: 'widgets_order_json', type: 'object', format: '', required: false },
      { name: 'is_active', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  },
  blogger_themes: {
    name: 'Temas & Customizações',
    path: '/blogger_themes',
    singular: 'Tema Visual',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'name', type: 'string', format: '', required: true },
      { name: 'custom_css', type: 'string', format: '', required: false },
      { name: 'custom_js', type: 'string', format: '', required: false },
      { name: 'custom_header', type: 'string', format: '', required: false },
      { name: 'custom_footer', type: 'string', format: '', required: false },
      { name: 'theme_config_json', type: 'object', format: '', required: false },
      { name: 'is_active', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  },
  blogger_themes_attachments: {
    name: 'Assets & Imagens de Temas',
    path: '/blogger_themes_attachments',
    singular: 'Asset de Tema',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'theme_id', type: 'string', format: 'uuid', required: true },
      { name: 'url', type: 'string', format: '', required: true },
      { name: 'attachment_type', type: 'string', format: '', required: false },
      { name: 'is_deleted', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
