import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, message } from 'antd';
import { apiRequest } from '../../../../services/api';
import { ROOM_TYPES } from '../schemaConfig';

const { TextArea } = Input;

export const ChatRoomModal = ({ visible, onClose, onSuccess, initialValues, users = [] }) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          room_type: initialValues.room_type || 'group'
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          room_type: 'group',
          is_archived: false
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      let res;
      if (isEditing) {
        res = await apiRequest(`/chat_rooms?id=eq.${initialValues.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values)
        });
      } else {
        res = await apiRequest('/chat_rooms', {
          method: 'POST',
          body: JSON.stringify(values)
        });
      }

      if (res.ok) {
        message.success(isEditing ? 'Sala atualizada com sucesso!' : 'Sala de conversa criada com sucesso!');
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        message.error(res.error || 'Falha ao salvar sala de conversa');
      }
    } catch {
      // Form validation error
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Sala de Conversa' : 'Nova Sala / Canal de Chat'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEditing ? 'Salvar Alterações' : 'Criar Sala'}
      cancelText="Cancelar"
      width={650}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Nome da Sala / Canal"
              rules={[{ required: true, message: 'Informe o nome da sala' }]}
            >
              <Input placeholder="Ex: Engenharia & Devs, Marketing Geral, etc." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="room_type"
              label="Tipo de Conversa"
              rules={[{ required: true, message: 'Selecione o tipo' }]}
            >
              <Select options={ROOM_TYPES} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="topic" label="Tópico / Descrição da Sala">
          <TextArea rows={2} placeholder="Ex: Discussões técnicas de arquitetura, deploys e backend..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="slug" label="Slug / Identificador (Opcional)">
              <Input placeholder="ex: dev-team" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_archived" label="Arquivar Sala" valuePropName="checked">
              <Switch checkedChildren="Arquivada" unCheckedChildren="Ativa" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
