import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  message
} from 'antd';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const TabModal = ({
  open,
  currentUser,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        tab_number: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        table_number: '01'
      });
    }
  }, [open, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        tab_number: values.tab_number,
        table_number: values.table_number,
        customer_name: values.customer_name || 'Mesa / Balcão',
        customer_phone: values.customer_phone || null,
        status: 'open',
        notes: values.notes || null,
        opened_by_user_id: currentUser?.id || null
      };

      const res = await apiRequest('/restaurant_tabs', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        message.success('Comanda aberta com sucesso!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao abrir comanda');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Modal
      title="Abrir Nova Mesa / Comanda"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Abrir Comanda"
      cancelText="Cancelar"
      width={520}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="table_number"
              label="Número da Mesa"
              rules={[{ required: true, message: 'Informe a mesa' }]}
            >
              <Input placeholder="Ex: Mesa 04 / Balcão" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="tab_number"
              label="Número da Comanda"
              rules={[{ required: true, message: 'Informe o número da comanda' }]}
            >
              <Input placeholder="CMD-1234" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={14}>
            <Form.Item name="customer_name" label="Nome do Cliente / Responsável">
              <Input placeholder="Ex: Leonardo Miranda" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="customer_phone" label="WhatsApp / Telefone">
              <Input placeholder="(11) 98888-0000" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Observações Iniciais">
          <TextArea rows={2} placeholder="Ex: Comemoração de aniversário, sentar na varanda..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
