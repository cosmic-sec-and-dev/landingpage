export const ROOM_TYPES = [
  { value: 'direct_1on1', label: 'Conversa Direta (1:1)', color: 'blue' },
  { value: 'group', label: 'Grupo de Trabalho', color: 'purple' },
  { value: 'channel', label: 'Canal Departamental', color: 'cyan' }
];

export const POST_PRIORITIES = {
  routine: { label: 'Rotina', color: 'blue', bg: '#eff6ff' },
  important: { label: 'Importante', color: 'orange', bg: '#fff7ed' },
  urgent: { label: 'Urgente / Crítico', color: 'red', bg: '#fef2f2' }
};

export const POST_STATUSES = {
  draft: { label: 'Rascunho', color: 'default' },
  published: { label: 'Publicado', color: 'green' },
  archived: { label: 'Arquivado', color: 'volcano' }
};

export const EVENT_LOCATIONS = [
  { value: 'google_meet', label: 'Google Meet', icon: 'VideoCameraOutlined' },
  { value: 'zoom', label: 'Zoom Meetings', icon: 'VideoCameraAddOutlined' },
  { value: 'teams', label: 'Microsoft Teams', icon: 'TeamOutlined' },
  { value: 'in_person', label: 'Presencial / Sala de Reunião', icon: 'BankOutlined' },
  { value: 'phone', label: 'Ligação Telefônica', icon: 'PhoneOutlined' }
];

export const RSVP_STATUSES = {
  pending: { label: 'Pendente', color: 'orange' },
  accepted: { label: 'Confirmado', color: 'green' },
  declined: { label: 'Recusado', color: 'red' },
  tentative: { label: 'Talvez', color: 'purple' }
};
