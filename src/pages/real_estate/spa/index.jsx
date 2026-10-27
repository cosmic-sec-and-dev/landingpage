import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const RealEstateSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Real Estate') && !hasAccess('properties') && !hasAccess('real_estate')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Imobiliária & Gestão de Imóveis."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    properties: [],
    agents: [],
    clients: [],
    visits: [],
    users: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllRealEstateData = async () => {
    setLoading(true);
    try {
      const [
        propRes,
        agentsRes,
        clientsRes,
        visitsRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest('/properties?order=created_at.desc'),
        apiRequest('/agents?order=created_at.desc'),
        apiRequest('/clients?order=created_at.desc'),
        apiRequest('/visits?order=scheduled_at.desc'),
        apiRequest('/users'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        properties: propRes.ok && Array.isArray(propRes.data) ? propRes.data : [],
        agents: agentsRes.ok && Array.isArray(agentsRes.data) ? agentsRes.data : [],
        clients: clientsRes.ok && Array.isArray(clientsRes.data) ? clientsRes.data : [],
        visits: visitsRes.ok && Array.isArray(visitsRes.data) ? visitsRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados Imobiliários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRealEstateData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="Real Estate"
          title="Gestão Imobiliária, Carteira & Visitas"
          description="Controle de carteira de imóveis para venda e locação, corretores com CRECI, clientes interessados e agenda de visitas."
          count={moduleData.properties.length}
        />
      </div>

      {loading && moduleData.properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          properties={moduleData.properties}
          agents={moduleData.agents}
          clients={moduleData.clients}
          visits={moduleData.visits}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllRealEstateData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default RealEstateSpaPage;
