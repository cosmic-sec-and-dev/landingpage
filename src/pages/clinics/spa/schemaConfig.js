export const CLINICS_SCHEMA = {
  applet: 'Clinics',
  title: 'Clínicas, Consultórios & Saúde',
  description: 'Gestão integrada de agendamentos, emissão de senhas, prontuários eletrônicos, corpo clínico e roteamento append-only de atendimento.',
  tables: [
    'clinic_appointments',
    'clinic_queue_tickets',
    'clinic_ticket_routings',
    'clinic_professionals',
    'clinic_patient_records',
    'catalog_items',
    'clinic_rooms',
    'clinic_treatment_plans',
    'clinic_specialties'
  ]
};

export const APPOINTMENT_STATUS_COLORS = {
  scheduled: { color: 'blue', label: 'Agendado', bg: 'rgba(59, 130, 246, 0.1)' },
  confirmed: { color: 'cyan', label: 'Confirmado', bg: 'rgba(6, 182, 212, 0.1)' },
  in_progress: { color: 'purple', label: 'Em Atendimento', bg: 'rgba(168, 85, 247, 0.1)' },
  completed: { color: 'green', label: 'Concluído', bg: 'rgba(34, 197, 94, 0.1)' },
  cancelled: { color: 'red', label: 'Cancelado', bg: 'rgba(239, 68, 68, 0.1)' },
  no_show: { color: 'orange', label: 'Não Compareceu', bg: 'rgba(249, 115, 22, 0.1)' }
};

export const TICKET_PRIORITY_CONFIG = {
  urgent: { label: 'Urgente / Emergência', color: '#ef4444', prefix: 'U', bg: 'rgba(239, 68, 68, 0.12)' },
  preferential: { label: 'Preferencial (Lei 10.048)', color: '#f59e0b', prefix: 'P', bg: 'rgba(245, 158, 11, 0.12)' },
  normal: { label: 'Atendimento Geral', color: '#3b82f6', prefix: 'N', bg: 'rgba(59, 130, 246, 0.12)' },
  exam_pickup: { label: 'Exames & Resultados', color: '#10b981', prefix: 'E', bg: 'rgba(16, 185, 129, 0.12)' }
};

export const TICKET_STATUS_CONFIG = {
  waiting: { label: 'Aguardando', color: 'blue' },
  called: { label: 'Chamado', color: 'gold' },
  in_service: { label: 'Em Atendimento', color: 'purple' },
  completed: { label: 'Finalizado', color: 'green' },
  no_show: { label: 'Ausente', color: 'volcano' },
  cancelled: { label: 'Cancelado', color: 'red' }
};

export const ROOM_TYPE_LABELS = {
  reception_counter: 'Guichê / Recepção',
  triage_station: 'Sala de Triagem',
  consulting_room: 'Consultório Médico',
  procedure_room: 'Sala de Procedimentos',
  exam_lab: 'Laboratório / Exames'
};
