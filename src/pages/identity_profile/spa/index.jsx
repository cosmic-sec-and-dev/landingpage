import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const IdentityProfileSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Identity & Profile') && !hasAccess('me')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Meu Perfil."
        type="warning"
        showIcon
      />
    );
  }

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/me');
      if (res.ok && res.data) {
        setProfile(Array.isArray(res.data) ? res.data[0] : res.data);
      }
    } catch {
      message.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="Identity"
          title="Identidade, Perfil & Segurança"
          description="Gestão de dados cadastrais do usuário, foto de perfil, credenciais de acesso e sessão ativa."
          count={profile ? 1 : 0}
        />
      </div>

      {loading && !profile ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          profile={profile}
          onRefresh={fetchProfile}
          loading={loading}
        />
      )}
    </div>
  );
};
export default IdentityProfileSpaPage;
