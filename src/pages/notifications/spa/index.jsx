import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const NotificationsSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Notifications') && !hasAccess('push_notifications') && !hasAccess('email_notifications')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Notifications."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    pushNotifications: [],
    emailNotifications: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllNotificationData = async () => {
    setLoading(true);
    try {
      const [pushRes, emailRes, meRes] = await Promise.all([
        apiRequest('/push_notifications?order=created_at.desc'),
        apiRequest('/email_notifications?order=created_at.desc'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        pushNotifications: pushRes.ok && Array.isArray(pushRes.data) ? pushRes.data : [],
        emailNotifications: emailRes.ok && Array.isArray(emailRes.data) ? emailRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados de Notificações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotificationData();
  }, []);

  const totalCount = moduleData.pushNotifications.length + moduleData.emailNotifications.length;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '18px'
      }}>
        <AppletHeader
          tag="Notifications"
          title="Central de Disparos & Notificações"
          description="Gestor de disparos multicanal: Push Web/Mobile e E-mails transacionais com segmentação de público e prioridade."
          count={totalCount}
        />
      </div>

      {loading && totalCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          pushNotifications={moduleData.pushNotifications}
          emailNotifications={moduleData.emailNotifications}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllNotificationData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default NotificationsSpaPage;

