export const MODULE_TAG = 'identity_profile';

export const ENDPOINTS = {
  me: {
    name: 'Identidade & Perfil do Usuário',
    path: '/me',
    singular: 'Perfil',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: false },
      { name: 'email', type: 'string', format: '', required: true },
      { name: 'name', type: 'string', format: '', required: false },
      { name: 'avatar_url', type: 'string', format: '', required: false },
      { name: 'phone', type: 'string', format: '', required: false },
      { name: 'role', type: 'string', format: '', required: false },
      { name: 'is_active', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
