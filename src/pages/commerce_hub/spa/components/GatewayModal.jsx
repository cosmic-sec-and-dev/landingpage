import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

export const GatewayModal = ({ open, record, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const isEditing = Boolean(record?.id);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (record) {
        form.setFieldsValue({
          name: record.name,
          provider_type: record.provider_type || 'tef_local',
          is_test_mode: record.is_test_mode ?? false,
          is_active: record.is_active ?? true
        });
      } else {
        form.setFieldsValue({
          provider_type: 'tef_local',
          is_test_mode: false,
          is_active: true
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        name: values.name?.trim(),
        provider_type: values.provider_type,
        is_test_mode: values.is_test_mode,
        is_active: values.is_active,
        config_json: {}
      };

      if (isEditing) {
        const res = await apiRequest(`/commerce_payment_gateways?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          message.error(res.data?.message || 'Erro ao atualizar provedor de pagamento');
          return;
        }
        message.success('Provedor atualizado com sucesso!');
      } else {
        const res = await apiRequest('/commerce_payment_gateways', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          message.error(res.data?.message || 'Erro ao cadastrar provedor');
          return;
        }
        message.success('Provedor cadastrado com sucesso no Hub!');
      }

      onSuccess();
      onCancel();
    } catch {
      message.error('Erro de comunicação com o servidor');
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCardOutlined style={{ color: '#0284c7' }} />
          <span>{isEditing ? 'Editar Provedor de Pagamento' : 'Novo Provedor / Terminal de Pagamento'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEditing ? 'Salvar Alterações' : 'Cadastrar Provedor'}
      cancelText="Cancelar"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="Nome do Terminal / Provedor"
          rules={[{ required: true, message: 'Informe o nome do provedor (ex: Stone PinPad Balcão)' }]}
        >
          <Input placeholder="Ex: Stone PinPad Balcão 01, Stripe E-commerce, TEF Linx" />
        </Form.Item>

        <Form.Item
          name="provider_type"
          label="Tipo de Provedor / Tecnologia"
          rules={[{ required: true, message: 'Selecione o tipo' }]}
        >
          <Select
            options={[
              { value: 'tef_local', label: '💳 TEF Local (PinPad / SiTef / D-TEF)' },
              { value: 'stone_pinpad', label: '🟢 Stone / PagBank PinPad' },
              { value: 'pix_direct', label: '⚡ Pix Dinâmico Banco Central' },
              { value: 'stripe', label: '🌍 Stripe Gateway (Online / Checkout)' },
              { value: 'mercadopago', label: '🔵 Mercado Pago Gateway' },
              { value: 'cash_drawer', label: '💵 Gaveta de Dinheiro / Caixa Físico' }
            ]}
          />
        </Form.Item>

        <Form.Item name="is_test_mode" label="Modo Homologação / Teste (Sandbox)" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="is_active" label="Status do Terminal (Ativo)" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
