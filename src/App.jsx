import React, { useState, useEffect, Suspense, lazy } from 'react';
import { App as AntdApp, Spin } from 'antd';
import { PlanProvider } from './context/PlanContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminLayout } from './components/layout/AdminLayout';

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
    <Spin size="large" />
  </div>
);

// Base Pages (Dynamic Code Splitting)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SupportChatPage = lazy(() => import('./pages/support/SupportChatPage').then(m => ({ default: m.SupportChatPage })));
const AntTestPage = lazy(() => import('./pages/AntTestPage').then(m => ({ default: m.AntTestPage })));
const AuditSystemLogsSpaPage = lazy(() => import('./pages/audit_system_logs/spa').then(m => ({ default: m.AuditSystemLogsSpaPage })));
const CampaignsSpaPage = lazy(() => import('./pages/campaigns/spa').then(m => ({ default: m.CampaignsSpaPage })));
const ClinicsSpaPage = lazy(() => import('./pages/clinics/spa').then(m => ({ default: m.ClinicsSpaPage })));
const CmsAdvancedSpaPage = lazy(() => import('./pages/cms_advanced/spa').then(m => ({ default: m.CmsAdvancedSpaPage })));
const CollaborationSpaPage = lazy(() => import('./pages/collaboration/spa').then(m => ({ default: m.CollaborationSpaPage })));
const CommerceHubSpaPage = lazy(() => import('./pages/commerce_hub/spa').then(m => ({ default: m.CommerceHubSpaPage })));
const CrmSpaPage = lazy(() => import('./pages/crm/spa').then(m => ({ default: m.CrmSpaPage })));
const EcommerceSpaPage = lazy(() => import('./pages/ecommerce/spa').then(m => ({ default: m.EcommerceSpaPage })));
const EventsSpaPage = lazy(() => import('./pages/events/spa').then(m => ({ default: m.EventsSpaPage })));
const HelpdeskSpaPage = lazy(() => import('./pages/helpdesk/spa').then(m => ({ default: m.HelpdeskSpaPage })));
const IdentityProfileSpaPage = lazy(() => import('./pages/identity_profile/spa').then(m => ({ default: m.IdentityProfileSpaPage })));
const JsonBoxSpaPage = lazy(() => import('./pages/json_box/spa').then(m => ({ default: m.JsonBoxSpaPage })));
const KanbanSpaPage = lazy(() => import('./pages/kanban/spa').then(m => ({ default: m.KanbanSpaPage })));
const NotekeepSpaPage = lazy(() => import('./pages/notekeep/spa').then(m => ({ default: m.NotekeepSpaPage })));
const NotificationsSpaPage = lazy(() => import('./pages/notifications/spa').then(m => ({ default: m.NotificationsSpaPage })));
const PlansSubscriptionsSpaPage = lazy(() => import('./pages/plans_subscriptions/spa').then(m => ({ default: m.PlansSubscriptionsSpaPage })));
const RealEstateSpaPage = lazy(() => import('./pages/real_estate/spa').then(m => ({ default: m.RealEstateSpaPage })));
const RestaurantsSpaPage = lazy(() => import('./pages/restaurants/spa').then(m => ({ default: m.RestaurantsSpaPage })));
const SocialMediaSpaPage = lazy(() => import('./pages/social_media/spa').then(m => ({ default: m.SocialMediaSpaPage })));
const TenantsSpaPage = lazy(() => import('./pages/tenants/spa').then(m => ({ default: m.TenantsSpaPage })));
const UsersRbacSpaPage = lazy(() => import('./pages/users_rbac/spa').then(m => ({ default: m.UsersRbacSpaPage })));
const RpcLoginPage = lazy(() => import('./pages/authentication/dataExplorer/RpcLoginPage').then(m => ({ default: m.RpcLoginPage })));
const RpcRegisterPage = lazy(() => import('./pages/authentication/dataExplorer/RpcRegisterPage').then(m => ({ default: m.RpcRegisterPage })));
const MePage = lazy(() => import('./pages/identity_profile/dataExplorer/MePage').then(m => ({ default: m.MePage })));
const UsersPage = lazy(() => import('./pages/users_rbac/dataExplorer/UsersPage').then(m => ({ default: m.UsersPage })));
const TenantsPage = lazy(() => import('./pages/tenants/dataExplorer/TenantsPage').then(m => ({ default: m.TenantsPage })));
const PlansPage = lazy(() => import('./pages/plans_subscriptions/dataExplorer/PlansPage').then(m => ({ default: m.PlansPage })));
const SubscriptionsPage = lazy(() => import('./pages/plans_subscriptions/dataExplorer/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const NtSystemLogsPage = lazy(() => import('./pages/audit_system_logs/dataExplorer/NtSystemLogsPage').then(m => ({ default: m.NtSystemLogsPage })));
const CatalogItemsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CatalogItemsPage').then(m => ({ default: m.CatalogItemsPage })));
const CommerceOrdersPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommerceOrdersPage').then(m => ({ default: m.CommerceOrdersPage })));
const CatalogCategoriesPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CatalogCategoriesPage').then(m => ({ default: m.CatalogCategoriesPage })));
const CatalogCategoriesAttachmentsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CatalogCategoriesAttachmentsPage').then(m => ({ default: m.CatalogCategoriesAttachmentsPage })));
const CatalogItemsAttachmentsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CatalogItemsAttachmentsPage').then(m => ({ default: m.CatalogItemsAttachmentsPage })));
const DigitalItemDeliverablesPage = lazy(() => import('./pages/commerce_hub/dataExplorer/DigitalItemDeliverablesPage').then(m => ({ default: m.DigitalItemDeliverablesPage })));
const ServiceItemProfilesPage = lazy(() => import('./pages/commerce_hub/dataExplorer/ServiceItemProfilesPage').then(m => ({ default: m.ServiceItemProfilesPage })));
const CatalogBomBillOfMaterialsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CatalogBomBillOfMaterialsPage').then(m => ({ default: m.CatalogBomBillOfMaterialsPage })));
const CommercePosCashSessionsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommercePosCashSessionsPage').then(m => ({ default: m.CommercePosCashSessionsPage })));
const CommerceOrderItemsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommerceOrderItemsPage').then(m => ({ default: m.CommerceOrderItemsPage })));
const CommercePaymentGatewaysPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommercePaymentGatewaysPage').then(m => ({ default: m.CommercePaymentGatewaysPage })));
const CommercePaymentMethodsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommercePaymentMethodsPage').then(m => ({ default: m.CommercePaymentMethodsPage })));
const CommercePaymentTransactionsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommercePaymentTransactionsPage').then(m => ({ default: m.CommercePaymentTransactionsPage })));
const CommerceOrderPaymentsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommerceOrderPaymentsPage').then(m => ({ default: m.CommerceOrderPaymentsPage })));
const CommercePaymentRefundsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/CommercePaymentRefundsPage').then(m => ({ default: m.CommercePaymentRefundsPage })));
const MasterInventoryLedgerMovementsPage = lazy(() => import('./pages/commerce_hub/dataExplorer/MasterInventoryLedgerMovementsPage').then(m => ({ default: m.MasterInventoryLedgerMovementsPage })));
const ClinicQueueTicketsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicQueueTicketsPage').then(m => ({ default: m.ClinicQueueTicketsPage })));
const ClinicTicketRoutingsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicTicketRoutingsPage').then(m => ({ default: m.ClinicTicketRoutingsPage })));
const ClinicAppointmentsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicAppointmentsPage').then(m => ({ default: m.ClinicAppointmentsPage })));
const ClinicSpecialtiesPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicSpecialtiesPage').then(m => ({ default: m.ClinicSpecialtiesPage })));
const ClinicSpecialtiesAttachmentsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicSpecialtiesAttachmentsPage').then(m => ({ default: m.ClinicSpecialtiesAttachmentsPage })));
const ClinicProfessionalsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicProfessionalsPage').then(m => ({ default: m.ClinicProfessionalsPage })));
const ClinicProfessionalsAttachmentsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicProfessionalsAttachmentsPage').then(m => ({ default: m.ClinicProfessionalsAttachmentsPage })));
const ClinicRoomsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicRoomsPage').then(m => ({ default: m.ClinicRoomsPage })));
const ClinicRoomsAttachmentsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicRoomsAttachmentsPage').then(m => ({ default: m.ClinicRoomsAttachmentsPage })));
const ClinicSchedulesPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicSchedulesPage').then(m => ({ default: m.ClinicSchedulesPage })));
const ClinicScheduleExceptionsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicScheduleExceptionsPage').then(m => ({ default: m.ClinicScheduleExceptionsPage })));
const ClinicAppointmentsAttachmentsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicAppointmentsAttachmentsPage').then(m => ({ default: m.ClinicAppointmentsAttachmentsPage })));
const ClinicPatientRecordsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicPatientRecordsPage').then(m => ({ default: m.ClinicPatientRecordsPage })));
const ClinicPatientRecordsAttachmentsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicPatientRecordsAttachmentsPage').then(m => ({ default: m.ClinicPatientRecordsAttachmentsPage })));
const ClinicTreatmentPlansPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicTreatmentPlansPage').then(m => ({ default: m.ClinicTreatmentPlansPage })));
const ClinicTreatmentPlansAttachmentsPage = lazy(() => import('./pages/clinics/dataExplorer/ClinicTreatmentPlansAttachmentsPage').then(m => ({ default: m.ClinicTreatmentPlansAttachmentsPage })));
const EcommerceCartsPage = lazy(() => import('./pages/ecommerce/dataExplorer/EcommerceCartsPage').then(m => ({ default: m.EcommerceCartsPage })));
const EcommerceCartItemsPage = lazy(() => import('./pages/ecommerce/dataExplorer/EcommerceCartItemsPage').then(m => ({ default: m.EcommerceCartItemsPage })));
const CouponsPage = lazy(() => import('./pages/ecommerce/dataExplorer/CouponsPage').then(m => ({ default: m.CouponsPage })));
const RatingsPage = lazy(() => import('./pages/ecommerce/dataExplorer/RatingsPage').then(m => ({ default: m.RatingsPage })));
const RatingsAttachmentsPage = lazy(() => import('./pages/ecommerce/dataExplorer/RatingsAttachmentsPage').then(m => ({ default: m.RatingsAttachmentsPage })));
const EcommercePaymentSettingsPage = lazy(() => import('./pages/ecommerce/dataExplorer/EcommercePaymentSettingsPage').then(m => ({ default: m.EcommercePaymentSettingsPage })));
const ShippingSettingsPage = lazy(() => import('./pages/ecommerce/dataExplorer/ShippingSettingsPage').then(m => ({ default: m.ShippingSettingsPage })));
const CampaignsPage = lazy(() => import('./pages/campaigns/dataExplorer/CampaignsPage').then(m => ({ default: m.CampaignsPage })));
const CampaignContactsPage = lazy(() => import('./pages/campaigns/dataExplorer/CampaignContactsPage').then(m => ({ default: m.CampaignContactsPage })));
const PagesPage = lazy(() => import('./pages/cms_advanced/dataExplorer/PagesPage').then(m => ({ default: m.PagesPage })));
const PagesAttachmentsPage = lazy(() => import('./pages/cms_advanced/dataExplorer/PagesAttachmentsPage').then(m => ({ default: m.PagesAttachmentsPage })));
const BloggerSidebarsPage = lazy(() => import('./pages/cms_advanced/dataExplorer/BloggerSidebarsPage').then(m => ({ default: m.BloggerSidebarsPage })));
const BloggerThemesPage = lazy(() => import('./pages/cms_advanced/dataExplorer/BloggerThemesPage').then(m => ({ default: m.BloggerThemesPage })));
const BloggerThemesAttachmentsPage = lazy(() => import('./pages/cms_advanced/dataExplorer/BloggerThemesAttachmentsPage').then(m => ({ default: m.BloggerThemesAttachmentsPage })));
const ChatRoomsPage = lazy(() => import('./pages/collaboration/dataExplorer/ChatRoomsPage').then(m => ({ default: m.ChatRoomsPage })));
const ChatRoomParticipantsPage = lazy(() => import('./pages/collaboration/dataExplorer/ChatRoomParticipantsPage').then(m => ({ default: m.ChatRoomParticipantsPage })));
const ChatMessagesPage = lazy(() => import('./pages/collaboration/dataExplorer/ChatMessagesPage').then(m => ({ default: m.ChatMessagesPage })));
const ChatMessagesAttachmentsPage = lazy(() => import('./pages/collaboration/dataExplorer/ChatMessagesAttachmentsPage').then(m => ({ default: m.ChatMessagesAttachmentsPage })));
const ChatMessagesReactionsPage = lazy(() => import('./pages/collaboration/dataExplorer/ChatMessagesReactionsPage').then(m => ({ default: m.ChatMessagesReactionsPage })));
const CollaborationCalendarsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationCalendarsPage').then(m => ({ default: m.CollaborationCalendarsPage })));
const CollaborationEventsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationEventsPage').then(m => ({ default: m.CollaborationEventsPage })));
const CollaborationEventAttendeesPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationEventAttendeesPage').then(m => ({ default: m.CollaborationEventAttendeesPage })));
const CollaborationEventsAttachmentsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationEventsAttachmentsPage').then(m => ({ default: m.CollaborationEventsAttachmentsPage })));
const CollaborationNotesPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationNotesPage').then(m => ({ default: m.CollaborationNotesPage })));
const CollaborationNotesAttachmentsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationNotesAttachmentsPage').then(m => ({ default: m.CollaborationNotesAttachmentsPage })));
const CollaborationChannelsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationChannelsPage').then(m => ({ default: m.CollaborationChannelsPage })));
const CollaborationPostsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationPostsPage').then(m => ({ default: m.CollaborationPostsPage })));
const CollaborationPostsAttachmentsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationPostsAttachmentsPage').then(m => ({ default: m.CollaborationPostsAttachmentsPage })));
const CollaborationPostsCommentsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationPostsCommentsPage').then(m => ({ default: m.CollaborationPostsCommentsPage })));
const CollaborationPostsCommentsAttachmentsPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationPostsCommentsAttachmentsPage').then(m => ({ default: m.CollaborationPostsCommentsAttachmentsPage })));
const CollaborationPostsLikesPage = lazy(() => import('./pages/collaboration/dataExplorer/CollaborationPostsLikesPage').then(m => ({ default: m.CollaborationPostsLikesPage })));
const ContactsPage = lazy(() => import('./pages/crm/dataExplorer/ContactsPage').then(m => ({ default: m.ContactsPage })));
const ContactsAttachmentsPage = lazy(() => import('./pages/crm/dataExplorer/ContactsAttachmentsPage').then(m => ({ default: m.ContactsAttachmentsPage })));
const PipelinesPage = lazy(() => import('./pages/crm/dataExplorer/PipelinesPage').then(m => ({ default: m.PipelinesPage })));
const PipelineStagesPage = lazy(() => import('./pages/crm/dataExplorer/PipelineStagesPage').then(m => ({ default: m.PipelineStagesPage })));
const DealsPage = lazy(() => import('./pages/crm/dataExplorer/DealsPage').then(m => ({ default: m.DealsPage })));
const DealsAttachmentsPage = lazy(() => import('./pages/crm/dataExplorer/DealsAttachmentsPage').then(m => ({ default: m.DealsAttachmentsPage })));
const TasksPage = lazy(() => import('./pages/crm/dataExplorer/TasksPage').then(m => ({ default: m.TasksPage })));
const TasksAttachmentsPage = lazy(() => import('./pages/crm/dataExplorer/TasksAttachmentsPage').then(m => ({ default: m.TasksAttachmentsPage })));
const InteractionsPage = lazy(() => import('./pages/crm/dataExplorer/InteractionsPage').then(m => ({ default: m.InteractionsPage })));
const InteractionsAttachmentsPage = lazy(() => import('./pages/crm/dataExplorer/InteractionsAttachmentsPage').then(m => ({ default: m.InteractionsAttachmentsPage })));
const CrmDashboardsPage = lazy(() => import('./pages/crm/dataExplorer/CrmDashboardsPage').then(m => ({ default: m.CrmDashboardsPage })));
const EventCategoriesPage = lazy(() => import('./pages/events/dataExplorer/EventCategoriesPage').then(m => ({ default: m.EventCategoriesPage })));
const EventTagsPage = lazy(() => import('./pages/events/dataExplorer/EventTagsPage').then(m => ({ default: m.EventTagsPage })));
const EventPostsPage = lazy(() => import('./pages/events/dataExplorer/EventPostsPage').then(m => ({ default: m.EventPostsPage })));
const EventPostsAttachmentsPage = lazy(() => import('./pages/events/dataExplorer/EventPostsAttachmentsPage').then(m => ({ default: m.EventPostsAttachmentsPage })));
const EventTiersPage = lazy(() => import('./pages/events/dataExplorer/EventTiersPage').then(m => ({ default: m.EventTiersPage })));
const EventTicketsPage = lazy(() => import('./pages/events/dataExplorer/EventTicketsPage').then(m => ({ default: m.EventTicketsPage })));
const EventTicketsAttachmentsPage = lazy(() => import('./pages/events/dataExplorer/EventTicketsAttachmentsPage').then(m => ({ default: m.EventTicketsAttachmentsPage })));
const HelpdeskDepartmentsPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskDepartmentsPage').then(m => ({ default: m.HelpdeskDepartmentsPage })));
const HelpdeskDepartmentsAttachmentsPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskDepartmentsAttachmentsPage').then(m => ({ default: m.HelpdeskDepartmentsAttachmentsPage })));
const HelpdeskSlaPoliciesPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskSlaPoliciesPage').then(m => ({ default: m.HelpdeskSlaPoliciesPage })));
const HelpdeskCategoriesPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskCategoriesPage').then(m => ({ default: m.HelpdeskCategoriesPage })));
const HelpdeskTicketsPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskTicketsPage').then(m => ({ default: m.HelpdeskTicketsPage })));
const HelpdeskTicketsAttachmentsPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskTicketsAttachmentsPage').then(m => ({ default: m.HelpdeskTicketsAttachmentsPage })));
const HelpdeskTicketMessagesPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskTicketMessagesPage').then(m => ({ default: m.HelpdeskTicketMessagesPage })));
const HelpdeskTicketMessagesAttachmentsPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskTicketMessagesAttachmentsPage').then(m => ({ default: m.HelpdeskTicketMessagesAttachmentsPage })));
const HelpdeskCannedResponsesPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskCannedResponsesPage').then(m => ({ default: m.HelpdeskCannedResponsesPage })));
const HelpdeskCannedResponsesAttachmentsPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskCannedResponsesAttachmentsPage').then(m => ({ default: m.HelpdeskCannedResponsesAttachmentsPage })));
const HelpdeskKnowledgeArticlesPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskKnowledgeArticlesPage').then(m => ({ default: m.HelpdeskKnowledgeArticlesPage })));
const HelpdeskKnowledgeArticlesAttachmentsPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskKnowledgeArticlesAttachmentsPage').then(m => ({ default: m.HelpdeskKnowledgeArticlesAttachmentsPage })));
const HelpdeskTicketFeedbackPage = lazy(() => import('./pages/helpdesk/dataExplorer/HelpdeskTicketFeedbackPage').then(m => ({ default: m.HelpdeskTicketFeedbackPage })));
const FileUploadsPage = lazy(() => import('./pages/infrastructure/dataExplorer/FileUploadsPage').then(m => ({ default: m.FileUploadsPage })));
const WidgetsPage = lazy(() => import('./pages/infrastructure/dataExplorer/WidgetsPage').then(m => ({ default: m.WidgetsPage })));
const InnerLogsPage = lazy(() => import('./pages/infrastructure/dataExplorer/InnerLogsPage').then(m => ({ default: m.InnerLogsPage })));
const RolesPage = lazy(() => import('./pages/infrastructure/dataExplorer/RolesPage').then(m => ({ default: m.RolesPage })));
const PermissionsPage = lazy(() => import('./pages/infrastructure/dataExplorer/PermissionsPage').then(m => ({ default: m.PermissionsPage })));
const UserPermissionsPage = lazy(() => import('./pages/infrastructure/dataExplorer/UserPermissionsPage').then(m => ({ default: m.UserPermissionsPage })));
const JsonBoxesPage = lazy(() => import('./pages/json_box/dataExplorer/JsonBoxesPage').then(m => ({ default: m.JsonBoxesPage })));
const JsonBoxesAttachmentsPage = lazy(() => import('./pages/json_box/dataExplorer/JsonBoxesAttachmentsPage').then(m => ({ default: m.JsonBoxesAttachmentsPage })));
const KanbanBoardsPage = lazy(() => import('./pages/kanban/dataExplorer/KanbanBoardsPage').then(m => ({ default: m.KanbanBoardsPage })));
const KanbanBoardMembersPage = lazy(() => import('./pages/kanban/dataExplorer/KanbanBoardMembersPage').then(m => ({ default: m.KanbanBoardMembersPage })));
const KanbanBoardColumnsPage = lazy(() => import('./pages/kanban/dataExplorer/KanbanBoardColumnsPage').then(m => ({ default: m.KanbanBoardColumnsPage })));
const KanbanTasksPage = lazy(() => import('./pages/kanban/dataExplorer/KanbanTasksPage').then(m => ({ default: m.KanbanTasksPage })));
const KanbanTasksAttachmentsPage = lazy(() => import('./pages/kanban/dataExplorer/KanbanTasksAttachmentsPage').then(m => ({ default: m.KanbanTasksAttachmentsPage })));
const NotekeepNotesPage = lazy(() => import('./pages/notekeep/dataExplorer/NotekeepNotesPage').then(m => ({ default: m.NotekeepNotesPage })));
const NotekeepNotesAttachmentsPage = lazy(() => import('./pages/notekeep/dataExplorer/NotekeepNotesAttachmentsPage').then(m => ({ default: m.NotekeepNotesAttachmentsPage })));
const NotekeepTodosPage = lazy(() => import('./pages/notekeep/dataExplorer/NotekeepTodosPage').then(m => ({ default: m.NotekeepTodosPage })));
const NotekeepLabelsPage = lazy(() => import('./pages/notekeep/dataExplorer/NotekeepLabelsPage').then(m => ({ default: m.NotekeepLabelsPage })));
const NotekeepNoteLabelsPage = lazy(() => import('./pages/notekeep/dataExplorer/NotekeepNoteLabelsPage').then(m => ({ default: m.NotekeepNoteLabelsPage })));
const NotekeepRemindersPage = lazy(() => import('./pages/notekeep/dataExplorer/NotekeepRemindersPage').then(m => ({ default: m.NotekeepRemindersPage })));
const PushNotificationsPage = lazy(() => import('./pages/notifications/dataExplorer/PushNotificationsPage').then(m => ({ default: m.PushNotificationsPage })));
const EmailNotificationsPage = lazy(() => import('./pages/notifications/dataExplorer/EmailNotificationsPage').then(m => ({ default: m.EmailNotificationsPage })));
const AgentsPage = lazy(() => import('./pages/real_estate/dataExplorer/AgentsPage').then(m => ({ default: m.AgentsPage })));
const AgentsAttachmentsPage = lazy(() => import('./pages/real_estate/dataExplorer/AgentsAttachmentsPage').then(m => ({ default: m.AgentsAttachmentsPage })));
const PropertiesPage = lazy(() => import('./pages/real_estate/dataExplorer/PropertiesPage').then(m => ({ default: m.PropertiesPage })));
const PropertiesAttachmentsPage = lazy(() => import('./pages/real_estate/dataExplorer/PropertiesAttachmentsPage').then(m => ({ default: m.PropertiesAttachmentsPage })));
const ClientsPage = lazy(() => import('./pages/real_estate/dataExplorer/ClientsPage').then(m => ({ default: m.ClientsPage })));
const VisitsPage = lazy(() => import('./pages/real_estate/dataExplorer/VisitsPage').then(m => ({ default: m.VisitsPage })));
const VisitsAttachmentsPage = lazy(() => import('./pages/real_estate/dataExplorer/VisitsAttachmentsPage').then(m => ({ default: m.VisitsAttachmentsPage })));
const PropertyViewsPage = lazy(() => import('./pages/real_estate/dataExplorer/PropertyViewsPage').then(m => ({ default: m.PropertyViewsPage })));
const RestaurantTabsPage = lazy(() => import('./pages/restaurants/dataExplorer/RestaurantTabsPage').then(m => ({ default: m.RestaurantTabsPage })));
const RestaurantTabItemsPage = lazy(() => import('./pages/restaurants/dataExplorer/RestaurantTabItemsPage').then(m => ({ default: m.RestaurantTabItemsPage })));
const RestaurantSchedulesPage = lazy(() => import('./pages/restaurants/dataExplorer/RestaurantSchedulesPage').then(m => ({ default: m.RestaurantSchedulesPage })));
const RestaurantPromotionsPage = lazy(() => import('./pages/restaurants/dataExplorer/RestaurantPromotionsPage').then(m => ({ default: m.RestaurantPromotionsPage })));
const RestaurantPromotionsAttachmentsPage = lazy(() => import('./pages/restaurants/dataExplorer/RestaurantPromotionsAttachmentsPage').then(m => ({ default: m.RestaurantPromotionsAttachmentsPage })));
const RestaurantPromotionMenusPage = lazy(() => import('./pages/restaurants/dataExplorer/RestaurantPromotionMenusPage').then(m => ({ default: m.RestaurantPromotionMenusPage })));
const PostsPage = lazy(() => import('./pages/social_media/dataExplorer/PostsPage').then(m => ({ default: m.PostsPage })));
const PostsAttachmentsPage = lazy(() => import('./pages/social_media/dataExplorer/PostsAttachmentsPage').then(m => ({ default: m.PostsAttachmentsPage })));
const SavedPostsPage = lazy(() => import('./pages/social_media/dataExplorer/SavedPostsPage').then(m => ({ default: m.SavedPostsPage })));
const CommentsPage = lazy(() => import('./pages/social_media/dataExplorer/CommentsPage').then(m => ({ default: m.CommentsPage })));
const CommentsAttachmentsPage = lazy(() => import('./pages/social_media/dataExplorer/CommentsAttachmentsPage').then(m => ({ default: m.CommentsAttachmentsPage })));
const SocialProfilesPage = lazy(() => import('./pages/social_media/dataExplorer/SocialProfilesPage').then(m => ({ default: m.SocialProfilesPage })));
const SocialProfilesAttachmentsPage = lazy(() => import('./pages/social_media/dataExplorer/SocialProfilesAttachmentsPage').then(m => ({ default: m.SocialProfilesAttachmentsPage })));
const GroupsPage = lazy(() => import('./pages/social_media/dataExplorer/GroupsPage').then(m => ({ default: m.GroupsPage })));
const GroupsAttachmentsPage = lazy(() => import('./pages/social_media/dataExplorer/GroupsAttachmentsPage').then(m => ({ default: m.GroupsAttachmentsPage })));
const GroupMembersPage = lazy(() => import('./pages/social_media/dataExplorer/GroupMembersPage').then(m => ({ default: m.GroupMembersPage })));
const LikesPage = lazy(() => import('./pages/social_media/dataExplorer/LikesPage').then(m => ({ default: m.LikesPage })));
const SocialChatsPage = lazy(() => import('./pages/social_media/dataExplorer/SocialChatsPage').then(m => ({ default: m.SocialChatsPage })));
const SocialChatParticipantsPage = lazy(() => import('./pages/social_media/dataExplorer/SocialChatParticipantsPage').then(m => ({ default: m.SocialChatParticipantsPage })));
const SocialChatMessagesPage = lazy(() => import('./pages/social_media/dataExplorer/SocialChatMessagesPage').then(m => ({ default: m.SocialChatMessagesPage })));
const SocialChatMessagesAttachmentsPage = lazy(() => import('./pages/social_media/dataExplorer/SocialChatMessagesAttachmentsPage').then(m => ({ default: m.SocialChatMessagesAttachmentsPage })));

const appletsConfig = {
  "Authentication": [
    {
      "path": "/rpc/login",
      "endpoint_key": "rpc_login",
      "pascal_name": "RpcLogin",
      "tag": "Authentication",
      "summary": "Authenticate user & issue JWT bearer token",
      "description": "Validates user credentials against tenant context and returns a signed PostgREST JWT token. Accessible by unauthenticated (anonymous) users.",
      "has_get": false,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "email",
          "type": "string",
          "format": "email",
          "example": "cosmic@cosmic.com",
          "required": true
        },
        {
          "name": "password",
          "type": "string",
          "format": "password",
          "example": "admin",
          "required": true
        },
        {
          "name": "tenant_slug",
          "type": "string",
          "format": "",
          "example": "cosmic",
          "required": false
        }
      ]
    },
    {
      "path": "/rpc/register",
      "endpoint_key": "rpc_register",
      "pascal_name": "RpcRegister",
      "tag": "Authentication",
      "summary": "Register new tenant organization & admin account",
      "description": "Provision a new tenant organization, default subscription plan, and the primary administrator account, returning an immediate JWT session token.",
      "has_get": false,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "tenant_name",
          "type": "string",
          "format": "",
          "example": "Cosmic Enterprises",
          "required": true
        },
        {
          "name": "tenant_slug",
          "type": "string",
          "format": "",
          "example": "cosmic",
          "required": true
        },
        {
          "name": "business_name",
          "type": "string",
          "format": "",
          "example": "Cosmic Dev Corp",
          "required": true
        },
        {
          "name": "business_id",
          "type": "string",
          "format": "",
          "example": "TAX-123456",
          "required": true
        },
        {
          "name": "admin_email",
          "type": "string",
          "format": "email",
          "example": "admin@cosmic.com",
          "required": true
        },
        {
          "name": "admin_password",
          "type": "string",
          "format": "password",
          "example": "SecurePass123!",
          "required": true
        },
        {
          "name": "admin_full_name",
          "type": "string",
          "format": "",
          "example": "Cosmic Admin",
          "required": true
        }
      ]
    }
  ],
  "Identity & Profile": [
    {
      "path": "/me",
      "endpoint_key": "me",
      "pascal_name": "Me",
      "tag": "Identity & Profile",
      "summary": "Get current authenticated user & tenant profile",
      "description": "Retrieves profile, permissions, role, and organization metadata for the currently authenticated session derived from the JWT claims.",
      "has_get": true,
      "has_post": false,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "business_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "email",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "username",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "full_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "role",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "avatar_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "locale",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "timezone",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "currency",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_verified",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Users & RBAC": [
    {
      "path": "/users",
      "endpoint_key": "users",
      "pascal_name": "Users",
      "tag": "Users & RBAC",
      "summary": "List tenant users (View)",
      "description": "Retrieves users belonging exclusively to the authenticated user's tenant organization (RLS enforced). Sensitive fields like password_hash are stripped.",
      "has_get": true,
      "has_post": false,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "email",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "username",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "full_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "role",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Tenants": [
    {
      "path": "/tenants",
      "endpoint_key": "tenants",
      "pascal_name": "Tenants",
      "tag": "Tenants",
      "summary": "Get current tenant organization details",
      "description": "Retrieves organization details for the authenticated tenant context.",
      "has_get": true,
      "has_post": false,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "business_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "business_id",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "settings",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "metadata",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Plans & Subscriptions": [
    {
      "path": "/plans",
      "endpoint_key": "plans",
      "pascal_name": "Plans",
      "tag": "Plans & Subscriptions",
      "summary": "List available subscription plans",
      "description": "Retrieves active subscription tiers and accessible features.",
      "has_get": true,
      "has_post": false,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "virtual_plan",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/subscriptions",
      "endpoint_key": "subscriptions",
      "pascal_name": "Subscriptions",
      "tag": "Plans & Subscriptions",
      "summary": "Get current tenant subscription",
      "description": "Retrieves active subscription details and tier entitlements for the current tenant.",
      "has_get": true,
      "has_post": false,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "plan_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Audit & System Logs": [
    {
      "path": "/nt_system_logs",
      "endpoint_key": "nt_system_logs",
      "pascal_name": "NtSystemLogs",
      "tag": "Audit & System Logs",
      "summary": "Query system and audit logs",
      "description": "Retrieves telemetry, audit events, and activity logs scoped strictly to the current tenant.",
      "has_get": true,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "category",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "level",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "message",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "data",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "ip_address",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "user_agent",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Commerce Hub": [
    {
      "path": "/catalog_items",
      "endpoint_key": "catalog_items",
      "pascal_name": "CatalogItems",
      "tag": "Commerce Hub",
      "summary": "Query master universal catalog items",
      "description": "Lists universal catalog items (raw materials, manufactured dishes, retail products, medical services) scoped to the current tenant.",
      "has_get": true,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "item_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "cost_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "available_in_restaurant",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "available_in_ecommerce",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "available_in_pos",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_orders",
      "endpoint_key": "commerce_orders",
      "pascal_name": "CommerceOrders",
      "tag": "Commerce Hub",
      "summary": "Query unified omnichannel orders",
      "description": "Queries unified sales orders across all channels (restaurant_tab, ecommerce_web, clinic_appointment, pos_counter).",
      "has_get": true,
      "has_post": false,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "origin_channel",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "channel_reference_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "order_number",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "gross_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "discount_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "net_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/catalog_categories",
      "endpoint_key": "catalog_categories",
      "pascal_name": "CatalogCategories",
      "tag": "Commerce Hub",
      "summary": "Catalog Categories",
      "description": "universal item taxonomy and product catalog classification",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "parent_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "icon_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/catalog_categories_attachments",
      "endpoint_key": "catalog_categories_attachments",
      "pascal_name": "CatalogCategoriesAttachments",
      "tag": "Commerce Hub",
      "summary": "Catalog Categories Attachments",
      "description": "visual banners promotional graphics and category icon badges",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "catalog_category_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/catalog_items_attachments",
      "endpoint_key": "catalog_items_attachments",
      "pascal_name": "CatalogItemsAttachments",
      "tag": "Commerce Hub",
      "summary": "Catalog Items Attachments",
      "description": "product photos digital asset previews demo media and technical spec sheets",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "catalog_item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/digital_item_deliverables",
      "endpoint_key": "digital_item_deliverables",
      "pascal_name": "DigitalItemDeliverables",
      "tag": "Commerce Hub",
      "summary": "Digital Item Deliverables",
      "description": "downloadable media ebooks video courses and license key configurations",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "catalog_item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "delivery_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "download_file_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "access_duration_days",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "max_downloads_per_user",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "course_platform_integration",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "license_key_pool",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/service_item_profiles",
      "endpoint_key": "service_item_profiles",
      "pascal_name": "ServiceItemProfiles",
      "tag": "Commerce Hub",
      "summary": "Service Item Profiles",
      "description": "appointment durations provider credentials and scheduling constraints",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "catalog_item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "duration_minutes",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "buffer_time_minutes",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "requires_room",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "eligible_roles",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "instructions",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/catalog_bom_bill_of_materials",
      "endpoint_key": "catalog_bom_bill_of_materials",
      "pascal_name": "CatalogBomBillOfMaterials",
      "tag": "Commerce Hub",
      "summary": "Catalog Bom Bill Of Materials",
      "description": "engineering bill of materials decomposing manufactured products and dishes into raw ingredients",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "parent_item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "component_item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "component_quantity",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "scrap_percentage",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "yield_factor",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_subassembly",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "operation_step",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "instructions",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_optional",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_pos_cash_sessions",
      "endpoint_key": "commerce_pos_cash_sessions",
      "pascal_name": "CommercePosCashSessions",
      "tag": "Commerce Hub",
      "summary": "Commerce Pos Cash Sessions",
      "description": "physical pos cashier shifts opening float cash drops blind closings and audit reconciliations",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "operator_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "terminal_id",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "opening_balance",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "closing_amount_expected",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "closing_amount_counted",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "closing_variance",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "cash_drops_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "cash_additions_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "opened_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "closed_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_order_items",
      "endpoint_key": "commerce_order_items",
      "pascal_name": "CommerceOrderItems",
      "tag": "Commerce Hub",
      "summary": "Commerce Order Items",
      "description": "line items products services digital goods and dishes ordered in a commerce order",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "order_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "item_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "item_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "sku",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "quantity",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "unit_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "unit_cost",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "discount_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "metadata",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_payment_gateways",
      "endpoint_key": "commerce_payment_gateways",
      "pascal_name": "CommercePaymentGateways",
      "tag": "Commerce Hub",
      "summary": "Commerce Payment Gateways",
      "description": "payment provider configurations credentials pinpads tef engines and sandbox flags",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "provider_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "config_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_test_mode",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_payment_methods",
      "endpoint_key": "commerce_payment_methods",
      "pascal_name": "CommercePaymentMethods",
      "tag": "Commerce Hub",
      "summary": "Commerce Payment Methods",
      "description": "tokenized customer cards saved payment instruments and customer tender profiles",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "gateway_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "payment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "token",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "card_brand",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "card_last_four",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "expiration_month",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "expiration_year",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_default",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_payment_transactions",
      "endpoint_key": "commerce_payment_transactions",
      "pascal_name": "CommercePaymentTransactions",
      "tag": "Commerce Hub",
      "summary": "Commerce Payment Transactions",
      "description": "financial processing records provider authorization codes nsu terminal tokens and gateway fees",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "order_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "gateway_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "payment_method_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "transaction_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "payment_tender_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "fee_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "net_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "currency",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "gateway_status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "gateway_authorization_code",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "nsu_terminal",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "gateway_response_payload",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_order_payments",
      "endpoint_key": "commerce_order_payments",
      "pascal_name": "CommerceOrderPayments",
      "tag": "Commerce Hub",
      "summary": "Commerce Order Payments",
      "description": "split payment settlement supporting cash card terminals tef pix vouchers and gateways",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "order_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "transaction_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "payment_method",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "amount_tendered",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "change_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "installments",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/commerce_payment_refunds",
      "endpoint_key": "commerce_payment_refunds",
      "pascal_name": "CommercePaymentRefunds",
      "tag": "Commerce Hub",
      "summary": "Commerce Payment Refunds",
      "description": "financial refunds return restock vouchers and dispute reversals",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "transaction_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "order_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "refund_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "reason",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "refund_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "voucher_code",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/master_inventory_ledger_movements",
      "endpoint_key": "master_inventory_ledger_movements",
      "pascal_name": "MasterInventoryLedgerMovements",
      "tag": "Commerce Hub",
      "summary": "Master Inventory Ledger Movements",
      "description": "immutable append only double entry inventory ledger tracking physical goods bom recipes and reverse restock",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "movement_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "quantity",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "unit_cost",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_cost",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "reference_order_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "reference_bom_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "batch_lot_number",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "idempotency_hash",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Clinics": [
    {
      "path": "/clinic_queue_tickets",
      "endpoint_key": "clinic_queue_tickets",
      "pascal_name": "ClinicQueueTickets",
      "tag": "Clinics",
      "summary": "Query reception and kiosk queue tickets",
      "description": "",
      "has_get": true,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "ticket_number",
          "type": "string",
          "format": "",
          "example": "P-501",
          "required": false
        },
        {
          "name": "priority_category",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "service_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "current_room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "issued_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "called_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "completed_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_ticket_routings",
      "endpoint_key": "clinic_ticket_routings",
      "pascal_name": "ClinicTicketRoutings",
      "tag": "Clinics",
      "summary": "Query append-only patient routing movements",
      "description": "Returns immutable audit trail of patient movements between reception, triage, and consulting rooms.",
      "has_get": true,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "ticket_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "from_room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "to_room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "operator_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "action_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "step_sequence",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "routed_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_appointments",
      "endpoint_key": "clinic_appointments",
      "pascal_name": "ClinicAppointments",
      "tag": "Clinics",
      "summary": "Query clinical appointments",
      "description": "",
      "has_get": true,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "professional_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "customer_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "service_item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "appointment_date",
          "type": "string",
          "format": "date",
          "example": "",
          "required": false
        },
        {
          "name": "start_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "end_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "price_charged",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "discount_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "final_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "payment_status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_specialties",
      "endpoint_key": "clinic_specialties",
      "pascal_name": "ClinicSpecialties",
      "tag": "Clinics",
      "summary": "Clinic Specialties",
      "description": "medical specialties aesthetic segments hair styling and care categories",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "icon_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_specialties_attachments",
      "endpoint_key": "clinic_specialties_attachments",
      "pascal_name": "ClinicSpecialtiesAttachments",
      "tag": "Clinics",
      "summary": "Clinic Specialties Attachments",
      "description": "specialty icons banners and promotional badges",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "clinic_specialty_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_professionals",
      "endpoint_key": "clinic_professionals",
      "pascal_name": "ClinicProfessionals",
      "tag": "Clinics",
      "summary": "Clinic Professionals",
      "description": "healthcare specialists doctors aesthetic practitioners stylists and barbers",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "specialty_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "professional_license_number",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "title_prefix",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "bio",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "commission_percentage",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "appointment_duration_default_minutes",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "color_code",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_professionals_attachments",
      "endpoint_key": "clinic_professionals_attachments",
      "pascal_name": "ClinicProfessionalsAttachments",
      "tag": "Clinics",
      "summary": "Clinic Professionals Attachments",
      "description": "professional diplomas medical board licenses and certification files",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "clinic_professional_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_rooms",
      "endpoint_key": "clinic_rooms",
      "pascal_name": "ClinicRooms",
      "tag": "Clinics",
      "summary": "Clinic Rooms",
      "description": "consultation rooms treatment cabins triage stations and counter desks",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "room_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "capacity",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_rooms_attachments",
      "endpoint_key": "clinic_rooms_attachments",
      "pascal_name": "ClinicRoomsAttachments",
      "tag": "Clinics",
      "summary": "Clinic Rooms Attachments",
      "description": "room layout diagrams equipment manuals and room photographs",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "clinic_room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_schedules",
      "endpoint_key": "clinic_schedules",
      "pascal_name": "ClinicSchedules",
      "tag": "Clinics",
      "summary": "Clinic Schedules",
      "description": "recurring weekly professional shifts working hours and break intervals",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "professional_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "day_of_week",
          "type": "integer",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "start_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "end_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "break_start_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "break_end_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_schedule_exceptions",
      "endpoint_key": "clinic_schedule_exceptions",
      "pascal_name": "ClinicScheduleExceptions",
      "tag": "Clinics",
      "summary": "Clinic Schedule Exceptions",
      "description": "professional calendar exceptions vacations medical leaves and extra shifts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "professional_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "exception_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "exception_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "start_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "end_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "reason",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_appointments_attachments",
      "endpoint_key": "clinic_appointments_attachments",
      "pascal_name": "ClinicAppointmentsAttachments",
      "tag": "Clinics",
      "summary": "Clinic Appointments Attachments",
      "description": "appointment receipts medical authorization vouchers and consent signatures",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "clinic_appointment_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_patient_records",
      "endpoint_key": "clinic_patient_records",
      "pascal_name": "ClinicPatientRecords",
      "tag": "Clinics",
      "summary": "Clinic Patient Records",
      "description": "medical charts anamnesis aesthetic evaluations clinical evolutions and prescriptions",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "customer_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "professional_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "appointment_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "record_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "clinical_data",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_confidential",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_patient_records_attachments",
      "endpoint_key": "clinic_patient_records_attachments",
      "pascal_name": "ClinicPatientRecordsAttachments",
      "tag": "Clinics",
      "summary": "Clinic Patient Records Attachments",
      "description": "clinical lab exams dermatological imagery before and after photos and signed consents",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "clinic_patient_record_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_treatment_plans",
      "endpoint_key": "clinic_treatment_plans",
      "pascal_name": "ClinicTreatmentPlans",
      "tag": "Clinics",
      "summary": "Clinic Treatment Plans",
      "description": "multi-session treatment packages aesthetic protocols and patient treatment plans",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "customer_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_sessions",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "completed_sessions",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "expires_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clinic_treatment_plans_attachments",
      "endpoint_key": "clinic_treatment_plans_attachments",
      "pascal_name": "ClinicTreatmentPlansAttachments",
      "tag": "Clinics",
      "summary": "Clinic Treatment Plans Attachments",
      "description": "signed treatment plan contracts terms of adherence and payment agreement forms",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "clinic_treatment_plan_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Ecommerce": [
    {
      "path": "/ecommerce_carts",
      "endpoint_key": "ecommerce_carts",
      "pascal_name": "EcommerceCarts",
      "tag": "Ecommerce",
      "summary": "Query shopping cart sessions",
      "description": "Lists active user shopping carts and anonymous session baskets.",
      "has_get": true,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "customer_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "session_token",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "coupon_code",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "last_activity_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/ecommerce_cart_items",
      "endpoint_key": "ecommerce_cart_items",
      "pascal_name": "EcommerceCartItems",
      "tag": "Ecommerce",
      "summary": "Query shopping cart line items",
      "description": "",
      "has_get": true,
      "has_post": true,
      "has_patch": false,
      "has_delete": false,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "cart_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "quantity",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "unit_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/coupons",
      "endpoint_key": "coupons",
      "pascal_name": "Coupons",
      "tag": "Ecommerce",
      "summary": "Coupons",
      "description": "promotional discount coupons usage limits and validity periods",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "code",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "discount_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "discount_value",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "min_order_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "max_uses",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "used_count",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "valid_from",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "valid_until",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/ratings",
      "endpoint_key": "ratings",
      "pascal_name": "Ratings",
      "tag": "Ecommerce",
      "summary": "Ratings",
      "description": "customer product ratings reviews and approval status mapped to catalog items",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "customer_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "rating",
          "type": "integer",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "review_title",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "review_comment",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_verified_purchase",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_approved",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/ratings_attachments",
      "endpoint_key": "ratings_attachments",
      "pascal_name": "RatingsAttachments",
      "tag": "Ecommerce",
      "summary": "Ratings Attachments",
      "description": "customer review photos and unboxing videos",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "rating_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/ecommerce_payment_settings",
      "endpoint_key": "ecommerce_payment_settings",
      "pascal_name": "EcommercePaymentSettings",
      "tag": "Ecommerce",
      "summary": "Ecommerce Payment Settings",
      "description": "store checkout payment gateways installment rules and auto capture",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "default_gateway_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "accepted_methods",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "installments_config",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "auto_capture",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/shipping_settings",
      "endpoint_key": "shipping_settings",
      "pascal_name": "ShippingSettings",
      "tag": "Ecommerce",
      "summary": "Shipping Settings",
      "description": "store shipping carrier configurations origin postal codes and flat rates",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "origin_postal_code",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "shipping_carriers_config",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "free_shipping_min_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "flat_rate_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Campaigns": [
    {
      "path": "/campaigns",
      "endpoint_key": "campaigns",
      "pascal_name": "Campaigns",
      "tag": "Campaigns",
      "summary": "Campaigns",
      "description": "marketing email campaigns and broadcast dispatches",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "subject",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "body",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "target_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "action_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "data_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "priority",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "start_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "end_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/campaign_contacts",
      "endpoint_key": "campaign_contacts",
      "pascal_name": "CampaignContacts",
      "tag": "Campaigns",
      "summary": "Campaign Contacts",
      "description": "campaign recipients and email open/read engagement tracking",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "campaign_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "email",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "read",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "read_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Cms Advanced": [
    {
      "path": "/pages",
      "endpoint_key": "pages",
      "pascal_name": "Pages",
      "tag": "Cms Advanced",
      "summary": "Pages",
      "description": "content pages and cms blog posts supporting multi-format content",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "author_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "content_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "content_rich_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "content_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "excerpt",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_published",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "published_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "meta_title",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "meta_description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/pages_attachments",
      "endpoint_key": "pages_attachments",
      "pascal_name": "PagesAttachments",
      "tag": "Cms Advanced",
      "summary": "Pages Attachments",
      "description": "featured images and media gallery attached to pages",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "page_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/blogger_sidebars",
      "endpoint_key": "blogger_sidebars",
      "pascal_name": "BloggerSidebars",
      "tag": "Cms Advanced",
      "summary": "Blogger Sidebars",
      "description": "cms sidebar configurations and dynamic widget allocations",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "position",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "widgets_order_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/blogger_themes",
      "endpoint_key": "blogger_themes",
      "pascal_name": "BloggerThemes",
      "tag": "Cms Advanced",
      "summary": "Blogger Themes",
      "description": "customizable visual themes custom css scripts and theme configs",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "custom_css",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "custom_js",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "custom_header",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "custom_footer",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "theme_config_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/blogger_themes_attachments",
      "endpoint_key": "blogger_themes_attachments",
      "pascal_name": "BloggerThemesAttachments",
      "tag": "Cms Advanced",
      "summary": "Blogger Themes Attachments",
      "description": "theme screenshots preview images and font assets",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "theme_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Collaboration": [
    {
      "path": "/chat_rooms",
      "endpoint_key": "chat_rooms",
      "pascal_name": "ChatRooms",
      "tag": "Collaboration",
      "summary": "Chat Rooms",
      "description": "internal collaboration rooms direct 1on1 chats and team channels",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "created_by",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "room_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "topic",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_archived",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "last_message_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/chat_room_participants",
      "endpoint_key": "chat_room_participants",
      "pascal_name": "ChatRoomParticipants",
      "tag": "Collaboration",
      "summary": "Chat Room Participants",
      "description": "room participant memberships roles and last read message markers",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "role",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "last_read_message_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "is_muted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_pinned",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "joined_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/chat_messages",
      "endpoint_key": "chat_messages",
      "pascal_name": "ChatMessages",
      "tag": "Collaboration",
      "summary": "Chat Messages",
      "description": "team chat room messages threads pinned status and edit tracking",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "room_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "sender_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "parent_message_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "content_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "is_pinned",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_edited",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "edited_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/chat_messages_attachments",
      "endpoint_key": "chat_messages_attachments",
      "pascal_name": "ChatMessagesAttachments",
      "tag": "Collaboration",
      "summary": "Chat Messages Attachments",
      "description": "attachments images videos and documents sent inside chat rooms",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "chat_message_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/chat_messages_reactions",
      "endpoint_key": "chat_messages_reactions",
      "pascal_name": "ChatMessagesReactions",
      "tag": "Collaboration",
      "summary": "Chat Messages Reactions",
      "description": "emoji reactions on chat messages",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "message_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "emoji",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_calendars",
      "endpoint_key": "collaboration_calendars",
      "pascal_name": "CollaborationCalendars",
      "tag": "Collaboration",
      "summary": "Collaboration Calendars",
      "description": "shared team calendars departmental agendas and personal schedules",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "owner_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "color_hex",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_primary",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_public",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_events",
      "endpoint_key": "collaboration_events",
      "pascal_name": "CollaborationEvents",
      "tag": "Collaboration",
      "summary": "Collaboration Events",
      "description": "calendar events meetings video conference links and reminders",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "calendar_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "organizer_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "location_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "meeting_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "physical_location",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "start_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "end_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "is_all_day",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "recurrence_rule",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "reminder_minutes_before",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_event_attendees",
      "endpoint_key": "collaboration_event_attendees",
      "pascal_name": "CollaborationEventAttendees",
      "tag": "Collaboration",
      "summary": "Collaboration Event Attendees",
      "description": "event invitation recipients rsvp responses and organizers",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "event_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "response_status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_organizer",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "responded_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_events_attachments",
      "endpoint_key": "collaboration_events_attachments",
      "pascal_name": "CollaborationEventsAttachments",
      "tag": "Collaboration",
      "summary": "Collaboration Events Attachments",
      "description": "slide decks agenda pdfs and meeting minutes attached to events",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "collaboration_event_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_notes",
      "endpoint_key": "collaboration_notes",
      "pascal_name": "CollaborationNotes",
      "tag": "Collaboration",
      "summary": "Collaboration Notes",
      "description": "user personal notes checklists rich text formatting and folder organization",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "folder_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "content_rich_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "content_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "tags_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "color_hex",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_private",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_pinned",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_archived",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_notes_attachments",
      "endpoint_key": "collaboration_notes_attachments",
      "pascal_name": "CollaborationNotesAttachments",
      "tag": "Collaboration",
      "summary": "Collaboration Notes Attachments",
      "description": "reference documents screenshots and scans attached to notes",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "collaboration_note_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_channels",
      "endpoint_key": "collaboration_channels",
      "pascal_name": "CollaborationChannels",
      "tag": "Collaboration",
      "summary": "Collaboration Channels",
      "description": "institutional announcement channels broadcast streams and mural boards",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "created_by",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "icon_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_read_only_broadcast",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "allow_comments",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "allow_reactions",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_posts",
      "endpoint_key": "collaboration_posts",
      "pascal_name": "CollaborationPosts",
      "tag": "Collaboration",
      "summary": "Collaboration Posts",
      "description": "company announcements internal news posts view counts and priorities",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "channel_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "author_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "summary",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "content_rich_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "content_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "priority_level",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_pinned",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "published_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "views_count",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_posts_attachments",
      "endpoint_key": "collaboration_posts_attachments",
      "pascal_name": "CollaborationPostsAttachments",
      "tag": "Collaboration",
      "summary": "Collaboration Posts Attachments",
      "description": "cover banners policies pdfs and announcement videos for institutional posts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "collaboration_post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_posts_comments",
      "endpoint_key": "collaboration_posts_comments",
      "pascal_name": "CollaborationPostsComments",
      "tag": "Collaboration",
      "summary": "Collaboration Posts Comments",
      "description": "employee discussion comments and questions on company announcements",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "parent_comment_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "content_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "is_approved",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_posts_comments_attachments",
      "endpoint_key": "collaboration_posts_comments_attachments",
      "pascal_name": "CollaborationPostsCommentsAttachments",
      "tag": "Collaboration",
      "summary": "Collaboration Posts Comments Attachments",
      "description": "screenshots and supporting files attached to post comments",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "collaboration_posts_comment_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/collaboration_posts_likes",
      "endpoint_key": "collaboration_posts_likes",
      "pascal_name": "CollaborationPostsLikes",
      "tag": "Collaboration",
      "summary": "Collaboration Posts Likes",
      "description": "employee reactions and likes on announcement posts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "reaction_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Crm": [
    {
      "path": "/contacts",
      "endpoint_key": "contacts",
      "pascal_name": "Contacts",
      "tag": "Crm",
      "summary": "Contacts",
      "description": "crm leads customers partners contact profiles and custom fields",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "assigned_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "first_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "last_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "email",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "phone",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "company_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "job_title",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "contact_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "lead_source",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "custom_fields",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/contacts_attachments",
      "endpoint_key": "contacts_attachments",
      "pascal_name": "ContactsAttachments",
      "tag": "Crm",
      "summary": "Contacts Attachments",
      "description": "contracts id documents ndas and photos attached to contacts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "contact_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/pipelines",
      "endpoint_key": "pipelines",
      "pascal_name": "Pipelines",
      "tag": "Crm",
      "summary": "Pipelines",
      "description": "sales pipelines and custom commercial funnels",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "is_default",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/pipeline_stages",
      "endpoint_key": "pipeline_stages",
      "pascal_name": "PipelineStages",
      "tag": "Crm",
      "summary": "Pipeline Stages",
      "description": "ordered stages and steps inside a sales pipeline",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "pipeline_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "position",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "color_hex",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/deals",
      "endpoint_key": "deals",
      "pascal_name": "Deals",
      "tag": "Crm",
      "summary": "Deals",
      "description": "commercial business opportunities estimated values and win probabilities",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "pipeline_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "contact_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "stage_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "assigned_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "probability",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "expected_close_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "lost_reason",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/deals_attachments",
      "endpoint_key": "deals_attachments",
      "pascal_name": "DealsAttachments",
      "tag": "Crm",
      "summary": "Deals Attachments",
      "description": "commercial proposals contract drafts and briefings attached to deals",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "deal_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/tasks",
      "endpoint_key": "tasks",
      "pascal_name": "Tasks",
      "tag": "Crm",
      "summary": "Tasks",
      "description": "crm follow-up tasks due dates priorities and completion status",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "assigned_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "contact_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "deal_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "due_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "priority",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "completed_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/tasks_attachments",
      "endpoint_key": "tasks_attachments",
      "pascal_name": "TasksAttachments",
      "tag": "Crm",
      "summary": "Tasks Attachments",
      "description": "specifications deliverables and screenshots linked to crm tasks",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "task_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/interactions",
      "endpoint_key": "interactions",
      "pascal_name": "Interactions",
      "tag": "Crm",
      "summary": "Interactions",
      "description": "history of calls emails meetings notes and whatsapp logs with contacts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "contact_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "deal_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "interaction_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "summary",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "interaction_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/interactions_attachments",
      "endpoint_key": "interactions_attachments",
      "pascal_name": "InteractionsAttachments",
      "tag": "Crm",
      "summary": "Interactions Attachments",
      "description": "call audio recordings meeting minutes pdfs and email attachments",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "interaction_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/crm_dashboards",
      "endpoint_key": "crm_dashboards",
      "pascal_name": "CrmDashboards",
      "tag": "Crm",
      "summary": "Crm Dashboards",
      "description": "personalized sales metric dashboards card layouts and default filters",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "layout_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "filters_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Events": [
    {
      "path": "/event_categories",
      "endpoint_key": "event_categories",
      "pascal_name": "EventCategories",
      "tag": "Events",
      "summary": "Event Categories",
      "description": "categories and classifications for published events",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/event_tags",
      "endpoint_key": "event_tags",
      "pascal_name": "EventTags",
      "tag": "Events",
      "summary": "Event Tags",
      "description": "discovery tags and thematic labels for events",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/event_posts",
      "endpoint_key": "event_posts",
      "pascal_name": "EventPosts",
      "tag": "Events",
      "summary": "Event Posts",
      "description": "event announcements physical and online streaming schedules and recurrence rules",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "organizer_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "location_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "address_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "scheduler_mod",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "start_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "end_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/event_posts_attachments",
      "endpoint_key": "event_posts_attachments",
      "pascal_name": "EventPostsAttachments",
      "tag": "Events",
      "summary": "Event Posts Attachments",
      "description": "banners venue maps and schedule documents attached to events",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "event_post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/event_tiers",
      "endpoint_key": "event_tiers",
      "pascal_name": "EventTiers",
      "tag": "Events",
      "summary": "Event Tiers",
      "description": "ticket batches tiers pricing and inventory limits for events",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "event_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_quantity",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "available_quantity",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "sales_start_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "sales_end_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/event_tickets",
      "endpoint_key": "event_tickets",
      "pascal_name": "EventTickets",
      "tag": "Events",
      "summary": "Event Tickets",
      "description": "attendee issued admission tickets unique qr codes and check-in status",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "event_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "tier_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "attendee_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "ticket_code",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "price_paid",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/event_tickets_attachments",
      "endpoint_key": "event_tickets_attachments",
      "pascal_name": "EventTicketsAttachments",
      "tag": "Events",
      "summary": "Event Tickets Attachments",
      "description": "printable pdf tickets and qr code images for admission verification",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "event_ticket_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Helpdesk": [
    {
      "path": "/helpdesk_departments",
      "endpoint_key": "helpdesk_departments",
      "pascal_name": "HelpdeskDepartments",
      "tag": "Helpdesk",
      "summary": "Helpdesk Departments",
      "description": "support teams service departments routing groups and queues",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "email_inbox",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_departments_attachments",
      "endpoint_key": "helpdesk_departments_attachments",
      "pascal_name": "HelpdeskDepartmentsAttachments",
      "tag": "Helpdesk",
      "summary": "Helpdesk Departments Attachments",
      "description": "department badges banners and routing reference documentation",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "helpdesk_department_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_sla_policies",
      "endpoint_key": "helpdesk_sla_policies",
      "pascal_name": "HelpdeskSlaPolicies",
      "tag": "Helpdesk",
      "summary": "Helpdesk Sla Policies",
      "description": "service level agreement rules response times and resolution target thresholds",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "priority_level",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "first_response_time_minutes",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "resolution_time_minutes",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_default",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_categories",
      "endpoint_key": "helpdesk_categories",
      "pascal_name": "HelpdeskCategories",
      "tag": "Helpdesk",
      "summary": "Helpdesk Categories",
      "description": "ticket classification categories topics and issue taxonomies",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "department_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_tickets",
      "endpoint_key": "helpdesk_tickets",
      "pascal_name": "HelpdeskTickets",
      "tag": "Helpdesk",
      "summary": "Helpdesk Tickets",
      "description": "customer support tickets issues inquiries and resolution lifecycle",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "ticket_number",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "requester_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "assigned_agent_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "department_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "category_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "sla_policy_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "subject",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "priority",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "channel",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "first_response_due_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "resolution_due_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "first_response_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "resolved_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "closed_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "metadata",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_tickets_attachments",
      "endpoint_key": "helpdesk_tickets_attachments",
      "pascal_name": "HelpdeskTicketsAttachments",
      "tag": "Helpdesk",
      "summary": "Helpdesk Tickets Attachments",
      "description": "error screenshots logs diagnostic reports and files attached to tickets",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "helpdesk_ticket_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_ticket_messages",
      "endpoint_key": "helpdesk_ticket_messages",
      "pascal_name": "HelpdeskTicketMessages",
      "tag": "Helpdesk",
      "summary": "Helpdesk Ticket Messages",
      "description": "ticket conversation thread replies notes and internal staff communications",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "ticket_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "author_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "is_internal_note",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "message_body",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "message_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_ticket_messages_attachments",
      "endpoint_key": "helpdesk_ticket_messages_attachments",
      "pascal_name": "HelpdeskTicketMessagesAttachments",
      "tag": "Helpdesk",
      "summary": "Helpdesk Ticket Messages Attachments",
      "description": "files screenshots and invoices sent inside ticket replies",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "helpdesk_ticket_message_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_canned_responses",
      "endpoint_key": "helpdesk_canned_responses",
      "pascal_name": "HelpdeskCannedResponses",
      "tag": "Helpdesk",
      "summary": "Helpdesk Canned Responses",
      "description": "quick response templates canned macros and snippets for support agents",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "department_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "created_by_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "shortcut_code",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "body_content",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "is_shared",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_canned_responses_attachments",
      "endpoint_key": "helpdesk_canned_responses_attachments",
      "pascal_name": "HelpdeskCannedResponsesAttachments",
      "tag": "Helpdesk",
      "summary": "Helpdesk Canned Responses Attachments",
      "description": "diagrams sample templates and visual guides linked to canned responses",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "helpdesk_canned_response_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_knowledge_articles",
      "endpoint_key": "helpdesk_knowledge_articles",
      "pascal_name": "HelpdeskKnowledgeArticles",
      "tag": "Helpdesk",
      "summary": "Helpdesk Knowledge Articles",
      "description": "self-service help center knowledge base articles tutorials and faqs",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "category_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "author_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "summary",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "content_rich_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "is_published",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_internal_only",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "views_count",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "helpful_votes",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "unhelpful_votes",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_knowledge_articles_attachments",
      "endpoint_key": "helpdesk_knowledge_articles_attachments",
      "pascal_name": "HelpdeskKnowledgeArticlesAttachments",
      "tag": "Helpdesk",
      "summary": "Helpdesk Knowledge Articles Attachments",
      "description": "illustrative screenshots pdf manuals and diagrams embedded in kb articles",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "helpdesk_knowledge_article_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/helpdesk_ticket_feedback",
      "endpoint_key": "helpdesk_ticket_feedback",
      "pascal_name": "HelpdeskTicketFeedback",
      "tag": "Helpdesk",
      "summary": "Helpdesk Ticket Feedback",
      "description": "customer satisfaction ratings csat scores and feedback on resolved tickets",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "ticket_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "customer_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "rating_score",
          "type": "integer",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "comment_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "agent_courtesy_score",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "resolution_speed_score",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Infrastructure": [
    {
      "path": "/file_uploads",
      "endpoint_key": "file_uploads",
      "pascal_name": "FileUploads",
      "tag": "Infrastructure",
      "summary": "File Uploads",
      "description": "tenant file uploads and technical media asset metadata",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "file_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "file_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "file_size",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "mime_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "storage_provider",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "metadata",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/widgets",
      "endpoint_key": "widgets",
      "pascal_name": "Widgets",
      "tag": "Infrastructure",
      "summary": "Widgets",
      "description": "visual widgets and dynamic dashboard components",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "priority",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "content_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "metadata",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/inner_logs",
      "endpoint_key": "inner_logs",
      "pascal_name": "InnerLogs",
      "tag": "Infrastructure",
      "summary": "Inner Logs",
      "description": "tenant-level audit and application telemetry logs",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "event_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "category",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "level",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "details_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "ip_address",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "user_agent",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/roles",
      "endpoint_key": "roles",
      "pascal_name": "Roles",
      "tag": "Infrastructure",
      "summary": "Roles",
      "description": "tenant custom role definitions for rbac",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/permissions",
      "endpoint_key": "permissions",
      "pascal_name": "Permissions",
      "tag": "Infrastructure",
      "summary": "Permissions",
      "description": "granular action permissions across subdomains",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "subdomain",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "action",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/user_permissions",
      "endpoint_key": "user_permissions",
      "pascal_name": "UserPermissions",
      "tag": "Infrastructure",
      "summary": "User Permissions",
      "description": "tenant user direct permission assignments",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "permission_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "is_granted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Json Box": [
    {
      "path": "/json_boxes",
      "endpoint_key": "json_boxes",
      "pascal_name": "JsonBoxes",
      "tag": "Json Box",
      "summary": "Json Boxes",
      "description": "unstructured dynamic json data boxes per tenant",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "data",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "metadata",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/json_boxes_attachments",
      "endpoint_key": "json_boxes_attachments",
      "pascal_name": "JsonBoxesAttachments",
      "tag": "Json Box",
      "summary": "Json Boxes Attachments",
      "description": "attachments and raw payloads associated with json boxes",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "json_box_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Kanban": [
    {
      "path": "/kanban_boards",
      "endpoint_key": "kanban_boards",
      "pascal_name": "KanbanBoards",
      "tag": "Kanban",
      "summary": "Kanban Boards",
      "description": "visual project boards privacy settings and theme colors",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "owner_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "privacy_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "color_hex",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_archived",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/kanban_board_members",
      "endpoint_key": "kanban_board_members",
      "pascal_name": "KanbanBoardMembers",
      "tag": "Kanban",
      "summary": "Kanban Board Members",
      "description": "member permissions and collaborator roles per board",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "board_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "role",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/kanban_board_columns",
      "endpoint_key": "kanban_board_columns",
      "pascal_name": "KanbanBoardColumns",
      "tag": "Kanban",
      "summary": "Kanban Board Columns",
      "description": "workflow stages wip limits ordering and status columns",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "board_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "position",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "wip_limit",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "color_hex",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/kanban_tasks",
      "endpoint_key": "kanban_tasks",
      "pascal_name": "KanbanTasks",
      "tag": "Kanban",
      "summary": "Kanban Tasks",
      "description": "kanban cards assignments priorities estimated hours and tags",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "board_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "column_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "creator_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "assigned_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "priority",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "position",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "due_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "estimated_hours",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "tags_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_completed",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "completed_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/kanban_tasks_attachments",
      "endpoint_key": "kanban_tasks_attachments",
      "pascal_name": "KanbanTasksAttachments",
      "tag": "Kanban",
      "summary": "Kanban Tasks Attachments",
      "description": "files mockups and deliverables attached to kanban cards",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "kanban_task_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Notekeep": [
    {
      "path": "/notekeep_notes",
      "endpoint_key": "notekeep_notes",
      "pascal_name": "NotekeepNotes",
      "tag": "Notekeep",
      "summary": "Notekeep Notes",
      "description": "rich text and markdown notes with color coding pinning archiving and trash states",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "content",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "color",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_pinned",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_archived",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_trashed",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "reminder_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/notekeep_notes_attachments",
      "endpoint_key": "notekeep_notes_attachments",
      "pascal_name": "NotekeepNotesAttachments",
      "tag": "Notekeep",
      "summary": "Notekeep Notes Attachments",
      "description": "file media and image attachments associated with notes",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "notekeep_note_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/notekeep_todos",
      "endpoint_key": "notekeep_todos",
      "pascal_name": "NotekeepTodos",
      "tag": "Notekeep",
      "summary": "Notekeep Todos",
      "description": "actionable todo checklist items linked to notes or standalone task lists",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "note_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "is_completed",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "priority",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "due_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_archived",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/notekeep_labels",
      "endpoint_key": "notekeep_labels",
      "pascal_name": "NotekeepLabels",
      "tag": "Notekeep",
      "summary": "Notekeep Labels",
      "description": "organizational category tags and labels for grouping notes and checklists",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "color",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/notekeep_note_labels",
      "endpoint_key": "notekeep_note_labels",
      "pascal_name": "NotekeepNoteLabels",
      "tag": "Notekeep",
      "summary": "Notekeep Note Labels",
      "description": "many to many association between notes and organizational labels",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "note_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "label_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/notekeep_reminders",
      "endpoint_key": "notekeep_reminders",
      "pascal_name": "NotekeepReminders",
      "tag": "Notekeep",
      "summary": "Notekeep Reminders",
      "description": "time based alarms and notifications scheduled for notes and todos",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "note_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "todo_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "remind_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "is_sent",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Notifications": [
    {
      "path": "/push_notifications",
      "endpoint_key": "push_notifications",
      "pascal_name": "PushNotifications",
      "tag": "Notifications",
      "summary": "Push Notifications",
      "description": "push notifications and operational system alerts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "body",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "target_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "icon_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "action_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "data_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "priority",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "start_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "end_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/email_notifications",
      "endpoint_key": "email_notifications",
      "pascal_name": "EmailNotifications",
      "tag": "Notifications",
      "summary": "Email Notifications",
      "description": "operational email notifications and transactional alerts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "subject",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "body",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "target_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "action_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "data_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "priority",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "start_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "end_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Real Estate": [
    {
      "path": "/agents",
      "endpoint_key": "agents",
      "pascal_name": "Agents",
      "tag": "Real Estate",
      "summary": "Agents",
      "description": "registered real estate brokers license credentials and specialties",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "license_number",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "phone",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "specialties",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "bio",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/agents_attachments",
      "endpoint_key": "agents_attachments",
      "pascal_name": "AgentsAttachments",
      "tag": "Real Estate",
      "summary": "Agents Attachments",
      "description": "agent professional portraits license certificates and business cards",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "agent_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/properties",
      "endpoint_key": "properties",
      "pascal_name": "Properties",
      "tag": "Real Estate",
      "summary": "Properties",
      "description": "real estate listings specifications pricing geolocation and amenities",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "agent_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "property_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "listing_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "condo_fee",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "tax_fee",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "bedrooms",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "bathrooms",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "suites",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "parking_spots",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_area",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "built_area",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "latitude",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "longitude",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "address_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "info_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "metadata",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/properties_attachments",
      "endpoint_key": "properties_attachments",
      "pascal_name": "PropertiesAttachments",
      "tag": "Real Estate",
      "summary": "Properties Attachments",
      "description": "property photos floor plans virtual tour videos and deeds",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "property_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/clients",
      "endpoint_key": "clients",
      "pascal_name": "Clients",
      "tag": "Real Estate",
      "summary": "Clients",
      "description": "prospective real estate buyers tenants budgets and area preferences",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "assigned_agent_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "full_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "email",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "phone",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "budget_min",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "budget_max",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "desired_property_types",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "desired_locations",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/visits",
      "endpoint_key": "visits",
      "pascal_name": "Visits",
      "tag": "Real Estate",
      "summary": "Visits",
      "description": "scheduled property walkthroughs inspections and client feedbacks",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "property_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "client_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "agent_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "scheduled_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": true
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "feedback",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/visits_attachments",
      "endpoint_key": "visits_attachments",
      "pascal_name": "VisitsAttachments",
      "tag": "Real Estate",
      "summary": "Visits Attachments",
      "description": "signed visit sheets inspection checklists and property photos",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "visit_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/property_views",
      "endpoint_key": "property_views",
      "pascal_name": "PropertyViews",
      "tag": "Real Estate",
      "summary": "Property Views",
      "description": "property page impression metrics visitor analytics and referral source",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "property_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "client_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "agent_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "view_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "view_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "ip_address",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "user_agent",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Restaurants": [
    {
      "path": "/restaurant_tabs",
      "endpoint_key": "restaurant_tabs",
      "pascal_name": "RestaurantTabs",
      "tag": "Restaurants",
      "summary": "Restaurant Tabs",
      "description": "restaurant dining tables, bar tabs and customer bills dispatched to commerce hub upon settlement",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "opened_by_user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tab_number",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "table_number",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "customer_name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "customer_phone",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "discount_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "final_amount",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "opened_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "closed_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/restaurant_tab_items",
      "endpoint_key": "restaurant_tab_items",
      "pascal_name": "RestaurantTabItems",
      "tag": "Restaurants",
      "summary": "Restaurant Tab Items",
      "description": "line items dishes and drinks ordered inside a tab, referencing universal catalog_items",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "tab_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "quantity",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "unit_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "total_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/restaurant_schedules",
      "endpoint_key": "restaurant_schedules",
      "pascal_name": "RestaurantSchedules",
      "tag": "Restaurants",
      "summary": "Restaurant Schedules",
      "description": "recurrence and timing rules for restaurant operational shifts happy hours and events",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "schedule_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "start_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "end_date",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "start_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "end_time",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "days_of_week",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "day_of_month",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_all_day",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/restaurant_promotions",
      "endpoint_key": "restaurant_promotions",
      "pascal_name": "RestaurantPromotions",
      "tag": "Restaurants",
      "summary": "Restaurant Promotions",
      "description": "marketing campaigns discounts happy hours and special seasonal culinary offers",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "schedule_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "title",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "discount_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "discount_value",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "image_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "banner_url",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "extra_data",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/restaurant_promotions_attachments",
      "endpoint_key": "restaurant_promotions_attachments",
      "pascal_name": "RestaurantPromotionsAttachments",
      "tag": "Restaurants",
      "summary": "Restaurant Promotions Attachments",
      "description": "promotion banners promotional flyers and campaign assets",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "restaurant_promotion_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/restaurant_promotion_menus",
      "endpoint_key": "restaurant_promotion_menus",
      "pascal_name": "RestaurantPromotionMenus",
      "tag": "Restaurants",
      "summary": "Restaurant Promotion Menus",
      "description": "associative mapping linking promotional campaigns to universal catalog dishes and beverages",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "promotion_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "item_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "promotional_price",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "special_notes",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ],
  "Social Media": [
    {
      "path": "/posts",
      "endpoint_key": "posts",
      "pascal_name": "Posts",
      "tag": "Social Media",
      "summary": "Posts",
      "description": "tenant social feed publications and media posts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "group_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "post_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "content_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "metrics_json",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "relevance_score",
          "type": "number",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "share_count",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/posts_attachments",
      "endpoint_key": "posts_attachments",
      "pascal_name": "PostsAttachments",
      "tag": "Social Media",
      "summary": "Posts Attachments",
      "description": "attachments and media assets linked to feed posts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/saved_posts",
      "endpoint_key": "saved_posts",
      "pascal_name": "SavedPosts",
      "tag": "Social Media",
      "summary": "Saved Posts",
      "description": "bookmarked and saved publications per tenant user",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/comments",
      "endpoint_key": "comments",
      "pascal_name": "Comments",
      "tag": "Social Media",
      "summary": "Comments",
      "description": "threaded discussion comments on posts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "parent_comment_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "content_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/comments_attachments",
      "endpoint_key": "comments_attachments",
      "pascal_name": "CommentsAttachments",
      "tag": "Social Media",
      "summary": "Comments Attachments",
      "description": "media attachments and gifs attached to post comments",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "comment_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/social_profiles",
      "endpoint_key": "social_profiles",
      "pascal_name": "SocialProfiles",
      "tag": "Social Media",
      "summary": "Social Profiles",
      "description": "user social profiles follower counters and external links",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "bio",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "followers_count",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "following_count",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "social_links",
          "type": "object",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/social_profiles_attachments",
      "endpoint_key": "social_profiles_attachments",
      "pascal_name": "SocialProfilesAttachments",
      "tag": "Social Media",
      "summary": "Social Profiles Attachments",
      "description": "avatar banners and highlight media for social profiles",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "social_profile_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/groups",
      "endpoint_key": "groups",
      "pascal_name": "Groups",
      "tag": "Social Media",
      "summary": "Groups",
      "description": "community groups and interest hubs per tenant",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "owner_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "slug",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "description",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "privacy_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "members_count",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/groups_attachments",
      "endpoint_key": "groups_attachments",
      "pascal_name": "GroupsAttachments",
      "tag": "Social Media",
      "summary": "Groups Attachments",
      "description": "group avatars banners and rules documents",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "group_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/group_members",
      "endpoint_key": "group_members",
      "pascal_name": "GroupMembers",
      "tag": "Social Media",
      "summary": "Group Members",
      "description": "community group membership and moderation roles",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "group_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "role",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "status",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "joined_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/likes",
      "endpoint_key": "likes",
      "pascal_name": "Likes",
      "tag": "Social Media",
      "summary": "Likes",
      "description": "user emoji reactions and likes on posts and comments",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "post_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "comment_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "reaction_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/social_chats",
      "endpoint_key": "social_chats",
      "pascal_name": "SocialChats",
      "tag": "Social Media",
      "summary": "Social Chats",
      "description": "direct and group chat conversation threads",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "chat_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "group_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "name",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_active",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/social_chat_participants",
      "endpoint_key": "social_chat_participants",
      "pascal_name": "SocialChatParticipants",
      "tag": "Social Media",
      "summary": "Social Chat Participants",
      "description": "conversation participant tracking and read receipts",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "chat_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "user_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "role",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "last_read_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "is_muted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/social_chat_messages",
      "endpoint_key": "social_chat_messages",
      "pascal_name": "SocialChatMessages",
      "tag": "Social Media",
      "summary": "Social Chat Messages",
      "description": "chat conversation messages with draft and thread support",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "chat_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "sender_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "content_text",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "parent_message_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    },
    {
      "path": "/social_chat_messages_attachments",
      "endpoint_key": "social_chat_messages_attachments",
      "pascal_name": "SocialChatMessagesAttachments",
      "tag": "Social Media",
      "summary": "Social Chat Messages Attachments",
      "description": "attachments voice notes and media in chat messages",
      "has_get": true,
      "has_post": true,
      "has_patch": true,
      "has_delete": true,
      "fields": [
        {
          "name": "id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": false
        },
        {
          "name": "tenant_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "social_chat_message_id",
          "type": "string",
          "format": "uuid",
          "example": "",
          "required": true
        },
        {
          "name": "url",
          "type": "string",
          "format": "",
          "example": "",
          "required": true
        },
        {
          "name": "attachment_type",
          "type": "string",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "display_order",
          "type": "integer",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "is_deleted",
          "type": "boolean",
          "format": "",
          "example": "",
          "required": false
        },
        {
          "name": "created_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        },
        {
          "name": "updated_at",
          "type": "string",
          "format": "date-time",
          "example": "",
          "required": false
        }
      ]
    }
  ]
};

export function App() {
  const [currentRoute, setCurrentRoute] = useState('landing');

  useEffect(() => {
    const handleCustomNav = (e) => {
      if (e && e.detail) {
        setCurrentRoute(e.detail);
      }
    };
    window.addEventListener('nt:navigate', handleCustomNav);
    return () => window.removeEventListener('nt:navigate', handleCustomNav);
  }, []);

  const renderPage = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage applets={appletsConfig} onNavigate={setCurrentRoute} />;
      case 'support_chat':
      case 'chat':
        return <SupportChatPage onNavigate={setCurrentRoute} />;
      case 'ant-test':
        return <AntTestPage />;
      case 'rpc_login':
        return <RpcLoginPage />;
      case 'rpc_register':
        return <RpcRegisterPage />;
      case 'me':
        return <MePage />;
      case 'users':
        return <UsersPage />;
      case 'tenants':
        return <TenantsPage />;
      case 'plans':
        return <PlansPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'nt_system_logs':
        return <NtSystemLogsPage />;
      case 'catalog_items':
        return <CatalogItemsPage />;
      case 'commerce_orders':
        return <CommerceOrdersPage />;
      case 'catalog_categories':
        return <CatalogCategoriesPage />;
      case 'catalog_categories_attachments':
        return <CatalogCategoriesAttachmentsPage />;
      case 'catalog_items_attachments':
        return <CatalogItemsAttachmentsPage />;
      case 'digital_item_deliverables':
        return <DigitalItemDeliverablesPage />;
      case 'service_item_profiles':
        return <ServiceItemProfilesPage />;
      case 'catalog_bom_bill_of_materials':
        return <CatalogBomBillOfMaterialsPage />;
      case 'commerce_pos_cash_sessions':
        return <CommercePosCashSessionsPage />;
      case 'commerce_order_items':
        return <CommerceOrderItemsPage />;
      case 'commerce_payment_gateways':
        return <CommercePaymentGatewaysPage />;
      case 'commerce_payment_methods':
        return <CommercePaymentMethodsPage />;
      case 'commerce_payment_transactions':
        return <CommercePaymentTransactionsPage />;
      case 'commerce_order_payments':
        return <CommerceOrderPaymentsPage />;
      case 'commerce_payment_refunds':
        return <CommercePaymentRefundsPage />;
      case 'master_inventory_ledger_movements':
        return <MasterInventoryLedgerMovementsPage />;
      case 'clinic_queue_tickets':
        return <ClinicQueueTicketsPage />;
      case 'clinic_ticket_routings':
        return <ClinicTicketRoutingsPage />;
      case 'clinic_appointments':
        return <ClinicAppointmentsPage />;
      case 'clinic_specialties':
        return <ClinicSpecialtiesPage />;
      case 'clinic_specialties_attachments':
        return <ClinicSpecialtiesAttachmentsPage />;
      case 'clinic_professionals':
        return <ClinicProfessionalsPage />;
      case 'clinic_professionals_attachments':
        return <ClinicProfessionalsAttachmentsPage />;
      case 'clinic_rooms':
        return <ClinicRoomsPage />;
      case 'clinic_rooms_attachments':
        return <ClinicRoomsAttachmentsPage />;
      case 'clinic_schedules':
        return <ClinicSchedulesPage />;
      case 'clinic_schedule_exceptions':
        return <ClinicScheduleExceptionsPage />;
      case 'clinic_appointments_attachments':
        return <ClinicAppointmentsAttachmentsPage />;
      case 'clinic_patient_records':
        return <ClinicPatientRecordsPage />;
      case 'clinic_patient_records_attachments':
        return <ClinicPatientRecordsAttachmentsPage />;
      case 'clinic_treatment_plans':
        return <ClinicTreatmentPlansPage />;
      case 'clinic_treatment_plans_attachments':
        return <ClinicTreatmentPlansAttachmentsPage />;
      case 'ecommerce_carts':
        return <EcommerceCartsPage />;
      case 'ecommerce_cart_items':
        return <EcommerceCartItemsPage />;
      case 'coupons':
        return <CouponsPage />;
      case 'ratings':
        return <RatingsPage />;
      case 'ratings_attachments':
        return <RatingsAttachmentsPage />;
      case 'ecommerce_payment_settings':
        return <EcommercePaymentSettingsPage />;
      case 'shipping_settings':
        return <ShippingSettingsPage />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'campaign_contacts':
        return <CampaignContactsPage />;
      case 'pages':
        return <PagesPage />;
      case 'pages_attachments':
        return <PagesAttachmentsPage />;
      case 'blogger_sidebars':
        return <BloggerSidebarsPage />;
      case 'blogger_themes':
        return <BloggerThemesPage />;
      case 'blogger_themes_attachments':
        return <BloggerThemesAttachmentsPage />;
      case 'chat_rooms':
        return <ChatRoomsPage />;
      case 'chat_room_participants':
        return <ChatRoomParticipantsPage />;
      case 'chat_messages':
        return <ChatMessagesPage />;
      case 'chat_messages_attachments':
        return <ChatMessagesAttachmentsPage />;
      case 'chat_messages_reactions':
        return <ChatMessagesReactionsPage />;
      case 'collaboration_calendars':
        return <CollaborationCalendarsPage />;
      case 'collaboration_events':
        return <CollaborationEventsPage />;
      case 'collaboration_event_attendees':
        return <CollaborationEventAttendeesPage />;
      case 'collaboration_events_attachments':
        return <CollaborationEventsAttachmentsPage />;
      case 'collaboration_notes':
        return <CollaborationNotesPage />;
      case 'collaboration_notes_attachments':
        return <CollaborationNotesAttachmentsPage />;
      case 'collaboration_channels':
        return <CollaborationChannelsPage />;
      case 'collaboration_posts':
        return <CollaborationPostsPage />;
      case 'collaboration_posts_attachments':
        return <CollaborationPostsAttachmentsPage />;
      case 'collaboration_posts_comments':
        return <CollaborationPostsCommentsPage />;
      case 'collaboration_posts_comments_attachments':
        return <CollaborationPostsCommentsAttachmentsPage />;
      case 'collaboration_posts_likes':
        return <CollaborationPostsLikesPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'contacts_attachments':
        return <ContactsAttachmentsPage />;
      case 'pipelines':
        return <PipelinesPage />;
      case 'pipeline_stages':
        return <PipelineStagesPage />;
      case 'deals':
        return <DealsPage />;
      case 'deals_attachments':
        return <DealsAttachmentsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'tasks_attachments':
        return <TasksAttachmentsPage />;
      case 'interactions':
        return <InteractionsPage />;
      case 'interactions_attachments':
        return <InteractionsAttachmentsPage />;
      case 'crm_dashboards':
        return <CrmDashboardsPage />;
      case 'event_categories':
        return <EventCategoriesPage />;
      case 'event_tags':
        return <EventTagsPage />;
      case 'event_posts':
        return <EventPostsPage />;
      case 'event_posts_attachments':
        return <EventPostsAttachmentsPage />;
      case 'event_tiers':
        return <EventTiersPage />;
      case 'event_tickets':
        return <EventTicketsPage />;
      case 'event_tickets_attachments':
        return <EventTicketsAttachmentsPage />;
      case 'helpdesk_departments':
        return <HelpdeskDepartmentsPage />;
      case 'helpdesk_departments_attachments':
        return <HelpdeskDepartmentsAttachmentsPage />;
      case 'helpdesk_sla_policies':
        return <HelpdeskSlaPoliciesPage />;
      case 'helpdesk_categories':
        return <HelpdeskCategoriesPage />;
      case 'helpdesk_tickets':
        return <HelpdeskTicketsPage />;
      case 'helpdesk_tickets_attachments':
        return <HelpdeskTicketsAttachmentsPage />;
      case 'helpdesk_ticket_messages':
        return <HelpdeskTicketMessagesPage />;
      case 'helpdesk_ticket_messages_attachments':
        return <HelpdeskTicketMessagesAttachmentsPage />;
      case 'helpdesk_canned_responses':
        return <HelpdeskCannedResponsesPage />;
      case 'helpdesk_canned_responses_attachments':
        return <HelpdeskCannedResponsesAttachmentsPage />;
      case 'helpdesk_knowledge_articles':
        return <HelpdeskKnowledgeArticlesPage />;
      case 'helpdesk_knowledge_articles_attachments':
        return <HelpdeskKnowledgeArticlesAttachmentsPage />;
      case 'helpdesk_ticket_feedback':
        return <HelpdeskTicketFeedbackPage />;
      case 'file_uploads':
        return <FileUploadsPage />;
      case 'widgets':
        return <WidgetsPage />;
      case 'inner_logs':
        return <InnerLogsPage />;
      case 'roles':
        return <RolesPage />;
      case 'permissions':
        return <PermissionsPage />;
      case 'user_permissions':
        return <UserPermissionsPage />;
      case 'json_boxes':
        return <JsonBoxesPage />;
      case 'json_boxes_attachments':
        return <JsonBoxesAttachmentsPage />;
      case 'kanban_boards':
        return <KanbanBoardsPage />;
      case 'kanban_board_members':
        return <KanbanBoardMembersPage />;
      case 'kanban_board_columns':
        return <KanbanBoardColumnsPage />;
      case 'kanban_tasks':
        return <KanbanTasksPage />;
      case 'kanban_tasks_attachments':
        return <KanbanTasksAttachmentsPage />;
      case 'notekeep_notes':
        return <NotekeepNotesPage />;
      case 'notekeep_notes_attachments':
        return <NotekeepNotesAttachmentsPage />;
      case 'notekeep_todos':
        return <NotekeepTodosPage />;
      case 'notekeep_labels':
        return <NotekeepLabelsPage />;
      case 'notekeep_note_labels':
        return <NotekeepNoteLabelsPage />;
      case 'notekeep_reminders':
        return <NotekeepRemindersPage />;
      case 'push_notifications':
        return <PushNotificationsPage />;
      case 'email_notifications':
        return <EmailNotificationsPage />;
      case 'agents':
        return <AgentsPage />;
      case 'agents_attachments':
        return <AgentsAttachmentsPage />;
      case 'properties':
        return <PropertiesPage />;
      case 'properties_attachments':
        return <PropertiesAttachmentsPage />;
      case 'clients':
        return <ClientsPage />;
      case 'visits':
        return <VisitsPage />;
      case 'visits_attachments':
        return <VisitsAttachmentsPage />;
      case 'property_views':
        return <PropertyViewsPage />;
      case 'restaurant_tabs':
        return <RestaurantTabsPage />;
      case 'restaurant_tab_items':
        return <RestaurantTabItemsPage />;
      case 'restaurant_schedules':
        return <RestaurantSchedulesPage />;
      case 'restaurant_promotions':
        return <RestaurantPromotionsPage />;
      case 'restaurant_promotions_attachments':
        return <RestaurantPromotionsAttachmentsPage />;
      case 'restaurant_promotion_menus':
        return <RestaurantPromotionMenusPage />;
      case 'posts':
        return <PostsPage />;
      case 'posts_attachments':
        return <PostsAttachmentsPage />;
      case 'saved_posts':
        return <SavedPostsPage />;
      case 'comments':
        return <CommentsPage />;
      case 'comments_attachments':
        return <CommentsAttachmentsPage />;
      case 'social_profiles':
        return <SocialProfilesPage />;
      case 'social_profiles_attachments':
        return <SocialProfilesAttachmentsPage />;
      case 'groups':
        return <GroupsPage />;
      case 'groups_attachments':
        return <GroupsAttachmentsPage />;
      case 'group_members':
        return <GroupMembersPage />;
      case 'likes':
        return <LikesPage />;
      case 'social_chats':
        return <SocialChatsPage />;
      case 'social_chat_participants':
        return <SocialChatParticipantsPage />;
      case 'social_chat_messages':
        return <SocialChatMessagesPage />;
      case 'social_chat_messages_attachments':
        return <SocialChatMessagesAttachmentsPage />;
      case 'authentication_main':
        return <RpcLoginPage />;
      case 'identity_profile':
      case 'identity_profile_spa':
      case 'identity_profile_main':
        return <IdentityProfileSpaPage />;
      case 'users_rbac':
      case 'users_rbac_spa':
      case 'users_rbac_main':
        return <UsersRbacSpaPage />;
      case 'tenants_spa':
      case 'tenants_main':
        return <TenantsSpaPage />;
      case 'plans_subscriptions':
      case 'plans_subscriptions_spa':
      case 'plans_subscriptions_main':
        return <PlansSubscriptionsSpaPage />;
      case 'audit_system_logs':
      case 'audit_system_logs_spa':
      case 'audit_system_logs_main':
        return <AuditSystemLogsSpaPage />;
      case 'commerce_hub':
      case 'commerce_hub_spa':
      case 'commerce_hub_main':
        return <CommerceHubSpaPage />;
      case 'clinics':
      case 'clinics_spa':
      case 'clinics_main':
        return <ClinicsSpaPage />;
      case 'ecommerce':
      case 'ecommerce_spa':
      case 'ecommerce_main':
        return <EcommerceSpaPage />;
      case 'campaigns_spa':
      case 'campaigns_main':
        return <CampaignsSpaPage />;
      case 'cms_advanced':
      case 'cms_advanced_spa':
      case 'cms_advanced_main':
        return <CmsAdvancedSpaPage />;
      case 'collaboration':
      case 'collaboration_spa':
      case 'collaboration_main':
        return <CollaborationSpaPage />;
      case 'crm':
      case 'crm_spa':
      case 'crm_main':
        return <CrmSpaPage />;
      case 'events':
      case 'events_spa':
      case 'events_main':
        return <EventsSpaPage />;
      case 'helpdesk':
      case 'helpdesk_spa':
      case 'helpdesk_main':
        return <HelpdeskSpaPage />;
      case 'infrastructure_main':
        return <FileUploadsPage />;
      case 'json_box':
      case 'json_box_spa':
      case 'json_box_main':
        return <JsonBoxSpaPage />;
      case 'kanban':
      case 'kanban_spa':
      case 'kanban_main':
        return <KanbanSpaPage />;
      case 'notekeep':
      case 'notekeep_spa':
      case 'notekeep_main':
        return <NotekeepSpaPage />;
      case 'notifications':
      case 'notifications_spa':
      case 'notifications_main':
        return <NotificationsSpaPage />;
      case 'real_estate':
      case 'real_estate_spa':
      case 'real_estate_main':
        return <RealEstateSpaPage />;
      case 'restaurants':
      case 'restaurants_spa':
      case 'restaurants_main':
        return <RestaurantsSpaPage />;
      case 'social_media':
      case 'social_media_spa':
      case 'social_media_main':
        return <SocialMediaSpaPage />;
      default:
        return <HomePage applets={appletsConfig} onNavigate={setCurrentRoute} />;
    }
  };

  if (currentRoute === 'landing') {
    return (
      <ThemeProvider initialMode="dark">
        <PlanProvider>
          <AntdApp>
            <Suspense fallback={<LoadingFallback />}>
              <LandingPage 
                onNavigateToAdmin={() => setCurrentRoute('home')} 
                onOpenLogin={() => setCurrentRoute('home')} 
              />
            </Suspense>
          </AntdApp>
        </PlanProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider initialMode="light">
      <PlanProvider>
        <AntdApp>
          <AdminLayout applets={appletsConfig} currentRoute={currentRoute} onNavigate={setCurrentRoute}>
            <Suspense fallback={<LoadingFallback />}>
              {renderPage()}
            </Suspense>
          </AdminLayout>
        </AntdApp>
      </PlanProvider>
    </ThemeProvider>
  );
}
