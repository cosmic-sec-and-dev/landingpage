import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const NotekeepSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Notekeep') && !hasAccess('notekeep_notes') && !hasAccess('notekeep')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Notekeep."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    notes: [],
    todos: [],
    labels: [],
    noteLabels: [],
    reminders: [],
    attachments: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllNotekeepData = async () => {
    setLoading(true);
    try {
      const [
        notesRes,
        todosRes,
        labelsRes,
        nlRes,
        remRes,
        attsRes,
        meRes
      ] = await Promise.all([
        apiRequest('/notekeep_notes?order=created_at.desc'),
        apiRequest('/notekeep_todos'),
        apiRequest('/notekeep_labels'),
        apiRequest('/notekeep_note_labels'),
        apiRequest('/notekeep_reminders'),
        apiRequest('/notekeep_notes_attachments'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        notes: notesRes.ok && Array.isArray(notesRes.data) ? notesRes.data : [],
        todos: todosRes.ok && Array.isArray(todosRes.data) ? todosRes.data : [],
        labels: labelsRes.ok && Array.isArray(labelsRes.data) ? labelsRes.data : [],
        noteLabels: nlRes.ok && Array.isArray(nlRes.data) ? nlRes.data : [],
        reminders: remRes.ok && Array.isArray(remRes.data) ? remRes.data : [],
        attachments: attsRes.ok && Array.isArray(attsRes.data) ? attsRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do Notekeep');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotekeepData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="Notekeep"
          title="Notas Rápidas & Checklists"
          description="Gestor ágil de notas, listas de tarefas, etiquetas coloridas e lembretes corporativos."
          count={moduleData.notes.length}
        />
      </div>

      {loading && moduleData.notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          notes={moduleData.notes}
          todos={moduleData.todos}
          labels={moduleData.labels}
          noteLabels={moduleData.noteLabels}
          reminders={moduleData.reminders}
          attachments={moduleData.attachments}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllNotekeepData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default NotekeepSpaPage;
