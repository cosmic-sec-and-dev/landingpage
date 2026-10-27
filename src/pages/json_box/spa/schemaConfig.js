export const MODULE_TAG = 'json_box';

export const ENDPOINTS = {
  json_boxes: {
    name: 'Caixas & Documentos JSON',
    path: '/json_boxes',
    singular: 'Documento JSON',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'slug', type: 'string', format: '', required: true },
      { name: 'name', type: 'string', format: '', required: true },
      { name: 'data', type: 'object', format: '', required: false },
      { name: 'metadata', type: 'object', format: '', required: false },
      { name: 'is_active', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  },
  json_boxes_attachments: {
    name: 'Anexos de Documentos JSON',
    path: '/json_boxes_attachments',
    singular: 'Anexo',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'json_box_id', type: 'string', format: 'uuid', required: true },
      { name: 'url', type: 'string', format: '', required: true },
      { name: 'attachment_type', type: 'string', format: '', required: false },
      { name: 'display_order', type: 'integer', format: '', required: false },
      { name: 'is_deleted', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
