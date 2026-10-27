import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  message
} from 'antd';
import { CrownOutlined, SaveOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const PlanEditorModal = ({
  visible,
  record,
  onClose,
  onSaved
}) => {
  const [form] = Form.useForm();
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          name: record.name || '',
          description: record.description || ''
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
      name: values.name,
      description: values.description || null,
      is_active: isActive
    };

    try {
      if (!record) {
        const res = await apiRequest('/plans', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Plano criado com sucesso!');
          onSaved();
        } else {
          message.error(res.data?.message || 'Falha ao criar plano');
        }
      } else {
        const res = await apiRequest(`/plans?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Plano atualizado com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao atualizar plano');
        }
      }
    } catch {
      message.error('Erro de conexão ao salvar plano');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={record ? `Editar Plano: ${record.name}` : 'Criar Novo Plano de Assinatura'}
      open={visible}
      onCancel={onClose}
      width={560}
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
          {record ? 'Salvar Alterações' : 'Criar Plano'}
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
          label="Nome do Plano"
          name="name"
          rules={[{ required: true, message: 'Informe o nome do plano' }]}
        >
          <Input placeholder="Ex: Enterprise Growth, Professional, Starter" />
        </Form.Item>

        <Form.Item label="Descrição & Recursos Inclusos" name="description">
          <TextArea
            rows={4}
            placeholder="Descreva os applets liberados, limites e benefícios deste plano..."
          />
        </Form.Item>

        <Form.Item label="Plano Disponível para Venda">
          <Switch
            checked={isActive}
            onChange={setIsActive}
            checkedChildren="Ativo"
            unCheckedChildren="Desativado"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
