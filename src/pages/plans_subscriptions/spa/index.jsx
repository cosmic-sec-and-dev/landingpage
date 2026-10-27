import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const PlansSubscriptionsSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Plans & Subscriptions') && !hasAccess('plans') && !hasAccess('plans_subscriptions')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Planos & Assinaturas."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    plans: [],
    subscriptions: [],
    tenants: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllPlanData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, tenantsRes, meRes] = await Promise.all([
        apiRequest('/plans?order=created_at.desc'),
        apiRequest('/subscriptions?order=created_at.desc'),
        apiRequest('/tenants'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        plans: plansRes.ok && Array.isArray(plansRes.data) ? plansRes.data : [],
        subscriptions: subsRes.ok && Array.isArray(subsRes.data) ? subsRes.data : [],
        tenants: tenantsRes.ok && Array.isArray(tenantsRes.data) ? tenantsRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados de Planos e Assinaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPlanData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="Monetization"
          title="Gestão de Planos & Assinaturas SaaS"
          description="Configuração de planos de precificação, tiers de funcionalidades e vinculação de assinaturas para organizações clientes."
          count={moduleData.plans.length}
        />
      </div>

      {loading && moduleData.plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          plans={moduleData.plans}
          subscriptions={moduleData.subscriptions}
          tenants={moduleData.tenants}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllPlanData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default PlansSubscriptionsSpaPage;
