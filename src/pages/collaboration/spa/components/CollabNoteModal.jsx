import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, message } from 'antd';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

const NOTE_COLORS = [
  { value: '#FFFFFF', label: 'Padrão / Branco', color: '#ffffff' },
  { value: '#FEF3C7', label: 'Amarelo Suave', color: '#fef3c7' },
  { value: '#DBEAFE', label: 'Azul Claro', color: '#dbeafe' },
  { value: '#D1FAE5', label: 'Verde Menta', color: '#d1fae5' },
  { value: '#FCE7F3', label: 'Rosa Claro', color: '#fce7f3' },
  { value: '#EDE9FE', label: 'Lavanda / Roxo', color: '#ede9fe' }
];

export const CollabNoteModal = ({ visible, onClose, onSuccess, initialValues, currentUser }) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          tags_str: Array.isArray(initialValues.tags_json)
            ? initialValues.tags_json.join(', ')
            : ''
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          folder_name: 'Geral',
          color_hex: '#FFFFFF',
          is_private: true,
          is_pinned: false
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const tagsArray = values.tags_str
        ? values.tags_str
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        : [];

      const payload = {
        user_id: currentUser?.id,
        folder_name: values.folder_name || 'Geral',
        title: values.title,
        content_rich_text: values.content_rich_text,
        tags_json: tagsArray,
        color_hex: values.color_hex || '#FFFFFF',
        is_private: values.is_private ?? true,
        is_pinned: values.is_pinned ?? false
      };

      let res;
      if (isEditing) {
        res = await apiRequest(`/collaboration_notes?id=eq.${initialValues.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/collaboration_notes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(isEditing ? 'Nota atualizada com sucesso!' : 'Nota criada com sucesso!');
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        message.error(res.error || 'Falha ao salvar anotação');
      }
    } catch {
      // Form validation error
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Nota de Trabalho' : 'Nova Nota / Rascunho de Equipe'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEditing ? 'Salvar Alterações' : 'Criar Nota'}
      cancelText="Cancelar"
      width={700}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="title"
              label="Título da Nota"
              rules={[{ required: true, message: 'Informe o título da nota' }]}
            >
              <Input placeholder="Ex: Checklist da release 2.4, Ideias de Feature, Ata de Reunião..." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="folder_name" label="Pasta / Categoria">
              <Input placeholder="Ex: Geral, Backend, Marketing, Projetos" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="content_rich_text"
          label="Conteúdo da Nota (Formatação Rica & Imagens)"
          rules={[{ required: true, message: 'Digite o conteúdo da nota' }]}
        >
          <UniversalRichEditor
            variant="compact"
            minHeight={180}
            placeholder="Digite seus apontamentos, listas de tarefas, links e referências..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tags_str" label="Tags (separadas por vírgula)">
              <Input placeholder="ex: prioridade, arquitetura, design" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="color_hex" label="Cor do Cartão">
              <Select
                options={NOTE_COLORS.map(c => ({
                  value: c.value,
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: '1px solid #cbd5e1',
                          backgroundColor: c.color,
                          display: 'inline-block'
                        }}
                      />
                      {c.label}
                    </span>
                  )
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="is_private" label="Nota Privada (Apenas para você)" valuePropName="checked">
              <Switch checkedChildren="Privada" unCheckedChildren="Compartilhada" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_pinned" label="Fixar no Topo" valuePropName="checked">
              <Switch checkedChildren="Fixada" unCheckedChildren="Padrão" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
