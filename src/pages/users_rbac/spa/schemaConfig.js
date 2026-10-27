export const MODULE_TAG = 'Users & RBAC';

export const ENDPOINTS = [
  {
    path: '/users',
    label: 'Usuários do Tenant',
    description: 'Gestão de contas de usuários, credenciais de acesso, perfis e status ativo.',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false, readonly: true },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: false },
      { name: 'email', type: 'string', format: 'email', required: true },
      { name: 'username', type: 'string', format: '', required: false },
      { name: 'full_name', type: 'string', format: '', required: true },
      { name: 'role', type: 'string', format: 'select', options: ['superadmin', 'admin', 'manager', 'editor', 'staff', 'viewer'], required: true },
      { name: 'is_active', type: 'boolean', format: 'boolean', required: false, default: true },
      { name: 'created_at', type: 'string', format: 'date-time', required: false, readonly: true }
    ]
  },
  {
    path: '/roles',
    label: 'Papéis & Funções (Roles)',
    description: 'Definição de perfis de acesso e hierarquias de permissão dentro da organização.',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false, readonly: true },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'name', type: 'string', format: '', required: true },
      { name: 'slug', type: 'string', format: '', required: true },
      { name: 'description', type: 'string', format: 'textarea', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false, readonly: true }
    ]
  },
  {
    path: '/permissions',
    label: 'Catálogo de Permissões',
    description: 'Regras de acesso e autorização por subdomínio e ações (create, read, update, delete, execute).',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false, readonly: true },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'subdomain', type: 'string', format: '', required: true },
      { name: 'action', type: 'string', format: '', required: true },
      { name: 'description', type: 'string', format: 'textarea', required: false },
      { name: 'created_at', type: 'string', format: 'date-time', required: false, readonly: true }
    ]
  },
  {
    path: '/user_permissions',
    label: 'Permissões Atribuídas',
    description: 'Vínculos granulares de concessão e revogação de permissões para usuários específicos.',
    fields: [
      { name: 'id', type: 'string', format: 'uuid', required: false, readonly: true },
      { name: 'tenant_id', type: 'string', format: 'uuid', required: true },
      { name: 'user_id', type: 'string', format: 'uuid', required: true },
      { name: 'permission_id', type: 'string', format: 'uuid', required: true },
      { name: 'is_granted', type: 'boolean', format: 'boolean', required: false, default: true },
      { name: 'created_at', type: 'string', format: 'date-time', required: false, readonly: true }
    ]
  }
];
