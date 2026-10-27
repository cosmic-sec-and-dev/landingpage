export const EVENTS_SCHEMA = {
  applet: 'Events',
  title: 'Gestão de Eventos, Ingressos & Credenciamento',
  description: 'Publicação de eventos presenciais e online, lotes de ingressos com precificação, credenciamento via QR Code e emissão de bilhetes.',
  tables: [
    'event_posts',
    'event_categories',
    'event_tags',
    'event_tiers',
    'event_tickets'
  ]
};

export const EVENT_STATUS_CONFIG = {
  draft: { color: 'default', label: 'Rascunho' },
  published: { color: 'green', label: 'Publicado' },
  cancelled: { color: 'red', label: 'Cancelado' },
  completed: { color: 'blue', label: 'Concluído' }
};

export const LOCATION_TYPE_CONFIG = {
  physical: { color: 'orange', label: 'Presencial', icon: '📍' },
  online: { color: 'cyan', label: 'Online / Streaming', icon: '🌐' },
  hybrid: { color: 'purple', label: 'Híbrido', icon: '🔄' }
};

export const TICKET_STATUS_CONFIG = {
  valid: { color: 'green', label: 'Válido' },
  checked_in: { color: 'blue', label: 'Check-in Realizado' },
  cancelled: { color: 'red', label: 'Cancelado' }
};
