import React from 'react';
import { Modal, Form, Input, Space, Button } from 'antd';

export const SearchModal = ({ open, onCancel, onApply, fields = [] }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    // Remove empty values
    const cleaned = Object.fromEntries(Object.entries(values).filter(([_, v]) => v !== undefined && v !== ''));
    onApply(cleaned);
    onCancel();
  };

  return (
    <Modal
      title="Filtro Avançado"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {fields.map(field => (
          <Form.Item key={field.name} label={field.name.replace(/_/g, ' ').toUpperCase()} name={field.name}>
            <Input placeholder={`Filtrar por ${field.name}...`} allowClear />
          </Form.Item>
        ))}
        <Form.Item style={{ textAlign: 'right', marginTop: '20px', marginBottom: 0 }}>
          <Space>
            <Button onClick={() => form.resetFields()}>Limpar</Button>
            <Button type="primary" htmlType="submit">Aplicar Filtros</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
