import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, Alert, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, SafetyCertificateOutlined, BankOutlined, CrownOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

export const UserEditorModal = ({
  open,
  user,
  roles = [],
  tenants = [],
  users = [],
  isSuperadmin = false,
  onCancel,
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  useEffect(() => {
    if (open) {
      if (user) {
        setSelectedTenantId(user.tenant_id || null);
        form.setFieldsValue({
          tenant_id: user.tenant_id || undefined,
          full_name: user.full_name || '',
          email: user.email || '',
          username: user.username || '',
          role: user.role || 'viewer',
          is_active: user.is_active !== false
        });
      } else {
        form.resetFields();
        setSelectedTenantId(null);
        form.setFieldsValue({
          role: 'editor',
          is_active: true
        });
      }
    }
  }, [open, user, form]);

  const handleTenantChange = (tenantId) => {
    setSelectedTenantId(tenantId);
    const hasAdmin = users.some(u => u.tenant_id === tenantId && u.role?.toLowerCase() === 'admin');
    if (!hasAdmin) {
      form.setFieldsValue({ role: 'admin' });
    } else {
      if (form.getFieldValue('role') === 'admin') {
        form.setFieldsValue({ role: 'editor' });
      }
    }
  };

  const handleFinish = (values) => {
    onSubmit({
      ...values,
      is_active: !!values.is_active
    });
  };

  const tenantAdminExists = selectedTenantId
    ? users.some(u => u.tenant_id === selectedTenantId && u.role?.toLowerCase() === 'admin')
    : false;

  const isCreating = !user;

  return (
    <Modal
      title={
        user ? (
          'Editar Usuário'
        ) : isSuperadmin ? (
          <Space>
            <CrownOutlined style={{ color: '#f59e0b' }} />
            <span>Novo Usuário / Admin Primordial do Tenant</span>
          </Space>
        ) : (
          'Novo Usuário do Tenant'
        )
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={user ? 'Salvar Alterações' : 'Criar Usuário'}
      cancelText="Cancelar"
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 16 }}
      >
        {isCreating && isSuperadmin && (
          <>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="tenant_id"
                  label="Organização (Tenant)"
                  rules={[{ required: true, message: 'Selecione a organização para vincular este usuário' }]}
                  extra="Como superuser, selecione o tenant destino para cadastrar o usuário ou seu admin primordial."
                >
                  <Select
                    placeholder="Selecione o tenant..."
                    showSearch
                    optionFilterProp="label"
                    onChange={handleTenantChange}
                    suffixIcon={<BankOutlined />}
                    options={tenants.map(t => {
                      const hasAdmin = users.some(u => u.tenant_id === t.id && u.role?.toLowerCase() === 'admin');
                      return {
                        label: `${t.name} (/${t.slug || t.id.slice(0, 8)}) - ${hasAdmin ? '⚠️ Já possui Admin' : '⭐ Sem Admin (Requer Primordial)'}`,
                        value: t.id
                      };
                    })}
                  />
                </Form.Item>
              </Col>
            </Row>

            {selectedTenantId && !tenantAdminExists && (
              <Alert
                message="Configuração de Administrador Primordial"
                description="Este tenant não possui nenhum usuário administrador. Este cadastro criará o administrador primordial da organização."
                type="info"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}

            {selectedTenantId && tenantAdminExists && (
              <Alert
                message="Tenant já possui Administrador Primordial"
                description="Esta organização já possui um usuário com papel 'admin'. Conforme a regra de primordialidade, apenas um admin é permitido por tenant."
                type="warning"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}
          </>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="full_name"
              label="Nome Completo"
              rules={[{ required: true, message: 'Informe o nome completo' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ex: João da Silva" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                { required: true, message: 'Informe o e-mail' },
                { type: 'email', message: 'E-mail inválido' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="exemplo@empresa.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Nome de Usuário (Username)"
            >
              <Input placeholder="joao.silva" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="role"
              label="Papel / Perfil de Acesso"
              rules={[
                { required: true, message: 'Selecione um papel' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value === 'admin' && isSuperadmin && isCreating) {
                      const tId = getFieldValue('tenant_id');
                      if (tId && users.some(u => u.tenant_id === tId && u.role?.toLowerCase() === 'admin')) {
                        return Promise.reject(
                          new Error('Este tenant já possui um administrador primordial cadastrado. Selecione outro papel para o usuário.')
                        );
                      }
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Select placeholder="Selecione o papel" suffixIcon={<SafetyCertificateOutlined />}>
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <Option key={r.slug || r.name} value={r.slug || r.name}>
                      {r.name} ({r.slug || r.name})
                    </Option>
                  ))
                ) : (
                  <>
                    <Option value="superadmin">Superadmin</Option>
                    <Option value="admin">Admin (Primordial do Tenant)</Option>
                    <Option value="manager">Manager (Gerente)</Option>
                    <Option value="editor">Editor</Option>
                    <Option value="staff">Staff</Option>
                    <Option value="viewer">Viewer (Leitor)</Option>
                  </>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="is_active"
              label="Status de Acesso"
              valuePropName="checked"
            >
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>
          </Col>
        </Row>

        {!user && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label="Senha Inicial de Acesso"
                rules={[
                  { required: true, message: 'Defina a senha inicial do novo usuário' },
                  { min: 6, message: 'A senha deve conter no mínimo 6 caracteres' }
                ]}
              >
                <Input.Password placeholder="Senha de acesso (mínimo 6 caracteres)" />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};
