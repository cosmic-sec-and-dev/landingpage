import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message
} from 'antd';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const AgentModal = ({
  open,
  record,
  users = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          user_id: record.user_id,
          license_number: record.license_number,
          phone: record.phone,
          bio: record.bio,
          is_active: record.is_active ?? true
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          is_active: true
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        user_id: values.user_id,
        license_number: values.license_number,
        phone: values.phone,
        bio: values.bio,
        is_active: values.is_active
      };

      let res;
      if (record) {
        res = await apiRequest(`/agents?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/agents', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(record ? 'Corretor atualizado com sucesso!' : 'Corretor cadastrado com sucesso!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar corretor');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Corretor' : 'Cadastrar Novo Corretor'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar Corretor"
      cancelText="Cancelar"
      width={560}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="user_id"
          label="Usuário Vinculado"
          rules={[{ required: true, message: 'Selecione o usuário' }]}
        >
          <Select placeholder="Selecione o usuário da plataforma">
            {users.map(u => (
              <Select.Option key={u.id} value={u.id}>
                {u.full_name || u.email}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="license_number"
          label="Número do Registro Profissional (CRECI)"
          rules={[{ required: true, message: 'Informe o número do CRECI' }]}
        >
          <Input placeholder="Ex: CRECI-SP 123456-F" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Telefone / WhatsApp Comercial"
          rules={[{ required: true, message: 'Informe o telefone' }]}
        >
          <Input placeholder="Ex: (11) 98888-7777" />
        </Form.Item>

        <Form.Item name="bio" label="Biografia / Especialidade">
          <TextArea rows={3} placeholder="Especialista em imóveis de alto padrão, lançamentos..." />
        </Form.Item>

        <Form.Item name="is_active" label="Status Ativo" valuePropName="checked">
          <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
