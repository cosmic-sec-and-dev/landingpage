import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Switch,
  Button,
  message
} from 'antd';
import { CrownOutlined, SaveOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

export const SubscriptionAssignmentModal = ({
  visible,
  record,
  plans = [],
  tenants = [],
  onClose,
  onSaved
}) => {
  const [form] = Form.useForm();
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(record?.id);

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          tenant_id: record.tenant_id || undefined,
          plan_id: record.plan_id || undefined
        });
        setIsActive(record.is_active !== false);
      } else {
        form.resetFields();
        setIsActive(true);
      }
    }
  }, [record, visible]);

  const handleFinish = async (values) => {
    setLoading(true);
    const payload = {
      tenant_id: values.tenant_id,
      plan_id: values.plan_id,
      is_active: isActive
    };

    try {
      if (!isEditing) {
        const res = await apiRequest('/subscriptions', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Assinatura vinculada com sucesso!');
          onSaved();
        } else {
          message.error(res.data?.message || 'Falha ao criar assinatura');
        }
      } else {
        const res = await apiRequest(`/subscriptions?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Assinatura atualizada com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao atualizar assinatura');
        }
      }
    } catch {
      message.error('Erro de conexão ao salvar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Assinatura do Tenant' : 'Vincular Plano / Nova Assinatura'}
      open={visible}
      onCancel={onClose}
      width={520}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          {isEditing ? 'Salvar Assinatura' : 'Criar Assinatura'}
        </Button>
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Organização (Tenant)"
          name="tenant_id"
          rules={[{ required: true, message: 'Selecione a organização' }]}
        >
          <Select
            placeholder="Selecione o tenant..."
            showSearch
            optionFilterProp="label"
            options={tenants.map(t => ({
              label: `${t.name} (/${t.slug || t.id.slice(0, 8)})`,
              value: t.id
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Plano de Assinatura"
          name="plan_id"
          rules={[{ required: true, message: 'Selecione o plano' }]}
        >
          <Select
            placeholder="Selecione o plano..."
            options={plans.map(p => ({
              label: `${p.name} ${p.is_active === false ? '(Inativo)' : ''}`,
              value: p.id
            }))}
          />
        </Form.Item>

        <Form.Item label="Status da Assinatura">
          <Switch
            checked={isActive}
            onChange={setIsActive}
            checkedChildren="Ativa"
            unCheckedChildren="Suspensa"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
