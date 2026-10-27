export const HELPDESK_SCHEMA = {
  applet: 'Helpdesk',
  title: 'Central de Atendimento & Helpdesk',
  description: 'Gestão omnicanal de chamados, suporte ao cliente, acordos de SLA, respostas rápidas e base de conhecimento.',
  tables: [
    'helpdesk_tickets',
    'helpdesk_ticket_messages',
    'helpdesk_departments',
    'helpdesk_categories',
    'helpdesk_sla_policies',
    'helpdesk_knowledge_articles',
    'helpdesk_canned_responses'
  ]
};

export const TICKET_STATUS_CONFIG = {
  open: { color: 'blue', label: 'Aberto', bg: 'rgba(59, 130, 246, 0.1)' },
  pending: { color: 'orange', label: 'Pendente / Aguardando', bg: 'rgba(249, 115, 22, 0.1)' },
  resolved: { color: 'green', label: 'Resolvido', bg: 'rgba(34, 197, 94, 0.1)' },
  closed: { color: 'default', label: 'Fechado / Arquivado', bg: 'rgba(100, 116, 139, 0.1)' }
};

export const TICKET_PRIORITIES = {
  urgent: { color: 'red', label: '🚨 Urgente' },
  high: { color: 'volcano', label: '🔥 Alta' },
  medium: { color: 'blue', label: '⚡ Média' },
  low: { color: 'default', label: '☕ Baixa' }
};
