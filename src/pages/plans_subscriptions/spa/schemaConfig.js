export const MODULE_TAG = 'plans_subscriptions';

export const ENDPOINTS = {
  plans: {
    name: 'Planos de Acesso & Assinatura',
    path: '/plans',
    singular: 'Plano',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'name', type: 'string', format: '', required: false },
      { name: 'description', type: 'string', format: '', required: false },
      { name: 'is_active', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false }
    ]
  },
  subscriptions: {
    name: 'Assinaturas de Tenants',
    path: '/subscriptions',
    singular: 'Assinatura',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: false },
      { name: 'plan_id', type: 'string', format: 'uuid', required: false },
      { name: 'is_active', type: 'boolean', format: '', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
