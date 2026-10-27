import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, message } from 'antd';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';
import { apiRequest } from '../../../../services/api';
import { POST_PRIORITIES, POST_STATUSES } from '../schemaConfig';

const { TextArea } = Input;

export const AnnouncementModal = ({
  visible,
  onClose,
  onSuccess,
  initialValues,
  channels = [],
  currentUser
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({
          channel_id: channels[0]?.id || null,
          priority_level: 'routine',
          status: 'published',
          is_pinned: false
        });
      }
    }
  }, [visible, initialValues, channels, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        channel_id: values.channel_id,
        author_id: currentUser?.id,
        title: values.title,
        summary: values.summary,
        content_rich_text: values.content_rich_text,
        priority_level: values.priority_level || 'routine',
        status: values.status || 'published',
        is_pinned: values.is_pinned ?? false,
        published_at: values.status === 'published' ? new Date().toISOString() : null
      };

      let res;
      if (isEditing) {
        res = await apiRequest(`/collaboration_posts?id=eq.${initialValues.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/collaboration_posts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(isEditing ? 'Comunicado atualizado com sucesso!' : 'Comunicado publicado com sucesso!');
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        message.error(res.error || 'Falha ao salvar comunicado');
      }
    } catch {
      // Form validation error
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Comunicado Institucional' : 'Novo Comunicado da Empresa / Mural'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEditing ? 'Salvar Alterações' : 'Publicar Comunicado'}
      cancelText="Cancelar"
      width={750}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="title"
              label="Título do Comunicado"
              rules={[{ required: true, message: 'Informe o título do comunicado' }]}
            >
              <Input placeholder="Ex: Resultado do Trimestre, Nova Política de Férias, Lançamento v2.0..." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="channel_id"
              label="Canal Institucional"
              rules={[{ required: true, message: 'Selecione o canal' }]}
            >
              <Select
                options={channels.map(c => ({
                  value: c.id,
                  label: `# ${c.name}`
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="summary" label="Resumo Executivo (1 a 2 frases)">
          <Input placeholder="Breve introdução exibida no feed principal..." />
        </Form.Item>

        <Form.Item
          name="content_rich_text"
          label="Conteúdo Completo do Comunicado"
          rules={[{ required: true, message: 'Digite o conteúdo completo' }]}
        >
          <UniversalRichEditor
            variant="compact"
            minHeight={180}
            placeholder="Digite as diretrizes, detalhes, cronogramas e informações institucionais..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="priority_level" label="Nível de Prioridade">
              <Select
                options={Object.entries(POST_PRIORITIES).map(([val, conf]) => ({
                  value: val,
                  label: conf.label
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status da Publicação">
              <Select
                options={Object.entries(POST_STATUSES).map(([val, conf]) => ({
                  value: val,
                  label: conf.label
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="is_pinned" label="Fixar no Mural Geral" valuePropName="checked">
              <Switch checkedChildren="Fixado" unCheckedChildren="Normal" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
