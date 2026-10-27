import React from 'react';
import { Modal, Form, Input, Switch, InputNumber, Space, Button, Row, Col, message } from 'antd';
import { TusUpload } from '../upload/TusUpload';

const isLongTextField = (fieldName) => {
  const lower = (fieldName || '').toLowerCase();
  return (
    lower.includes('bio') ||
    lower.includes('desc') ||
    lower.includes('note') ||
    lower.includes('address') ||
    lower.includes('content') ||
    lower.includes('body') ||
    lower.includes('message') ||
    lower.includes('summary') ||
    lower.includes('sql') ||
    lower.includes('prompt') ||
    lower.includes('comment') ||
    lower.includes('details')
  );
};

const isFileField = (fieldName) => {
  const lower = (fieldName || '').toLowerCase();
  return (
    lower.includes('avatar') ||
    lower.includes('banner') ||
    lower.includes('image') ||
    lower.includes('photo') ||
    lower.includes('logo') ||
    lower.includes('icon') ||
    lower.includes('cover') ||
    lower.includes('thumbnail') ||
    lower.includes('attachment') ||
    lower.includes('document') ||
    lower.includes('file_url') ||
    (lower.endsWith('_url') && !lower.includes('website') && !lower.includes('link'))
  );
};

export const AddModal = ({ open, onCancel, onSubmit, fields = [], title = "Adicionar Registro" }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
    message.success('Registro adicionado com sucesso!');
    form.resetFields();
    onCancel();
  };

  // Excluir campos gerados automaticamente pelo sistema (mantendo tenant_id para subscriptions/tenants)
  const isSubscriptionsOrTenants = (title || '').toLowerCase().includes('subscription') || (title || '').toLowerCase().includes('tenant');
  const creatableFields = fields.filter(f => {
    if (['id', 'created_at', 'updated_at'].includes(f.name)) return false;
    if (f.name === 'tenant_id' && !isSubscriptionsOrTenants) return false;
    return true;
  });

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={780}
      style={{ maxWidth: '95vw' }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={[16, 0]}>
          {creatableFields.map(field => {
            const label = field.name.replace(/_/g, ' ').toUpperCase();
            const rules = [{ required: field.required, message: `${label} é obrigatório!` }];

            if (field.type === 'boolean') {
              return (
                <Col xs={24} sm={12} key={field.name}>
                  <Form.Item label={label} name={field.name} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              );
            }

            if (field.type === 'integer' || field.type === 'number') {
              return (
                <Col xs={24} sm={12} key={field.name}>
                  <Form.Item label={label} name={field.name} rules={rules}>
                    <InputNumber style={{ width: '100%' }} placeholder={field.example || '0'} />
                  </Form.Item>
                </Col>
              );
            }

            if (field.format === 'password') {
              return (
                <Col xs={24} sm={12} key={field.name}>
                  <Form.Item label={label} name={field.name} rules={rules}>
                    <Input.Password placeholder="Digite a senha..." />
                  </Form.Item>
                </Col>
              );
            }

            if (isFileField(field.name)) {
              return (
                <Col span={24} key={field.name}>
                  <Form.Item label={label} name={field.name} rules={rules}>
                    <TusUpload placeholder={field.example || `Selecione arquivo ou digite a URL para ${label.toLowerCase()}...`} />
                  </Form.Item>
                </Col>
              );
            }

            if (isLongTextField(field.name)) {
              return (
                <Col span={24} key={field.name}>
                  <Form.Item label={label} name={field.name} rules={rules}>
                    <Input.TextArea
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      placeholder={field.example || `Digite ${label.toLowerCase()}...`}
                    />
                  </Form.Item>
                </Col>
              );
            }

            return (
              <Col xs={24} sm={12} key={field.name}>
                <Form.Item label={label} name={field.name} rules={rules}>
                  <Input placeholder={field.example || `Digite ${label.toLowerCase()}...`} />
                </Form.Item>
              </Col>
            );
          })}
        </Row>

        <Form.Item style={{ textAlign: 'right', marginTop: '20px', marginBottom: 0 }}>
          <Space>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit">Salvar Registro</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
