import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { TeamOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const CreateGroupModal = ({ open, onCancel, onSuccess, currentUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let ownerId = currentUser?.id;
      if (!ownerId) {
        const meRes = await apiRequest('/me');
        const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
        ownerId = meData?.id;
      }

      const slug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const groupPayload = {
        owner_id: ownerId,
        name: values.name.trim(),
        slug: slug || `group-${Date.now()}`,
        description: values.description?.trim() || '',
        privacy_type: values.privacy_type || 'public',
        members_count: 1
      };

      const res = await apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify(groupPayload)
      });

      if (res.ok) {
        message.success('Grupo criado com sucesso!');
        form.resetFields();
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        message.error(res.data?.message || 'Falha ao criar grupo');
      }
    } catch {
      message.error('Verifique os campos obrigatórios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined style={{ color: '#c026d3' }} />
          <span>Criar Nova Comunidade / Grupo</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Criar Comunidade"
      cancelText="Cancelar"
      destroyOnHidden
      centered
      width={540}
    >
      <Form form={form} layout="vertical" initialValues={{ privacy_type: 'public' }} style={{ marginTop: '16px' }}>
        <Form.Item
          name="name"
          label="Nome da Comunidade"
          rules={[{ required: true, message: 'Por favor, insira o nome do grupo' }]}
        >
          <Input placeholder="ex: Engenharia & Inovação, RH & Cultura..." />
        </Form.Item>

        <Form.Item
          name="privacy_type"
          label="Visibilidade & Acesso"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: 'public', label: '🌐 Pública (Qualquer membro pode visualizar e participar)' },
              { value: 'private', label: '🔒 Privada (Apenas membros aprovados)' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição e Propósito"
        >
          <TextArea
            placeholder="Descreva os objetivos, diretrizes e temas abordados nesta comunidade..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
