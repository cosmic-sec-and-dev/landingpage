/**
 * Notekeep Module - Schema & Endpoint Configuration
 * Single Source of Truth (SSOT) from selene_backend/public/modules/notekeep/schema/SCHEMA.SQL
 */

export const MODULE_NAME = "Notekeep";
export const MODULE_TAG = "Notekeep";

export const ENDPOINTS = {
  notes: {
    key: "notekeep_notes",
    path: "/notekeep_notes",
    title: "Bloco de Notas & Anotações",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: false },
      { name: "title", type: "string", format: "", required: true },
      { name: "content", type: "string", format: "", required: false },
      { name: "color", type: "string", format: "", required: true, default: "default" },
      { name: "is_pinned", type: "boolean", format: "", required: false, default: false },
      { name: "is_archived", type: "boolean", format: "", required: false, default: false },
      { name: "is_trashed", type: "boolean", format: "", required: false, default: false },
      { name: "reminder_at", type: "string", format: "date-time", required: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  attachments: {
    key: "notekeep_notes_attachments",
    path: "/notekeep_notes_attachments",
    title: "Anexos & Mídias das Notas",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "notekeep_note_id", type: "string", format: "uuid", required: true },
      { name: "url", type: "string", format: "", required: true },
      { name: "attachment_type", type: "string", format: "", required: true, default: "image" },
      { name: "display_order", type: "integer", format: "", required: false, default: 0 },
      { name: "is_deleted", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  todos: {
    key: "notekeep_todos",
    path: "/notekeep_todos",
    title: "Tarefas & Checklists",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "note_id", type: "string", format: "uuid", required: false },
      { name: "title", type: "string", format: "", required: true },
      { name: "is_completed", type: "boolean", format: "", required: false, default: false },
      { name: "priority", type: "string", format: "", required: true, default: "medium" },
      { name: "due_date", type: "string", format: "date-time", required: false },
      { name: "display_order", type: "integer", format: "", required: false, default: 0 },
      { name: "is_archived", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  labels: {
    key: "notekeep_labels",
    path: "/notekeep_labels",
    title: "Marcadores & Etiquetas",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "name", type: "string", format: "", required: true },
      { name: "slug", type: "string", format: "", required: true },
      { name: "color", type: "string", format: "", required: true, default: "default" },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  note_labels: {
    key: "notekeep_note_labels",
    path: "/notekeep_note_labels",
    title: "Vínculo Notas-Etiquetas",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "note_id", type: "string", format: "uuid", required: true },
      { name: "label_id", type: "string", format: "uuid", required: true },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  reminders: {
    key: "notekeep_reminders",
    path: "/notekeep_reminders",
    title: "Alarmes & Lembretes",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "note_id", type: "string", format: "uuid", required: false },
      { name: "todo_id", type: "string", format: "uuid", required: false },
      { name: "title", type: "string", format: "", required: true },
      { name: "remind_at", type: "string", format: "date-time", required: true },
      { name: "is_sent", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  }
};
