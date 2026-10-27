import React, { useEffect } from 'react';
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

export const EditModal = ({ open, onCancel, onSave, record, fields = [], title = "Editar Registro" }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue(record);
    }
  }, [open, record, form]);

  const handleFinish = (values) => {
    onSave({ ...record, ...values });
    message.success('Registro atualizado com sucesso!');
    onCancel();
  };

  const isSubscriptionsOrTenants = (title || '').toLowerCase().includes('subscription') || (title || '').toLowerCase().includes('tenant');
  const editableFields = fields.filter(f => {
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
          {editableFields.map(field => {
            const label = field.name.replace(/_/g, ' ').toUpperCase();

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
                  <Form.Item label={label} name={field.name}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              );
            }

            if (field.format === 'password') {
              return (
                <Col xs={24} sm={12} key={field.name}>
                  <Form.Item label={label} name={field.name}>
                    <Input.Password placeholder="Nova senha (deixe em branco para manter)..." />
                  </Form.Item>
                </Col>
              );
            }

            if (isFileField(field.name)) {
              return (
                <Col span={24} key={field.name}>
                  <Form.Item label={label} name={field.name}>
                    <TusUpload placeholder={`Upload ou URL para ${label.toLowerCase()}...`} />
                  </Form.Item>
                </Col>
              );
            }

            if (isLongTextField(field.name)) {
              return (
                <Col span={24} key={field.name}>
                  <Form.Item label={label} name={field.name}>
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                  </Form.Item>
                </Col>
              );
            }

            return (
              <Col xs={24} sm={12} key={field.name}>
                <Form.Item label={label} name={field.name}>
                  <Input />
                </Form.Item>
              </Col>
            );
          })}
        </Row>

        <Form.Item style={{ textAlign: 'right', marginTop: '20px', marginBottom: 0 }}>
          <Space>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit">Atualizar</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
