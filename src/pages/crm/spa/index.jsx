import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const CrmSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('CRM') && !hasAccess('deals') && !hasAccess('crm') && !hasAccess('pipelines') && !hasAccess('contacts')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet CRM."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    pipelines: [],
    stages: [],
    deals: [],
    contacts: [],
    tasks: [],
    interactions: [],
    users: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllCrmData = async () => {
    setLoading(true);
    try {
      const [
        pipesRes,
        stagesRes,
        dealsRes,
        contactsRes,
        tasksRes,
        interactionsRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest('/pipelines?order=is_default.desc,created_at.asc'),
        apiRequest('/pipeline_stages?order=position.asc'),
        apiRequest('/deals?order=created_at.desc'),
        apiRequest('/contacts?order=created_at.desc'),
        apiRequest('/tasks?order=due_date.asc'),
        apiRequest('/interactions?order=created_at.desc'),
        apiRequest('/users'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        pipelines: pipesRes.ok && Array.isArray(pipesRes.data) ? pipesRes.data : [],
        stages: stagesRes.ok && Array.isArray(stagesRes.data) ? stagesRes.data : [],
        deals: dealsRes.ok && Array.isArray(dealsRes.data) ? dealsRes.data : [],
        contacts: contactsRes.ok && Array.isArray(contactsRes.data) ? contactsRes.data : [],
        tasks: tasksRes.ok && Array.isArray(tasksRes.data) ? tasksRes.data : [],
        interactions: interactionsRes.ok && Array.isArray(interactionsRes.data) ? interactionsRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do CRM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCrmData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="CRM"
          title="Gestão de Pipelines Comerciais & CRM"
          description="Acompanhamento visual de oportunidades de vendas por etapas, gestão de contatos qualificados e tarefas de follow-up."
          count={moduleData.deals.length}
        />
      </div>

      {loading && moduleData.deals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          pipelines={moduleData.pipelines}
          stages={moduleData.stages}
          deals={moduleData.deals}
          contacts={moduleData.contacts}
          tasks={moduleData.tasks}
          interactions={moduleData.interactions}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllCrmData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default CrmSpaPage;
