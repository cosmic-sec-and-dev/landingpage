import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const AuditSystemLogsSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Audit & System Logs') && !hasAccess('nt_system_logs') && !hasAccess('audit_system_logs')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet de Auditoria."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    logs: [],
    currentUser: null,
    kpis: { total_logs: 0, error_count: 0, warn_count: 0, info_count: 0, unique_ips_count: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAuditData = async (page = 1) => {
    setLoading(true);
    const offset = (page - 1) * 999;
    try {
      const [logsRes, kpiRes, meRes] = await Promise.all([
        apiRequest(`/nt_system_logs?order=created_at.desc&limit=999&offset=${offset}`),
        apiRequest('/rpc/get_audit_system_logs_kpis'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      const kpisData = kpiRes.ok && kpiRes.data ? kpiRes.data : {
        total_logs: 0,
        error_count: 0,
        warn_count: 0,
        info_count: 0,
        unique_ips_count: 0
      };

      const count = logsRes.totalCount ? parseInt(logsRes.totalCount, 10) : (kpisData.total_logs || 0);
      setTotalCount(count);
      setCurrentPage(page);

      setModuleData({
        logs: logsRes.ok && Array.isArray(logsRes.data) ? logsRes.data : [],
        currentUser: meData,
        kpis: kpisData
      });
    } catch {
      message.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData(1);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="Audit Logs"
          title="Console de Auditoria & Observabilidade"
          description="Rastreamento em tempo real de acessos, eventos de segurança, mutações de dados e telemetria do sistema."
          count={moduleData.kpis.total_logs || totalCount}
        />
      </div>

      {loading && moduleData.logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          logs={moduleData.logs}
          currentUser={moduleData.currentUser}
          kpis={moduleData.kpis}
          currentPage={currentPage}
          totalCount={totalCount}
          onPageChange={(p) => fetchAuditData(p)}
          onRefresh={() => fetchAuditData(currentPage)}
          loading={loading}
        />
      )}
    </div>
  );
};
export default AuditSystemLogsSpaPage;
