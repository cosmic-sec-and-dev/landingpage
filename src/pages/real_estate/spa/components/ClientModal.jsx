import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  message
} from 'antd';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const ClientModal = ({
  open,
  record,
  agents = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          full_name: record.full_name,
          email: record.email,
          phone: record.phone,
          assigned_agent_id: record.assigned_agent_id,
          budget_min: record.budget_min,
          budget_max: record.budget_max,
          notes: record.notes
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          budget_min: 0,
          budget_max: 1000000
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        full_name: values.full_name,
        email: values.email || null,
        phone: values.phone,
        assigned_agent_id: values.assigned_agent_id || null,
        budget_min: values.budget_min || 0,
        budget_max: values.budget_max || 0,
        notes: values.notes || null
      };

      let res;
      if (record) {
        res = await apiRequest(`/clients?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/clients', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(record ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar cliente');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Cliente' : 'Novo Cliente Interessado'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar Cliente"
      cancelText="Cancelar"
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="full_name"
          label="Nome Completo do Cliente"
          rules={[{ required: true, message: 'Informe o nome' }]}
        >
          <Input placeholder="Ex: Roberto Carlos Silva" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Telefone / WhatsApp"
              rules={[{ required: true, message: 'Informe o telefone' }]}
            >
              <Input placeholder="(11) 99999-8888" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="E-mail">
              <Input placeholder="cliente@email.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="budget_min" label="Orçamento Mínimo (R$)">
              <InputNumber min={0} precision={2} prefix="R$" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="budget_max" label="Orçamento Máximo (R$)">
              <InputNumber min={0} precision={2} prefix="R$" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="assigned_agent_id" label="Corretor Designado">
          <Select placeholder="Designar corretor" allowClear>
            {agents.map(ag => (
              <Select.Option key={ag.id} value={ag.id}>
                CRECI {ag.license_number} ({ag.phone})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Preferências & Observações">
          <TextArea rows={3} placeholder="Prefere bairros centrais, próximo a metrô, imóvel novo..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
