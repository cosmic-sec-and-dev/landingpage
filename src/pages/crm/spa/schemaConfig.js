export const CRM_SCHEMA = {
  applet: 'CRM',
  title: 'CRM & Funil de Vendas Comercial',
  description: 'Gestão de pipelines comerciais, negócios em negociação, leads qualificados e tarefas de follow-up.',
  tables: [
    'pipelines',
    'pipeline_stages',
    'deals',
    'contacts',
    'tasks',
    'interactions'
  ]
};

export const DEAL_STATUS_CONFIG = {
  open: { color: 'blue', label: 'Em Aberto', bg: 'rgba(59, 130, 246, 0.1)' },
  won: { color: 'green', label: 'Ganho / Fechado', bg: 'rgba(34, 197, 94, 0.1)' },
  lost: { color: 'red', label: 'Perdido', bg: 'rgba(239, 68, 68, 0.1)' }
};

export const CONTACT_TYPES = [
  { value: 'lead', label: '🎯 Lead / Prospecção' },
  { value: 'prospect', label: '🔍 Prospect Qualificado' },
  { value: 'customer', label: '⭐ Cliente Ativo' },
  { value: 'partner', label: '🤝 Parceiro Comercial' }
];
