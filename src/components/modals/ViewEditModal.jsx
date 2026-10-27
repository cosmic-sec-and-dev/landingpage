import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, InputNumber, Space, Button, message, Descriptions, Tag } from 'antd';

export const ViewEditModal = ({ open, mode = 'view', onCancel, onSave, record, fields = [] }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && mode === 'edit' && record) {
      form.setFieldsValue(record);
    }
  }, [open, mode, record, form]);

  const handleFinish = (values) => {
    onSave({ ...record, ...values });
    message.success('Registro atualizado com sucesso!');
    onCancel();
  };

  if (!record) return null;

  return (
    <Modal
      title={mode === 'view' ? 'Detalhes do Registro' : 'Editar Registro'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={mode === 'view' ? 640 : 520}
      destroyOnHidden
    >
      {mode === 'view' ? (
        <Descriptions bordered column={1} size="small">
          {Object.entries(record).map(([key, val]) => (
            <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
              {val === null || val === undefined ? '-' : (
                typeof val === 'boolean' ? <Tag color={val ? 'green' : 'red'}>{val ? 'Sim' : 'Não'}</Tag> :
                typeof val === 'object' ? <pre style={{ margin: 0, fontSize: '11px' }}>{JSON.stringify(val, null, 2)}</pre> :
                String(val)
              )}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {fields.filter(f => !['id', 'created_at', 'updated_at', 'tenant_id'].includes(f.name)).map(field => {
            const label = field.name.replace(/_/g, ' ').toUpperCase();
            if (field.type === 'boolean') {
              return (
                <Form.Item key={field.name} label={label} name={field.name} valuePropName="checked">
                  <Switch />
                </Form.Item>
              );
            }
            return (
              <Form.Item key={field.name} label={label} name={field.name}>
                <Input />
              </Form.Item>
            );
          })}
          <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
            <Space>
              <Button onClick={onCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit">Atualizar</Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
