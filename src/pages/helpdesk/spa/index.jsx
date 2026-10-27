import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const HelpdeskSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Helpdesk') && !hasAccess('helpdesk_tickets') && !hasAccess('helpdesk')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Helpdesk."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    tickets: [],
    messages: [],
    departments: [],
    categories: [],
    slaPolicies: [],
    knowledgeArticles: [],
    cannedResponses: [],
    users: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllHelpdeskData = async () => {
    setLoading(true);
    try {
      const [
        tktRes,
        msgRes,
        deptRes,
        catRes,
        slaRes,
        kbRes,
        cndRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest('/helpdesk_tickets?order=created_at.desc'),
        apiRequest('/helpdesk_ticket_messages?order=created_at.asc'),
        apiRequest('/helpdesk_departments'),
        apiRequest('/helpdesk_categories'),
        apiRequest('/helpdesk_sla_policies'),
        apiRequest('/helpdesk_knowledge_articles?order=views_count.desc'),
        apiRequest('/helpdesk_canned_responses'),
        apiRequest('/users'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        tickets: tktRes.ok && Array.isArray(tktRes.data) ? tktRes.data : [],
        messages: msgRes.ok && Array.isArray(msgRes.data) ? msgRes.data : [],
        departments: deptRes.ok && Array.isArray(deptRes.data) ? deptRes.data : [],
        categories: catRes.ok && Array.isArray(catRes.data) ? catRes.data : [],
        slaPolicies: slaRes.ok && Array.isArray(slaRes.data) ? slaRes.data : [],
        knowledgeArticles: kbRes.ok && Array.isArray(kbRes.data) ? kbRes.data : [],
        cannedResponses: cndRes.ok && Array.isArray(cndRes.data) ? cndRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do Helpdesk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllHelpdeskData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="Helpdesk"
          title="Central de Suporte & Helpdesk"
          description="Atendimento omnicanal ao cliente, filas de chamados por departamento, respostas rápidas e base de conhecimento."
          count={moduleData.tickets.length}
        />
      </div>

      {loading && moduleData.tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          tickets={moduleData.tickets}
          messages={moduleData.messages}
          departments={moduleData.departments}
          categories={moduleData.categories}
          slaPolicies={moduleData.slaPolicies}
          knowledgeArticles={moduleData.knowledgeArticles}
          cannedResponses={moduleData.cannedResponses}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllHelpdeskData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default HelpdeskSpaPage;
