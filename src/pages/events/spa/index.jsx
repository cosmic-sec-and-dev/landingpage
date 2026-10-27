import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const EventsSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Events') && !hasAccess('event_posts') && !hasAccess('events')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet de Eventos & Ingressos."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    events: [],
    categories: [],
    tags: [],
    tiers: [],
    tickets: [],
    users: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllEventsData = async () => {
    setLoading(true);
    try {
      const [
        eventsRes,
        catRes,
        tagsRes,
        tiersRes,
        ticketsRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest('/event_posts?order=start_date.desc'),
        apiRequest('/event_categories?order=name.asc'),
        apiRequest('/event_tags?order=name.asc'),
        apiRequest('/event_tiers?order=created_at.desc'),
        apiRequest('/event_tickets?order=created_at.desc'),
        apiRequest('/users'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        events: eventsRes.ok && Array.isArray(eventsRes.data) ? eventsRes.data : [],
        categories: catRes.ok && Array.isArray(catRes.data) ? catRes.data : [],
        tags: tagsRes.ok && Array.isArray(tagsRes.data) ? tagsRes.data : [],
        tiers: tiersRes.ok && Array.isArray(tiersRes.data) ? tiersRes.data : [],
        tickets: ticketsRes.ok && Array.isArray(ticketsRes.data) ? ticketsRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados dos Eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEventsData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="Events"
          title="Gestão de Eventos, Ingressos & Credenciamento"
          description="Controle de eventos presenciais e online, lotes de ingressos, emissão de bilhetes e portaria com validação QR Code."
          count={moduleData.events.length}
        />
      </div>

      {loading && moduleData.events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          events={moduleData.events}
          categories={moduleData.categories}
          tags={moduleData.tags}
          tiers={moduleData.tiers}
          tickets={moduleData.tickets}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllEventsData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default EventsSpaPage;
