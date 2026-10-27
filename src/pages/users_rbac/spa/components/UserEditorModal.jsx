import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Option } = Select;

export const UserEditorModal = ({
  open,
  user,
  roles = [],
  onCancel,
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (user) {
        form.setFieldsValue({
          full_name: user.full_name || '',
          email: user.email || '',
          username: user.username || '',
          role: user.role || 'viewer',
          is_active: user.is_active !== false
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          role: 'editor',
          is_active: true
        });
      }
    }
  }, [open, user, form]);

  const handleFinish = (values) => {
    onSubmit({
      ...values,
      is_active: !!values.is_active
    });
  };

  return (
    <Modal
      title={user ? 'Editar Usuário' : 'Novo Usuário do Tenant'}
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
              rules={[{ required: true, message: 'Selecione um papel' }]}
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
                    <Option value="admin">Admin</Option>
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
