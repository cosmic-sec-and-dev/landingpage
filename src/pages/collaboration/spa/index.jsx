import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const CollaborationSpaPage = () => {
  const { hasAccess } = usePlan();

  if (
    !hasAccess('Collaboration') &&
    !hasAccess('chat_rooms') &&
    !hasAccess('collaboration_events') &&
    !hasAccess('collaboration_posts') &&
    !hasAccess('collaboration')
  ) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet de Colaboração & Comunicação de Equipe."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    rooms: [],
    messages: [],
    messageAttachments: [],
    reactions: [],
    calendars: [],
    events: [],
    eventAttendees: [],
    notes: [],
    channels: [],
    posts: [],
    comments: [],
    postLikes: [],
    users: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllCollabData = async () => {
    setLoading(true);
    try {
      const [
        roomsRes,
        messagesRes,
        reactionsRes,
        calendarsRes,
        eventsRes,
        eventAttendeesRes,
        notesRes,
        channelsRes,
        postsRes,
        commentsRes,
        postLikesRes,
        usersRes,
        meRes,
        chatAttachmentsRes
      ] = await Promise.all([
        apiRequest('/chat_rooms?order=is_archived.asc,last_message_at.desc.nullslast,created_at.desc'),
        apiRequest('/chat_messages?order=created_at.asc'),
        apiRequest('/chat_messages_reactions'),
        apiRequest('/collaboration_calendars?order=is_primary.desc,name.asc'),
        apiRequest('/collaboration_events?order=start_at.asc'),
        apiRequest('/collaboration_event_attendees'),
        apiRequest('/collaboration_notes?order=is_pinned.desc,updated_at.desc'),
        apiRequest('/collaboration_channels?order=is_active.desc,name.asc'),
        apiRequest('/collaboration_posts?order=is_pinned.desc,created_at.desc'),
        apiRequest('/collaboration_posts_comments?order=created_at.asc'),
        apiRequest('/collaboration_posts_likes'),
        apiRequest('/users'),
        apiRequest('/me'),
        apiRequest('/chat_messages_attachments?order=display_order.asc')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        rooms: roomsRes.ok && Array.isArray(roomsRes.data) ? roomsRes.data : [],
        messages: messagesRes.ok && Array.isArray(messagesRes.data) ? messagesRes.data : [],
        messageAttachments: chatAttachmentsRes.ok && Array.isArray(chatAttachmentsRes.data) ? chatAttachmentsRes.data : [],
        reactions: reactionsRes.ok && Array.isArray(reactionsRes.data) ? reactionsRes.data : [],
        calendars: calendarsRes.ok && Array.isArray(calendarsRes.data) ? calendarsRes.data : [],
        events: eventsRes.ok && Array.isArray(eventsRes.data) ? eventsRes.data : [],
        eventAttendees: eventAttendeesRes.ok && Array.isArray(eventAttendeesRes.data) ? eventAttendeesRes.data : [],
        notes: notesRes.ok && Array.isArray(notesRes.data) ? notesRes.data : [],
        channels: channelsRes.ok && Array.isArray(channelsRes.data) ? channelsRes.data : [],
        posts: postsRes.ok && Array.isArray(postsRes.data) ? postsRes.data : [],
        comments: commentsRes.ok && Array.isArray(commentsRes.data) ? commentsRes.data : [],
        postLikes: postLikesRes.ok && Array.isArray(postLikesRes.data) ? postLikesRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados de Colaboração');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCollabData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="Colaboração"
          title="Central de Trabalho & Comunicação de Equipe"
          description="Salas de bate-papo, agenda compartilhada com videoconferência, anotações de trabalho e mural de comunicados corporativos."
          count={moduleData.rooms.length + moduleData.events.length + moduleData.posts.length}
        />
      </div>

      {loading && moduleData.rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          rooms={moduleData.rooms}
          messages={moduleData.messages}
          messageAttachments={moduleData.messageAttachments}
          reactions={moduleData.reactions}
          calendars={moduleData.calendars}
          events={moduleData.events}
          eventAttendees={moduleData.eventAttendees}
          notes={moduleData.notes}
          channels={moduleData.channels}
          posts={moduleData.posts}
          comments={moduleData.comments}
          postLikes={moduleData.postLikes}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllCollabData}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CollaborationSpaPage;
