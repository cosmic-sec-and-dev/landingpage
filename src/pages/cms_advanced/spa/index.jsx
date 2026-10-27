import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const CmsAdvancedSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('CMS Advanced') && !hasAccess('pages') && !hasAccess('cms_advanced')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet CMS Advanced."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    pages: [],
    attachments: [],
    sidebars: [],
    themes: [],
    themeAttachments: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllCmsData = async () => {
    setLoading(true);
    try {
      const [pagesRes, attsRes, sidebarsRes, themesRes, tAttsRes, meRes] = await Promise.all([
        apiRequest('/pages?order=created_at.desc'),
        apiRequest('/pages_attachments'),
        apiRequest('/blogger_sidebars'),
        apiRequest('/blogger_themes'),
        apiRequest('/blogger_themes_attachments'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        pages: pagesRes.ok && Array.isArray(pagesRes.data) ? pagesRes.data : [],
        attachments: attsRes.ok && Array.isArray(attsRes.data) ? attsRes.data : [],
        sidebars: sidebarsRes.ok && Array.isArray(sidebarsRes.data) ? sidebarsRes.data : [],
        themes: themesRes.ok && Array.isArray(themesRes.data) ? themesRes.data : [],
        themeAttachments: tAttsRes.ok && Array.isArray(tAttsRes.data) ? tAttsRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do CMS Advanced');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCmsData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="CMS Advanced"
          title="Gestão Editorial & Layouts Web"
          description="Editor de conteúdo, publicação de artigos, gestão de temas CSS/JS e widgets de barras laterais."
          count={moduleData.pages.length}
        />
      </div>

      {loading && moduleData.pages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          pages={moduleData.pages}
          attachments={moduleData.attachments}
          sidebars={moduleData.sidebars}
          themes={moduleData.themes}
          themeAttachments={moduleData.themeAttachments}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllCmsData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default CmsAdvancedSpaPage;
