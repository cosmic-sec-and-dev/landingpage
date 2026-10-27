import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const JsonBoxSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Json Box') && !hasAccess('json_boxes') && !hasAccess('json_box')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Json Box (/json_boxes)."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    boxes: [],
    attachments: [],
    currentUser: null,
    kpis: { total_boxes: 0, active_boxes: 0, total_attachments: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJsonBoxData = async (page = 1) => {
    setLoading(true);
    const offset = (page - 1) * 50;
    try {
      const [boxesRes, attsRes, kpiRes, meRes] = await Promise.all([
        apiRequest(`/json_boxes?select=id,tenant_id,slug,name,data,metadata,is_active,created_at,updated_at&order=is_active.desc,created_at.desc&limit=50&offset=${offset}`),
        apiRequest('/json_boxes_attachments?order=display_order.asc&limit=50'),
        apiRequest('/rpc/get_json_box_kpis'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      const rawKpi = kpiRes.ok && kpiRes.data ? (Array.isArray(kpiRes.data) ? kpiRes.data[0] : kpiRes.data) : null;
      const boxesList = boxesRes.ok && Array.isArray(boxesRes.data) ? boxesRes.data : [];
      const attsList = attsRes.ok && Array.isArray(attsRes.data) ? attsRes.data : [];

      const kpisData = rawKpi && typeof rawKpi === 'object' && Object.keys(rawKpi).length > 0 ? rawKpi : {
        total_boxes: boxesRes.totalCount ? parseInt(boxesRes.totalCount, 10) : boxesList.length,
        active_boxes: boxesList.filter(b => b.is_active).length,
        total_attachments: attsList.length,
        total_keys: 0
      };

      const count = boxesRes.totalCount ? parseInt(boxesRes.totalCount, 10) : (kpisData.total_boxes || boxesList.length);
      setTotalCount(count);
      setCurrentPage(page);

      setModuleData({
        boxes: boxesRes.ok && Array.isArray(boxesRes.data) ? boxesRes.data : [],
        attachments: attsRes.ok && Array.isArray(attsRes.data) ? attsRes.data : [],
        currentUser: meData,
        kpis: kpisData
      });
    } catch {
      message.error('Erro ao carregar dados do Json Box');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJsonBoxData(1);
  }, []);

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
          tag="Json Box"
          title="Armazenamento de Documentos JSON (NoSQL)"
          description="Datastore flexível de objetos JSON schema-less, feature flags, configurações e payloads REST sob demanda."
          count={moduleData.kpis.total_boxes || totalCount}
        />
      </div>

      {loading && moduleData.boxes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          boxes={moduleData.boxes}
          attachments={moduleData.attachments}
          currentUser={moduleData.currentUser}
          kpis={moduleData.kpis}
          currentPage={currentPage}
          totalCount={totalCount}
          onPageChange={(p) => fetchJsonBoxData(p)}
          onRefresh={() => fetchJsonBoxData(currentPage)}
          loading={loading}
        />
      )}
    </div>
  );
};
export default JsonBoxSpaPage;

