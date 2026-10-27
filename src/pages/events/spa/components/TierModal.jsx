import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  message
} from 'antd';
import { apiRequest } from '../../../../services/api';

export const TierModal = ({
  open,
  record,
  events = [],
  defaultEventId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          event_id: record.event_id,
          name: record.name,
          price: record.price,
          total_quantity: record.total_quantity,
          available_quantity: record.available_quantity,
          is_active: record.is_active ?? true
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          event_id: defaultEventId || (events[0] ? events[0].id : undefined),
          price: 0,
          total_quantity: 100,
          available_quantity: 100,
          is_active: true
        });
      }
    }
  }, [open, record, defaultEventId, events, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        event_id: values.event_id,
        name: values.name,
        price: values.price,
        total_quantity: values.total_quantity,
        available_quantity: values.available_quantity !== undefined ? values.available_quantity : values.total_quantity,
        is_active: values.is_active
      };

      let res;
      if (record) {
        res = await apiRequest(`/event_tiers?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/event_tiers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(record ? 'Lote atualizado com sucesso!' : 'Lote de ingressos criado!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar lote de ingressos');
      }
    } catch {
      message.error('Erro de conexão ao salvar');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Lote de Ingressos' : 'Novo Lote / Categoria de Ingressos'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar Lote"
      cancelText="Cancelar"
      width={560}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="event_id"
          label="Evento Correspondente"
          rules={[{ required: true, message: 'Selecione o evento' }]}
        >
          <Select placeholder="Selecione o evento">
            {events.map(ev => (
              <Select.Option key={ev.id} value={ev.id}>
                {ev.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Nome do Lote"
          rules={[{ required: true, message: 'Ex: 1º Lote - Meia Entrada / VIP / Pista' }]}
        >
          <Input placeholder="Ex: 1º Lote Geral / VIP Pass / Inteira" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Preço do Ingresso (R$)"
              rules={[{ required: true, message: 'Informe o valor' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                prefix="R$"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="total_quantity"
              label="Capacidade / Quantidade Total"
              rules={[{ required: true, message: 'Informe a quantidade' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="is_active" label="Lote Disponível para Venda" valuePropName="checked">
          <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
