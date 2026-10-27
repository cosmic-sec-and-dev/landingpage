import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Switch, Typography, Space, Spin, message, Card } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { Title, Text } = Typography;

export const RolePermissionsMatrixModal = ({
  open,
  user,
  onClose,
  tenantId
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [permRes, uPermRes] = await Promise.all([
        apiRequest('/permissions'),
        user ? apiRequest(`/user_permissions?user_id=eq.${user.id}`) : Promise.resolve({ ok: true, data: [] })
      ]);

      if (permRes.ok && Array.isArray(permRes.data)) {
        setPermissions(permRes.data);
      }
      if (uPermRes.ok && Array.isArray(uPermRes.data)) {
        setUserPermissions(uPermRes.data);
      }
    } catch (err) {
      console.error(err);
      message.error('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (permission, currentGrant) => {
    setUpdatingId(permission.id);
    try {
      if (currentGrant) {
        // Find existing record and update/delete
        const existing = userPermissions.find(p => p.permission_id === permission.id);
        if (existing) {
          await apiRequest(`/user_permissions?id=eq.${existing.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_granted: false })
          });
        }
      } else {
        const existing = userPermissions.find(p => p.permission_id === permission.id);
        if (existing) {
          await apiRequest(`/user_permissions?id=eq.${existing.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_granted: true })
          });
        } else {
          await apiRequest('/user_permissions', {
            method: 'POST',
            body: JSON.stringify({
              user_id: user.id,
              permission_id: permission.id,
              is_granted: true,
              tenant_id: tenantId || user.tenant_id
            })
          });
        }
      }
      message.success('Permissão atualizada');
      await loadData();
    } catch (err) {
      message.error('Falha ao atualizar permissão');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: 'Subdomínio / Recurso',
      dataIndex: 'subdomain',
      key: 'subdomain',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Ação',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text type="secondary" style={{ fontSize: 13 }}>{text || 'Sem descrição'}</Text>
    },
    ...(user ? [{
      title: 'Concedido',
      key: 'granted',
      width: 120,
      render: (_, record) => {
        const userPerm = userPermissions.find(p => p.permission_id === record.id);
        const isGranted = userPerm ? userPerm.is_granted !== false : false;

        return (
          <Switch
            checked={isGranted}
            loading={updatingId === record.id}
            onChange={() => handleTogglePermission(record, isGranted)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
        );
      }
    }] : [])
  ];

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
          <span>
            {user
              ? `Matriz de Permissões: ${user.full_name || user.email}`
              : 'Catálogo de Permissões RBAC'}
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={750}
      destroyOnHidden
    >
      <div style={{ margin: '16px 0' }}>
        <Text type="secondary">
          {user
            ? `Atribuição granular de privilégios e exceções de acesso para o usuário no Tenant.`
            : `Lista de todos os subdomínios e ações controlados pelo RBAC.`}
        </Text>
      </div>

      <Table
        dataSource={permissions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        size="small"
      />
    </Modal>
  );
};
