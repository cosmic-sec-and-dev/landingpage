import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const CampaignsSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Campaigns') && !hasAccess('campaigns')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Campanhas."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    campaigns: [],
    contacts: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllCampaignData = async () => {
    setLoading(true);
    try {
      const [campRes, contRes, meRes] = await Promise.all([
        apiRequest('/campaigns?order=created_at.desc'),
        apiRequest('/campaign_contacts'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        campaigns: campRes.ok && Array.isArray(campRes.data) ? campRes.data : [],
        contacts: contRes.ok && Array.isArray(contRes.data) ? contRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados de Campanhas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCampaignData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="Campaigns"
          title="Gestão de Campanhas de Marketing"
          description="Criação de campanhas direcionadas, gestão de leads/destinatários, tracking de taxa de abertura e engajamento."
          count={moduleData.campaigns.length}
        />
      </div>

      {loading && moduleData.campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          campaigns={moduleData.campaigns}
          contacts={moduleData.contacts}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllCampaignData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default CampaignsSpaPage;
