import React, { useState, useEffect } from 'react';
import { Spin, Alert, message, Modal } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MODULE_TAG } from './schemaConfig';
import { MainAppView } from './views/MainAppView';
import { UserEditorModal } from './components/UserEditorModal';
import { RolePermissionsMatrixModal } from './components/RolePermissionsMatrixModal';

export const UsersRbacSpaPage = () => {
  const { hasAccess, isSuperadmin } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Users & RBAC') && !hasAccess('users') && !hasAccess('users_rbac')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Users & RBAC."
        type="warning"
        showIcon
      />
    );
  }

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [userEditorOpen, setUserEditorOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);
  const [matrixTargetUser, setMatrixTargetUser] = useState(null);

  const fetchRbacData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, pRes, upRes, meRes, tRes] = await Promise.all([
        apiRequest('/users?order=created_at.desc'),
        apiRequest('/roles'),
        apiRequest('/permissions'),
        apiRequest('/user_permissions'),
        apiRequest('/me'),
        apiRequest('/tenants?order=name.asc')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setUsers(uRes.ok && Array.isArray(uRes.data) ? uRes.data : []);
      setRoles(rRes.ok && Array.isArray(rRes.data) ? rRes.data : []);
      setPermissions(pRes.ok && Array.isArray(pRes.data) ? pRes.data : []);
      setUserPermissions(upRes.ok && Array.isArray(upRes.data) ? upRes.data : []);
      setCurrentUser(meData);
      setTenants(tRes.ok && Array.isArray(tRes.data) ? tRes.data : []);
    } catch {
      message.error('Erro ao carregar dados do RBAC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRbacData();
  }, []);

  const handleSaveUser = async (values) => {
    setEditorLoading(true);
    try {
      if (selectedUser) {
        const res = await apiRequest(`/users?id=eq.${selectedUser.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(values)
        });
        if (res.ok) {
          message.success('Usuário atualizado com sucesso');
          setUserEditorOpen(false);
          fetchRbacData();
        } else {
          message.error(res.data?.message || 'Falha ao atualizar usuário');
        }
      } else {
        const payload = {
          email: values.email?.trim(),
          password: values.password,
          full_name: values.full_name?.trim(),
          role: values.role || 'member',
          username: values.username?.trim() || null
        };
        if (values.tenant_id) {
          payload.tenant_id = values.tenant_id;
        }

        const res = await apiRequest('/rpc/register_user', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success(
            values.role === 'admin'
              ? 'Administrador primordial criado com sucesso para o tenant!'
              : 'Usuário cadastrado com sucesso'
          );
          setUserEditorOpen(false);
          fetchRbacData();
        } else {
          message.error(res.data?.message || res.error || 'Falha ao criar usuário');
        }
      }
    } catch {
      message.error('Erro de conexão ao salvar usuário');
    } finally {
      setEditorLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.is_active === false ? true : false;
    try {
      const res = await apiRequest(`/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({ is_active: nextStatus })
      });
      if (res.ok) {
        message.success(`Usuário ${nextStatus ? 'ativado' : 'desativado'} com sucesso`);
        fetchRbacData();
      } else {
        message.error('Erro ao alternar status do usuário');
      }
    } catch {
      message.error('Erro ao atualizar status');
    }
  };

  const handleDeleteUser = (user) => {
    Modal.confirm({
      title: `Excluir ${user.full_name || user.email}?`,
      content: 'Esta ação revogará todo o acesso do usuário ao sistema permanentemente.',
      okText: 'Sim, Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const res = await apiRequest(`/users?id=eq.${user.id}`, { method: 'DELETE' });
          if (res.ok) {
            message.success('Usuário excluído');
            fetchRbacData();
          } else {
            message.error('Falha ao excluir usuário');
          }
        } catch {
          message.error('Erro ao excluir usuário');
        }
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag={MODULE_TAG}
          title="Gestão de Usuários & Controle de Acesso (RBAC)"
          description="Administração centralizada de colaboradores, perfis de autorização (roles) e matriz de permissões granulares por organização."
          count={users.length}
        />
      </div>

      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          users={users}
          roles={roles}
          permissions={permissions}
          userPermissions={userPermissions}
          tenants={tenants}
          isSuperadmin={isSuperadmin}
          currentUser={currentUser}
          loading={loading}
          onAddUser={() => {
            setSelectedUser(null);
            setUserEditorOpen(true);
          }}
          onEditUser={(u) => {
            setSelectedUser(u);
            setUserEditorOpen(true);
          }}
          onDeleteUser={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
          onManagePermissions={(u) => {
            setMatrixTargetUser(u);
            setMatrixModalOpen(true);
          }}
          onOpenRoleMatrix={() => {
            setMatrixTargetUser(null);
            setMatrixModalOpen(true);
          }}
        />
      )}

      {/* User Editor Modal */}
      <UserEditorModal
        open={userEditorOpen}
        user={selectedUser}
        roles={roles}
        tenants={tenants}
        users={users}
        isSuperadmin={isSuperadmin}
        onCancel={() => setUserEditorOpen(false)}
        onSubmit={handleSaveUser}
        loading={editorLoading}
      />

      {/* Role & Permissions Matrix Modal */}
      <RolePermissionsMatrixModal
        open={matrixModalOpen}
        user={matrixTargetUser}
        tenantId={currentUser?.tenant_id}
        onClose={() => {
          setMatrixModalOpen(false);
          setMatrixTargetUser(null);
        }}
      />
    </div>
  );
};
export default UsersRbacSpaPage;
