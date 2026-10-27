import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Row,
  Col,
  Tabs,
  Button,
  message,
  Card
} from 'antd';
import {
  BankOutlined,
  SettingOutlined,
  SaveOutlined,
  FormatPainterOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const TenantEditorModal = ({
  visible,
  record,
  onClose,
  onSaved
}) => {
  const { isDark } = useAppTheme();
  const [form] = Form.useForm();
  const [isActive, setIsActive] = useState(true);
  const [settingsText, setSettingsText] = useState('{\n  "max_users": 50,\n  "storage_limit_gb": 100,\n  "theme": "dark"\n}');
  const [metadataText, setMetadataText] = useState('{\n  "tier": "enterprise",\n  "region": "sa-east-1"\n}');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          name: record.name || '',
          slug: record.slug || '',
          business_name: record.business_name || '',
          business_id: record.business_id || ''
        });
        setIsActive(record.is_active ?? true);
        setSettingsText(record.settings ? JSON.stringify(record.settings, null, 2) : '{\n  \n}');
        setMetadataText(record.metadata ? JSON.stringify(record.metadata, null, 2) : '{\n  \n}');
      } else {
        form.resetFields();
        setIsActive(true);
        setSettingsText('{\n  "max_users": 50,\n  "storage_limit_gb": 100,\n  "theme": "dark"\n}');
        setMetadataText('{\n  "tier": "enterprise",\n  "region": "sa-east-1"\n}');
      }
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

  const handleFinish = async (values) => {
    setLoading(true);
    let parsedSettings = null;
    let parsedMetadata = null;

    if (settingsText.trim()) {
      try {
        parsedSettings = JSON.parse(settingsText);
      } catch {
        message.error('JSON de configurações (Settings) inválido!');
        setLoading(false);
        return;
      }
    }

    if (metadataText.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataText);
      } catch {
        message.error('JSON de metadados inválido!');
        setLoading(false);
        return;
      }
    }

    const payload = {
      name: values.name,
      slug: values.slug,
      business_name: values.business_name || null,
      business_id: values.business_id || null,
      is_active: isActive,
      settings: parsedSettings,
      metadata: parsedMetadata
    };

    try {
      if (!record) {
        const res = await apiRequest('/tenants', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Organização/Tenant criada com sucesso!');
          onSaved();
        } else {
          message.error(res.data?.message || 'Falha ao criar tenant');
        }
      } else {
        const res = await apiRequest(`/tenants?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Organização atualizada com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao atualizar tenant');
        }
      }
    } catch {
      message.error('Erro de conexão ao salvar tenant');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'settings',
      label: <span><SettingOutlined /> Configurações & Quotas (Settings JSON)</span>,
      children: (
        <TextArea
          rows={10}
          value={settingsText}
          onChange={(e) => setSettingsText(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      )
    },
    {
      key: 'metadata',
      label: <span><SettingOutlined /> Metadados Customizados (Metadata JSON)</span>,
      children: (
        <TextArea
          rows={10}
          value={metadataText}
          onChange={(e) => setMetadataText(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      )
    }
  ];

  return (
    <Modal
      title={record ? `Editar Organização: ${record.name}` : 'Cadastrar Nova Organização (Tenant)'}
      open={visible}
      onCancel={onClose}
      width={760}
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
          {record ? 'Salvar Alterações' : 'Criar Organização'}
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
          <Col xs={24} sm={14}>
            <Form.Item
              label="Nome da Organização (Fantasia)"
              name="name"
              rules={[{ required: true, message: 'Informe o nome da organização' }]}
            >
              <Input
                placeholder="Ex: ACME Corp Brasil"
                onChange={handleNameChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={10}>
            <Form.Item
              label="Slug (Subdomínio / URL)"
              name="slug"
              rules={[{ required: true, message: 'Informe o slug único' }]}
            >
              <Input addonBefore="/" placeholder="acme-corp" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={14}>
            <Form.Item label="Razão Social (Business Name)" name="business_name">
              <Input placeholder="Ex: ACME Soluções Empresariais LTDA" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={10}>
            <Form.Item label="CNPJ / Tax ID (Business ID)" name="business_id">
              <Input placeholder="12.345.678/0001-90" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Organização Ativa">
          <Switch
            checked={isActive}
            onChange={setIsActive}
            checkedChildren="Ativo"
            unCheckedChildren="Bloqueado"
          />
        </Form.Item>

        <Tabs items={tabItems} style={{ marginTop: 8 }} />
      </Form>
    </Modal>
  );
};
