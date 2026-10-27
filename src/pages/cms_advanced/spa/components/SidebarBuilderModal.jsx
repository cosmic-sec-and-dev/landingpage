import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  message
} from 'antd';
import { LayoutOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const SidebarBuilderModal = ({
  visible,
  record,
  onClose,
  onSaved
}) => {
  const [form] = Form.useForm();
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (record) {
      form.setFieldsValue({
        name: record.name || '',
        position: record.position || 'right',
        widgets_order_json: record.widgets_order_json ? JSON.stringify(record.widgets_order_json, null, 2) : ''
      });
      setIsActive(record.is_active ?? true);
    } else {
      form.resetFields();
      setIsActive(true);
    }
  }, [record, visible]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let parsedWidgets = [];
      if (values.widgets_order_json && values.widgets_order_json.trim()) {
        try {
          parsedWidgets = JSON.parse(values.widgets_order_json);
        } catch {
          message.error('JSON de configuração dos widgets inválido!');
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: values.name,
        position: values.position,
        widgets_order_json: parsedWidgets || [],
        is_active: isActive
      };

      if (!record) {
        const meRes = await apiRequest('/me');
        const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
        payload.tenant_id = meData?.tenant_id || '00000000-0000-0000-0000-000000000000';

        const res = await apiRequest('/blogger_sidebars', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Barra lateral criada com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao criar barra lateral');
        }
      } else {
        const res = await apiRequest(`/blogger_sidebars?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Barra lateral atualizada!');
          onSaved();
        } else {
          message.error('Falha ao atualizar barra lateral');
        }
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={record ? `Editar Barra Lateral: ${record.name}` : 'Nova Barra Lateral / Container de Widgets'}
      open={visible}
      onCancel={onClose}
      width={640}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {record ? 'Salvar Alterações' : 'Criar Barra Lateral'}
        </Button>
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ position: 'right' }}
      >
        <Form.Item
          label="Nome da Barra Lateral"
          name="name"
          rules={[{ required: true, message: 'Informe o nome' }]}
        >
          <Input placeholder="Ex: Sidebar Principal do Blog" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label="Posição no Layout"
            name="position"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select
              options={[
                { label: 'Direita (Right Sidebar)', value: 'right' },
                { label: 'Esquerda (Left Sidebar)', value: 'left' },
                { label: 'Rodapé (Footer Columns)', value: 'footer' },
                { label: 'Topo / Sub-Header', value: 'top' }
              ]}
            />
          </Form.Item>

          <Form.Item label="Status Ativo">
            <Switch
              checked={isActive}
              onChange={setIsActive}
              checkedChildren="Ativo"
              unCheckedChildren="Inativo"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Ordem e Configuração dos Widgets (JSON)"
          name="widgets_order_json"
          extra="Defina a lista de widgets ativos e seus parâmetros."
        >
          <TextArea
            rows={8}
            placeholder='{\n  "widgets": [\n    { "type": "search_box", "title": "Pesquisar Artigos" },\n    { "type": "recent_posts", "limit": 5 },\n    { "type": "tag_cloud" },\n    { "type": "newsletter_signup" }\n  ]\n}'
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
