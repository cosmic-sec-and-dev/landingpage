import React from 'react';
import { Row, Col, Card, Statistic, Progress } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { KanbanBoardView } from '../components/KanbanBoardView';

export const MainAppView = ({ data = {}, onRefresh, loading }) => {
  const { isDark } = useAppTheme();

  const boards = Array.isArray(data.boards) ? data.boards : [];
  const columns = Array.isArray(data.columns) ? data.columns : [];
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && !t.is_completed).length;

  const statCardStyle = {
    background: isDark ? 'rgba(26, 35, 56, 0.75)' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
  };

  return (
    <div>
      {/* Top Metrics Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={12} sm={6} lg={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Quadros Ativos"
              value={boards.length}
              prefix={<ProjectOutlined style={{ color: '#38bdf8' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Tarefas em Andamento"
              value={pendingTasks}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Tarefas Concluídas"
              value={completedTasks}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
              suffix={<span style={{ fontSize: '12px', color: '#10b981' }}>({completionRate}%)</span>}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Tarefas Urgentes"
              value={urgentTasks}
              prefix={<FireOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Kanban Board Interactive Workspace */}
      <KanbanBoardView
        boards={boards}
        columns={columns}
        tasks={tasks}
        onRefresh={onRefresh}
        loading={loading}
      />
    </div>
  );
};
