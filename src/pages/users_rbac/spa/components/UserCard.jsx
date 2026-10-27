import React from 'react';
import { Card, Avatar, Tag, Button, Dropdown, Tooltip, Typography, Space } from 'antd';
import {
  UserOutlined,
  KeyOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MailOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ROLE_COLORS = {
  superadmin: 'purple',
  admin: 'red',
  manager: 'gold',
  editor: 'blue',
  staff: 'cyan',
  viewer: 'default'
};

export const UserCard = ({
  user,
  onEdit,
  onDelete,
  onManagePermissions,
  onToggleStatus
}) => {
  const roleColor = ROLE_COLORS[user.role?.toLowerCase()] || 'blue';
  const isActive = user.is_active !== false;

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Editar Usuário',
      onClick: () => onEdit?.(user)
    },
    {
      key: 'permissions',
      icon: <KeyOutlined />,
      label: 'Gerenciar Permissões',
      onClick: () => onManagePermissions?.(user)
    },
    {
      key: 'toggle_status',
      icon: isActive ? <StopOutlined /> : <CheckCircleOutlined />,
      label: isActive ? 'Desativar Acesso' : 'Ativar Acesso',
      onClick: () => onToggleStatus?.(user)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Excluir Usuário',
      danger: true,
      onClick: () => onDelete?.(user)
    }
  ];

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: isActive ? '1px solid #f0f0f0' : '1px dashed #d9d9d9',
        opacity: isActive ? 1 : 0.75
      }}
      styles={{ body: {padding: 20, flex: 1, display: 'flex', flexDirection: 'column'} }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar
            size={48}
            style={{
              backgroundColor: isActive ? '#3b82f6' : '#9ca3af',
              fontSize: 18,
              fontWeight: 600
            }}
          >
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : <UserOutlined />}
          </Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text strong style={{ fontSize: 16 }}>
                {user.full_name || 'Usuário Sem Nome'}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              @{user.username || user.email?.split('@')[0] || 'user'}
            </Text>
          </div>
        </div>

        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" shape="circle" icon={<MoreOutlined />} />
        </Dropdown>
      </div>

      <div style={{ margin: '8px 0', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <MailOutlined style={{ color: '#8c8c8c' }} />
          <Text ellipsis style={{ fontSize: 13, color: '#595959' }}>
            {user.email || '—'}
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          <Tag color={roleColor} icon={<SafetyCertificateOutlined />}>
            {user.role ? user.role.toUpperCase() : 'VIEWER'}
          </Tag>
          <Tag color={isActive ? 'success' : 'error'}>
            {isActive ? 'Ativo' : 'Inativo'}
          </Tag>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: 12,
          marginTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text type="secondary" style={{ fontSize: 11 }}>
          {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Sem data'}
        </Text>
        <Space size="small">
          <Tooltip title="Permissões">
            <Button
              size="small"
              icon={<KeyOutlined />}
              onClick={() => onManagePermissions?.(user)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => onEdit?.(user)}
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
};
