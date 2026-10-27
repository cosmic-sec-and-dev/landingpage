export const MODULE_TAG = 'audit_system_logs';

export const ENDPOINTS = {
  nt_system_logs: {
    name: 'Logs de Auditoria do Sistema',
    path: '/nt_system_logs',
    singular: 'Log de Auditoria',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: false },
      { name: 'user_id', type: 'string', format: 'uuid', required: false },
      { name: 'category', type: 'string', format: '', required: false },
      { name: 'level', type: 'string', format: '', required: false },
      { name: 'message', type: 'string', format: '', required: false },
      { name: 'data', type: 'object', format: '', required: false },
      { name: 'ip_address', type: 'string', format: '', required: false },
      { name: 'user_agent', type: 'string', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
