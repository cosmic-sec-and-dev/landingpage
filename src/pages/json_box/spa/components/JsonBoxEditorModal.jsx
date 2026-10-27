import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Typography,
  message,
  Tooltip
} from 'antd';
import {
  CodeOutlined,
  FormatPainterOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;
const { Text } = Typography;

const TEMPLATES = {
  key_value: {
    label: 'Chave-Valor Simples',
    json: {
      site_title: 'Selene Enterprise',
      max_upload_size_mb: 50,
      maintenance_mode: false,
      support_email: 'support@example.com'
    }
  },
  feature_flags: {
    label: 'Feature Flags',
    json: {
      enable_beta_chat: true,
      enable_dark_theme: true,
      rollout_percentage: 50,
      target_tenants: ['enterprise-a', 'enterprise-b']
    }
  },
  user_profile_schema: {
    label: 'Perfil / Config de Usuário',
    json: {
      notifications: { email: true, sms: false, push: true },
      display: { theme: 'dark', compact_mode: true, language: 'pt_BR' },
      shortcuts: ['ctrl+k', 'ctrl+s']
    }
  },
  api_mock: {
    label: 'Mock de Resposta API',
    json: {
      status: 'success',
      data: [
        { id: 1, title: 'Item Alpha', score: 98.5 },
        { id: 2, title: 'Item Beta', score: 87.2 }
      ],
      pagination: { total: 2, page: 1, limit: 10 }
    }
  }
};

export const JsonBoxEditorModal = ({
  visible,
  record,
  onClose,
  onSaved
}) => {
  const { isDark } = useAppTheme();
  const [form] = Form.useForm();
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState('{\n  \n}');
  const [metadataText, setMetadataText] = useState('{\n  \n}');
  const [activeTab, setActiveTab] = useState('data');

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        name: record.name || '',
        slug: record.slug || ''
      });
      setIsActive(record.is_active ?? true);

      if (record.id && record.data === undefined) {
        setLoading(true);
        apiRequest(`/json_boxes?id=eq.${record.id}&select=id,slug,name,data,metadata`)
          .then(res => {
            if (res.ok && Array.isArray(res.data) && res.data[0]) {
              const fullRecord = res.data[0];
              setJsonText(fullRecord.data ? JSON.stringify(fullRecord.data, null, 2) : '{\n  \n}');
              setMetadataText(fullRecord.metadata ? JSON.stringify(fullRecord.metadata, null, 2) : '{\n  \n}');
            }
          })
          .catch(() => {
            message.error('Erro ao carregar conteúdo do documento JSON');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setJsonText(
          record.data ? JSON.stringify(record.data, null, 2) : '{\n  \n}'
        );
        setMetadataText(
          record.metadata ? JSON.stringify(record.metadata, null, 2) : '{\n  \n}'
        );
      }
    } else {
      form.resetFields();
      setIsActive(true);
      setJsonText(JSON.stringify(TEMPLATES.key_value.json, null, 2));
      setMetadataText('{\n  "version": "1.0",\n  "environment": "production"\n}');
    }
  }, [record, visible]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!record) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      form.setFieldsValue({ slug: generatedSlug });
    }
  };

  const handleBeautify = (type) => {
    try {
      if (type === 'data') {
        const parsed = JSON.parse(jsonText);
        setJsonText(JSON.stringify(parsed, null, 2));
        message.success('JSON formatado com sucesso!');
      } else {
        const parsed = JSON.parse(metadataText);
        setMetadataText(JSON.stringify(parsed, null, 2));
        message.success('Metadata formatado!');
      }
    } catch {
      message.error('JSON inválido para formatação');
    }
  };

  const handleMinify = (type) => {
    try {
      if (type === 'data') {
        const parsed = JSON.parse(jsonText);
        setJsonText(JSON.stringify(parsed));
        message.success('JSON minificado!');
      } else {
        const parsed = JSON.parse(metadataText);
        setMetadataText(JSON.stringify(parsed));
        message.success('Metadata minificado!');
      }
    } catch {
      message.error('JSON inválido');
    }
  };

  const handleApplyTemplate = (tplKey) => {
    const tpl = TEMPLATES[tplKey];
    if (tpl) {
      setJsonText(JSON.stringify(tpl.json, null, 2));
      message.info(`Template "${tpl.label}" carregado!`);
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    let parsedData = null;
    let parsedMetadata = null;

    try {
      if (jsonText && jsonText.trim()) {
        parsedData = JSON.parse(jsonText);
      }
    } catch {
      message.error('Erro de sintaxe no JSON de Dados (Data)!');
      setLoading(false);
      return;
    }

    try {
      if (metadataText && metadataText.trim()) {
        parsedMetadata = JSON.parse(metadataText);
      }
    } catch {
      message.error('Erro de sintaxe no JSON de Metadados!');
      setLoading(false);
      return;
    }

    const payload = {
      name: values.name,
      slug: values.slug,
      data: parsedData,
      metadata: parsedMetadata,
      is_active: isActive
    };

    try {
      if (!record) {
        const meRes = await apiRequest('/me');
        const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
        payload.tenant_id = meData?.tenant_id || '00000000-0000-0000-0000-000000000000';

        const res = await apiRequest('/json_boxes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Documento JSON criado com sucesso!');
          onSaved();
        } else {
          message.error(res.data?.message || 'Falha ao criar documento');
        }
      } else {
        const res = await apiRequest(`/json_boxes?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Documento JSON atualizado com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao atualizar documento');
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
      key: 'data',
      label: <span><CodeOutlined /> Payload de Dados (JSON Schema-less)</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Space>
              <Select
                placeholder="Carregar Modelo Pronto"
                size="small"
                style={{ width: 200 }}
                onChange={handleApplyTemplate}
                options={Object.entries(TEMPLATES).map(([k, v]) => ({ label: v.label, value: k }))}
              />
            </Space>

            <Space>
              <Button size="small" icon={<FormatPainterOutlined />} onClick={() => handleBeautify('data')}>
                Formatar (Beautify)
              </Button>
              <Button size="small" onClick={() => handleMinify('data')}>
                Minificar
              </Button>
            </Space>
          </div>

          <TextArea
            rows={14}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.5,
              background: isDark ? '#0f172a' : '#f8fafc',
              color: isDark ? '#38bdf8' : '#0369a1'
            }}
          />
        </div>
      )
    },
    {
      key: 'metadata',
      label: <span><ThunderboltOutlined /> Metadados & Flags (JSON)</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <Space>
              <Button size="small" icon={<FormatPainterOutlined />} onClick={() => handleBeautify('metadata')}>
                Formatar
              </Button>
              <Button size="small" onClick={() => handleMinify('metadata')}>
                Minificar
              </Button>
            </Space>
          </div>

          <TextArea
            rows={14}
            value={metadataText}
            onChange={(e) => setMetadataText(e.target.value)}
            style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.5,
              background: isDark ? '#0f172a' : '#f8fafc',
              color: isDark ? '#a78bfa' : '#6b21a8'
            }}
          />
        </div>
      )
    }
  ];

  return (
    <Modal
      title={record ? `Editar Documento JSON: ${record.name}` : 'Criar Novo Documento / Caixa JSON'}
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
          {record ? 'Salvar Alterações' : 'Salvar Documento'}
        </Button>
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col xs={24} sm={11}>
            <Form.Item
              label="Nome do Documento / Box"
              name="name"
              rules={[{ required: true, message: 'Informe o nome do documento' }]}
            >
              <Input
                placeholder="Ex: Configurações Globais do App"
                onChange={handleNameChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={9}>
            <Form.Item
              label="Identificador / Slug Único"
              name="slug"
              rules={[{ required: true, message: 'Informe o slug' }]}
            >
              <Input
                addonBefore="/"
                placeholder="app-global-configs"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={4}>
            <Form.Item label="Status Ativo">
              <Switch
                checked={isActive}
                onChange={setIsActive}
                checkedChildren="Ativo"
                unCheckedChildren="Inativo"
              />
            </Form.Item>
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Form>
    </Modal>
  );
};
