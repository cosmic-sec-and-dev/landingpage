export const MODULE_TAG = 'tenants';

export const ENDPOINTS = {
  tenants: {
    name: 'Organizações & Tenants Multi-Tenant',
    path: '/tenants',
    singular: 'Organização / Tenant',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'name', type: 'string', format: '', required: false },
      { name: 'slug', type: 'string', format: '', required: false },
      { name: 'business_name', type: 'string', format: '', required: false },
      { name: 'business_id', type: 'string', format: '', required: false },
      { name: 'is_active', type: 'boolean', format: '', required: false },
      { name: 'settings', type: 'object', format: '', required: false },
      { name: 'metadata', type: 'object', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
