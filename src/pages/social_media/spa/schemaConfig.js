/**
 * Social Media Module - Schema & Endpoint Configuration
 * Single Source of Truth (SSOT) from selene_backend/public/modules/social_media/schema/SCHEMA.SQL
 */

export const MODULE_NAME = "Social Media";
export const MODULE_TAG = "Social Media";

export const ENDPOINTS = {
  posts: {
    key: "posts",
    path: "/posts",
    title: "Publicações & Feed",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: true },
      { name: "group_id", type: "string", format: "uuid", required: false },
      { name: "post_type", type: "string", format: "", required: true, default: "post" },
      { name: "content_text", type: "string", format: "", required: true },
      { name: "metrics_json", type: "object", format: "", required: false, default: { likes: 0, shares: 0, views: 0 } },
      { name: "relevance_score", type: "number", format: "", required: false, default: 0 },
      { name: "share_count", type: "integer", format: "", required: false, default: 0 },
      { name: "status", type: "string", format: "", required: true, default: "published" },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  posts_attachments: {
    key: "posts_attachments",
    path: "/posts_attachments",
    title: "Mídias das Publicações",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "post_id", type: "string", format: "uuid", required: true },
      { name: "url", type: "string", format: "", required: true },
      { name: "attachment_type", type: "string", format: "", required: true, default: "image" },
      { name: "display_order", type: "integer", format: "", required: false, default: 0 },
      { name: "is_deleted", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  comments: {
    key: "comments",
    path: "/comments",
    title: "Comentários & Discussões",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "post_id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: true },
      { name: "parent_comment_id", type: "string", format: "uuid", required: false },
      { name: "content_text", type: "string", format: "", required: true },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  comments_attachments: {
    key: "comments_attachments",
    path: "/comments_attachments",
    title: "Anexos dos Comentários",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "comment_id", type: "string", format: "uuid", required: true },
      { name: "url", type: "string", format: "", required: true },
      { name: "attachment_type", type: "string", format: "", required: true, default: "image" },
      { name: "display_order", type: "integer", format: "", required: false, default: 0 },
      { name: "is_deleted", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  likes: {
    key: "likes",
    path: "/likes",
    title: "Reações & Curtidas",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: true },
      { name: "post_id", type: "string", format: "uuid", required: false },
      { name: "comment_id", type: "string", format: "uuid", required: false },
      { name: "reaction_type", type: "string", format: "", required: true, default: "like" },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  saved_posts: {
    key: "saved_posts",
    path: "/saved_posts",
    title: "Itens Salvos & Favoritos",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: true },
      { name: "post_id", type: "string", format: "uuid", required: true },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  groups: {
    key: "groups",
    path: "/groups",
    title: "Grupos & Comunidades",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "owner_id", type: "string", format: "uuid", required: true },
      { name: "name", type: "string", format: "", required: true },
      { name: "slug", type: "string", format: "", required: true },
      { name: "description", type: "string", format: "", required: false },
      { name: "privacy_type", type: "string", format: "", required: true, default: "public" },
      { name: "members_count", type: "integer", format: "", required: false, default: 1 },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  groups_attachments: {
    key: "groups_attachments",
    path: "/groups_attachments",
    title: "Banners & Capas de Grupos",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "group_id", type: "string", format: "uuid", required: true },
      { name: "url", type: "string", format: "", required: true },
      { name: "attachment_type", type: "string", format: "", required: true, default: "banner" },
      { name: "display_order", type: "integer", format: "", required: false, default: 0 },
      { name: "is_deleted", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  group_members: {
    key: "group_members",
    path: "/group_members",
    title: "Membros dos Grupos",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "group_id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: true },
      { name: "role", type: "string", format: "", required: true, default: "member" },
      { name: "status", type: "string", format: "", required: true, default: "active" },
      { name: "joined_at", type: "string", format: "date-time", required: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  social_profiles: {
    key: "social_profiles",
    path: "/social_profiles",
    title: "Perfis Sociais",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: true },
      { name: "bio", type: "string", format: "", required: false },
      { name: "followers_count", type: "integer", format: "", required: false, default: 0 },
      { name: "following_count", type: "integer", format: "", required: false, default: 0 },
      { name: "social_links", type: "object", format: "", required: false, default: {} },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  social_profiles_attachments: {
    key: "social_profiles_attachments",
    path: "/social_profiles_attachments",
    title: "Avatares & Capas de Perfil",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "social_profile_id", type: "string", format: "uuid", required: true },
      { name: "url", type: "string", format: "", required: true },
      { name: "attachment_type", type: "string", format: "", required: true, default: "avatar" },
      { name: "display_order", type: "integer", format: "", required: false, default: 0 },
      { name: "is_deleted", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  social_chats: {
    key: "social_chats",
    path: "/social_chats",
    title: "Salas de Chat Social",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "chat_type", type: "string", format: "", required: true, default: "direct_private" },
      { name: "group_id", type: "string", format: "uuid", required: false },
      { name: "name", type: "string", format: "", required: false },
      { name: "is_active", type: "boolean", format: "", required: false, default: true },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  social_chat_participants: {
    key: "social_chat_participants",
    path: "/social_chat_participants",
    title: "Participantes dos Chats",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "chat_id", type: "string", format: "uuid", required: true },
      { name: "user_id", type: "string", format: "uuid", required: true },
      { name: "role", type: "string", format: "", required: true, default: "member" },
      { name: "last_read_at", type: "string", format: "date-time", required: false },
      { name: "is_muted", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  social_chat_messages: {
    key: "social_chat_messages",
    path: "/social_chat_messages",
    title: "Mensagens de Chat",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "chat_id", type: "string", format: "uuid", required: true },
      { name: "sender_id", type: "string", format: "uuid", required: true },
      { name: "content_text", type: "string", format: "", required: true },
      { name: "type", type: "string", format: "", required: true, default: "active" },
      { name: "parent_message_id", type: "string", format: "uuid", required: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  },
  social_chat_messages_attachments: {
    key: "social_chat_messages_attachments",
    path: "/social_chat_messages_attachments",
    title: "Mídias das Mensagens",
    primaryKey: "id",
    fields: [
      { name: "id", type: "string", format: "uuid", required: true },
      { name: "social_chat_message_id", type: "string", format: "uuid", required: true },
      { name: "url", type: "string", format: "", required: true },
      { name: "attachment_type", type: "string", format: "", required: true, default: "image" },
      { name: "display_order", type: "integer", format: "", required: false, default: 0 },
      { name: "is_deleted", type: "boolean", format: "", required: false, default: false },
      { name: "created_at", type: "string", format: "date-time", required: false },
      { name: "updated_at", type: "string", format: "date-time", required: false }
    ]
  }
};
