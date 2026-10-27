export const MODULE_TAG = 'notifications';

export const ENDPOINTS = {
  push_notifications: {
    name: 'Notificações Push (Web & Mobile)',
    path: '/push_notifications',
    singular: 'Push Notification',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: false },
      { name: 'user_id', type: 'string', format: 'uuid', required: false },
      { name: 'title', type: 'string', format: '', required: true },
      { name: 'body', type: 'string', format: '', required: true },
      { name: 'target_type', type: 'string', format: '', required: false },
      { name: 'icon_url', type: 'string', format: '', required: false },
      { name: 'action_url', type: 'string', format: '', required: false },
      { name: 'data_json', type: 'object', format: '', required: false },
      { name: 'priority', type: 'string', format: '', required: false },
      { name: 'start_date', type: 'string', format: 'date-time', required: false },
      { name: 'end_date', type: 'string', format: 'date-time', required: false },
      { name: 'status', type: 'string', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  },
  email_notifications: {
    name: 'Notificações por E-mail (Transacionais)',
    path: '/email_notifications',
    singular: 'Notificação E-mail',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: false },
      { name: 'user_id', type: 'string', format: 'uuid', required: false },
      { name: 'subject', type: 'string', format: '', required: true },
      { name: 'body', type: 'string', format: '', required: true },
      { name: 'target_type', type: 'string', format: '', required: false },
      { name: 'action_url', type: 'string', format: '', required: false },
      { name: 'data_json', type: 'object', format: '', required: false },
      { name: 'priority', type: 'string', format: '', required: false },
      { name: 'start_date', type: 'string', format: 'date-time', required: false },
      { name: 'end_date', type: 'string', format: 'date-time', required: false },
      { name: 'status', type: 'string', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
