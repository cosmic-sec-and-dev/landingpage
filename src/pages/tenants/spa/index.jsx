import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const TenantsSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Tenants') && !hasAccess('tenants')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Tenants."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    tenants: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllTenantData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, meRes] = await Promise.all([
        apiRequest('/tenants?order=created_at.desc'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        tenants: tenantsRes.ok && Array.isArray(tenantsRes.data) ? tenantsRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados de Organizações/Tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTenantData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="Tenants"
          title="Gestão Multi-Tenant de Organizações"
          description="Controle e provisionamento de organizações clientes, subdomínios dedicados, CNPJ e quotas isoladas."
          count={moduleData.tenants.length}
        />
      </div>

      {loading && moduleData.tenants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          tenants={moduleData.tenants}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllTenantData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default TenantsSpaPage;
