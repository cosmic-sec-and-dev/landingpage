import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), ''),
  };

  const backendTarget = env.VITE_BACKEND_URL || 'http://127.0.0.1:3000';
  const apiPrefix = env.VITE_API_PREFIX || '/api';
  const tusdPrefix = env.VITE_TUSD_PREFIX || '/tusd';
  const assistantPrefix = env.VITE_ASSISTANT_PREFIX || '/assistant';
  const docsPrefix = env.VITE_DOCS_PREFIX || '/docs';

  const defaultAllowedHosts = ['localhost', '127.0.0.1', 'frontend'];
  const userAllowedHosts = (env.VITE_ALLOWED_HOSTS || env.ALLOWED_HOSTS || '')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean);
  const allowedHosts = [...new Set([...defaultAllowedHosts, ...userAllowedHosts])];

  const proxyConfig = {
    [apiPrefix]: {
      target: backendTarget,
      changeOrigin: true
    },
    [tusdPrefix]: {
      target: backendTarget,
      changeOrigin: true
    },
    '/files': {
      target: backendTarget,
      changeOrigin: true
    },
    [assistantPrefix]: {
      target: backendTarget,
      changeOrigin: true
    },
    [docsPrefix]: {
      target: backendTarget,
      changeOrigin: true
    },
    '/rpc': {
      target: backendTarget,
      changeOrigin: true
    },
    '^/(agents|agents_attachments|blogger_sidebars|blogger_themes|blogger_themes_attachments|campaign_contacts|campaigns|catalog_bom_bill_of_materials|catalog_categories|catalog_categories_attachments|catalog_items|catalog_items_attachments|chat_messages|chat_messages_attachments|chat_messages_reactions|chat_room_participants|chat_rooms|clients|clinic_appointments|clinic_appointments_attachments|clinic_patient_records|clinic_patient_records_attachments|clinic_professionals|clinic_professionals_attachments|clinic_queue_tickets|clinic_rooms|clinic_rooms_attachments|clinic_schedule_exceptions|clinic_schedules|clinic_specialties|clinic_specialties_attachments|clinic_ticket_routings|clinic_treatment_plans|clinic_treatment_plans_attachments|collaboration_calendars|collaboration_channels|collaboration_event_attendees|collaboration_events|collaboration_events_attachments|collaboration_notes|collaboration_notes_attachments|collaboration_posts|collaboration_posts_attachments|collaboration_posts_comments|collaboration_posts_comments_attachments|collaboration_posts_likes|comments|comments_attachments|commerce_order_items|commerce_order_payments|commerce_orders|commerce_payment_gateways|commerce_payment_methods|commerce_payment_refunds|commerce_payment_transactions|commerce_pos_cash_sessions|contacts|contacts_attachments|coupons|crm_dashboards|deals|deals_attachments|digital_item_deliverables|ecommerce_cart_items|ecommerce_carts|ecommerce_payment_settings|email_notifications|event_categories|event_posts|event_posts_attachments|event_tags|event_tickets|event_tickets_attachments|event_tiers|file_uploads|group_members|groups|groups_attachments|helpdesk_canned_responses|helpdesk_canned_responses_attachments|helpdesk_categories|helpdesk_departments|helpdesk_departments_attachments|helpdesk_knowledge_articles|helpdesk_knowledge_articles_attachments|helpdesk_sla_policies|helpdesk_ticket_feedback|helpdesk_ticket_messages|helpdesk_ticket_messages_attachments|helpdesk_tickets|helpdesk_tickets_attachments|inner_logs|interactions|interactions_attachments|json_boxes|json_boxes_attachments|kanban_board_columns|kanban_board_members|kanban_boards|kanban_tasks|kanban_tasks_attachments|likes|master_inventory_ledger_movements|me|notekeep_labels|notekeep_note_labels|notekeep_notes|notekeep_notes_attachments|notekeep_reminders|notekeep_todos|nt_plan_tables|nt_system_logs|pages|pages_attachments|permissions|pipeline_stages|pipelines|plans|posts|posts_attachments|properties|properties_attachments|property_views|push_notifications|ratings|ratings_attachments|restaurant_promotion_menus|restaurant_promotions|restaurant_promotions_attachments|restaurant_schedules|restaurant_tab_items|restaurant_tabs|roles|rpc|rpc/login|rpc/register|saved_posts|service_item_profiles|shipping_settings|social_chat_messages|social_chat_messages_attachments|social_chat_participants|social_chats|social_profiles|social_profiles_attachments|subscriptions|tasks|tasks_attachments|tenants|user_permissions|users|visits|visits_attachments|widgets).*': {
      target: backendTarget,
      changeOrigin: true
    }
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      allowedHosts,
      proxy: proxyConfig
    },
    preview: {
      port: 5173,
      host: '0.0.0.0',
      allowedHosts,
      proxy: proxyConfig
    },
    build: {
      chunkSizeWarningLimit: 2000
    }
  };
});
