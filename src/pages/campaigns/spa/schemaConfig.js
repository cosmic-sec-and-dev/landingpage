export const MODULE_TAG = 'campaigns';

export const ENDPOINTS = {
  campaigns: {
    name: 'Campanhas de Marketing & Engajamento',
    path: '/campaigns',
    singular: 'Campanha',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
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
  },
  campaign_contacts: {
    name: 'Leads & Destinatários da Campanha',
    path: '/campaign_contacts',
    singular: 'Contato / Lead',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'campaign_id', type: 'string', format: 'uuid', required: true },
      { name: 'user_id', type: 'string', format: 'uuid', required: false },
      { name: 'email', type: 'string', format: '', required: true },
      { name: 'read', type: 'boolean', format: '', required: false },
      { name: 'read_at', type: 'string', format: 'date-time', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false },
      { name: 'updated_at', type: 'string', format: 'date-time', required: false }
    ]
  }
};
