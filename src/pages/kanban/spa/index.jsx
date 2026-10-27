import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const KanbanSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Kanban') && !hasAccess('kanban_boards')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Kanban."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    boards: [],
    columns: [],
    tasks: [],
    members: [],
    attachments: []
  });
  const [loading, setLoading] = useState(false);

  const fetchAllKanbanData = async () => {
    setLoading(true);
    try {
      const [boardsRes, colsRes, tasksRes, membersRes, attsRes] = await Promise.all([
        apiRequest('/kanban_boards'),
        apiRequest('/kanban_board_columns'),
        apiRequest('/kanban_tasks'),
        apiRequest('/kanban_board_members'),
        apiRequest('/kanban_tasks_attachments')
      ]);

      setModuleData({
        boards: boardsRes.ok && Array.isArray(boardsRes.data) ? boardsRes.data : [],
        columns: colsRes.ok && Array.isArray(colsRes.data) ? colsRes.data : [],
        tasks: tasksRes.ok && Array.isArray(tasksRes.data) ? tasksRes.data : [],
        members: membersRes.ok && Array.isArray(membersRes.data) ? membersRes.data : [],
        attachments: attsRes.ok && Array.isArray(attsRes.data) ? attsRes.data : []
      });
    } catch {
      message.error('Erro ao carregar dados do Kanban');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllKanbanData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <AppletHeader
          tag="Kanban"
          title="Kanban Workspace"
          description="Gestão visual de fluxos de trabalho, etapas personalizadas e cartões de tarefas."
          count={moduleData.tasks.length}
        />
      </div>

      {loading && moduleData.boards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
            Carregando Kanban...
          </div>
        </div>
      ) : (
        <MainAppView
          data={moduleData}
          onRefresh={fetchAllKanbanData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default KanbanSpaPage;
