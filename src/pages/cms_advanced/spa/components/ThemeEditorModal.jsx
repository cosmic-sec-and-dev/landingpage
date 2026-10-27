import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Tabs,
  Button,
  message,
  Card
} from 'antd';
import {
  FormatPainterOutlined,
  CodeOutlined,
  BgColorsOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const ThemeEditorModal = ({
  visible,
  record,
  onClose,
  onSaved
}) => {
  const { isDark } = useAppTheme();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('css');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (record) {
      form.setFieldsValue({
        name: record.name || '',
        custom_css: record.custom_css || '',
        custom_js: record.custom_js || '',
        custom_header: record.custom_header || '',
        custom_footer: record.custom_footer || '',
        theme_config_json: record.theme_config_json ? JSON.stringify(record.theme_config_json, null, 2) : ''
      });
      setIsActive(record.is_active ?? false);
    } else {
      form.resetFields();
      setIsActive(false);
    }
  }, [record, visible]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let parsedConfig = {};
      if (values.theme_config_json && values.theme_config_json.trim()) {
        try {
          parsedConfig = JSON.parse(values.theme_config_json);
        } catch {
          message.error('JSON de configuração do tema inválido!');
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: values.name,
        custom_css: values.custom_css || null,
        custom_js: values.custom_js || null,
        custom_header: values.custom_header || null,
        custom_footer: values.custom_footer || null,
        theme_config_json: parsedConfig || {},
        is_active: isActive
      };

      if (!record) {
        const meRes = await apiRequest('/me');
        const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
        payload.tenant_id = meData?.tenant_id || '00000000-0000-0000-0000-000000000000';

        const res = await apiRequest('/blogger_themes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Tema criado com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao criar tema');
        }
      } else {
        const res = await apiRequest(`/blogger_themes?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Tema atualizado!');
          onSaved();
        } else {
          message.error('Falha ao atualizar tema');
        }
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'css',
      label: <span><BgColorsOutlined /> Custom CSS</span>,
      children: (
        <Form.Item name="custom_css" label="Folha de Estilos Customizada (CSS)">
          <TextArea
            rows={12}
            placeholder="/* Regras de estilo para seu CMS / Blog */\nbody { font-family: 'Inter', sans-serif; }\n.article-hero { border-radius: 12px; }"
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </Form.Item>
      )
    },
    {
      key: 'js',
      label: <span><CodeOutlined /> Custom JavaScript</span>,
      children: (
        <Form.Item name="custom_js" label="Scripts JavaScript Customizados">
          <TextArea
            rows={12}
            placeholder="// Scripts e bibliotecas dinâmicas\nconsole.log('Tema carregado com sucesso');"
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </Form.Item>
      )
    },
    {
      key: 'html',
      label: <span><CodeOutlined /> Header & Footer HTML</span>,
      children: (
        <div>
          <Form.Item name="custom_header" label="Injeção no Cabeçalho (Custom Header HTML)">
            <TextArea
              rows={5}
              placeholder="<meta name='author' content='Enterprise Team' />"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          <Form.Item name="custom_footer" label="Injeção no Rodapé (Custom Footer HTML)">
            <TextArea
              rows={5}
              placeholder="<footer>© 2026 Todos os direitos reservados.</footer>"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </div>
      )
    },
    {
      key: 'config',
      label: <span><SettingOutlined /> Configurações JSON</span>,
      children: (
        <Form.Item name="theme_config_json" label="Estrutura de Variáveis do Tema (JSON)">
          <TextArea
            rows={12}
            placeholder='{\n  "primaryColor": "#0284c7",\n  "borderRadius": 8,\n  "showAuthorBadge": true\n}'
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </Form.Item>
      )
    }
  ];

  return (
    <Modal
      title={record ? `Editar Tema Visual: ${record.name}` : 'Criar Novo Tema Visual'}
      open={visible}
      onCancel={onClose}
      width={880}
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
          {record ? 'Salvar Tema' : 'Criar Tema'}
        </Button>
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <Form.Item
            label="Nome do Tema"
            name="name"
            rules={[{ required: true, message: 'Informe o nome do tema' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Ex: Tema Corporativo Dark Mode" />
          </Form.Item>

          <Form.Item label="Tema Ativo Padrão">
            <Switch
              checked={isActive}
              onChange={setIsActive}
              checkedChildren="Ativo"
              unCheckedChildren="Inativo"
            />
          </Form.Item>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Form>
    </Modal>
  );
};
