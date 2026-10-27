import React, { useState } from 'react';
import { Row, Col, Card, Typography, Input, Button, Tag, Space, Segmented, Empty, Spin, Statistic } from 'antd';
import {
  UserOutlined,
  UserAddOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { UserCard } from '../components/UserCard';

const { Title, Text } = Typography;

export const MainAppView = ({
  users = [],
  roles = [],
  permissions = [],
  userPermissions = [],
  currentUser,
  loading,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  onManagePermissions,
  onOpenRoleMatrix
}) => {
  const { isDark } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter users
  const filteredUsers = users.filter((u) => {
    // Search
    const search = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (u.full_name && u.full_name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.username && u.username.toLowerCase().includes(search));

    if (!matchesSearch) return false;

    // Role filter
    if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter.toLowerCase()) {
      return false;
    }

    // Status filter
    if (statusFilter === 'active' && u.is_active === false) return false;
    if (statusFilter === 'inactive' && u.is_active !== false) return false;

    return true;
  });

  const activeUsersCount = users.filter(u => u.is_active !== false).length;
  const inactiveUsersCount = users.filter(u => u.is_active === false).length;

  const cardStyle = {
    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 2px 12px rgba(0, 0, 0, 0.03)',
    backdropFilter: 'blur(10px)',
    marginBottom: '20px'
  };

  return (
    <div>
      {/* Metric Cards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle} styles={{ body: {padding: '18px 20px'} }}>
            <Statistic
              title={<span style={{ color: '#94a3b8' }}>Total de Usuários</span>}
              value={users.length}
              prefix={<TeamOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle} styles={{ body: {padding: '18px 20px'} }}>
            <Statistic
              title={<span style={{ color: '#94a3b8' }}>Usuários Ativos</span>}
              value={activeUsersCount}
              valueStyle={{ color: '#10b981' }}
              prefix={<CheckCircleOutlined style={{ marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle} styles={{ body: {padding: '18px 20px'} }}>
            <Statistic
              title={<span style={{ color: '#94a3b8' }}>Papéis Configurados</span>}
              value={roles.length || 6}
              prefix={<SafetyCertificateOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle} styles={{ body: {padding: '18px 20px'} }}>
            <Statistic
              title={<span style={{ color: '#94a3b8' }}>Permissões no Catálogo</span>}
              value={permissions.length}
              prefix={<KeyOutlined style={{ color: '#f59e0b', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Control Bar */}
      <Card style={cardStyle} styles={{ body: {padding: '16px 20px'} }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            <Input
              placeholder="Buscar por nome, e-mail ou username..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 320, borderRadius: 8 }}
              allowClear
            />

            <Segmented
              options={[
                { label: 'Todos os Status', value: 'all' },
                { label: `Ativos (${activeUsersCount})`, value: 'active' },
                { label: `Inativos (${inactiveUsersCount})`, value: 'inactive' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />

            <Segmented
              options={[
                { label: 'Todos os Papéis', value: 'all' },
                { label: 'Superadmin', value: 'superadmin' },
                { label: 'Admin', value: 'admin' },
                { label: 'Manager', value: 'manager' },
                { label: 'Editor', value: 'editor' },
                { label: 'Staff', value: 'staff' },
                { label: 'Viewer', value: 'viewer' }
              ]}
              value={roleFilter}
              onChange={setRoleFilter}
            />
          </div>

          <Space size="middle">
            <Button
              icon={<KeyOutlined />}
              onClick={onOpenRoleMatrix}
              style={{ borderRadius: 8 }}
            >
              Matriz RBAC
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={onAddUser}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                border: 'none'
              }}
            >
              Novo Usuário
            </Button>
          </Space>
        </div>
      </Card>

      {/* User Cards Grid */}
      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredUsers.map((user) => (
            <Col key={user.id} xs={24} sm={12} lg={8} xl={6}>
              <UserCard
                user={user}
                onEdit={onEditUser}
                onDelete={onDeleteUser}
                onToggleStatus={onToggleStatus}
                onManagePermissions={onManagePermissions}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Card style={cardStyle} styles={{ body: {padding: '60px', textAlign: 'center'} }}>
          <Empty
            description={
              <span style={{ color: '#94a3b8' }}>
                Nenhum usuário encontrado com os filtros selecionados.
              </span>
            }
          >
            <Button type="primary" icon={<UserAddOutlined />} onClick={onAddUser}>
              Adicionar Primeiro Usuário
            </Button>
          </Empty>
        </Card>
      )}
    </div>
  );
};
