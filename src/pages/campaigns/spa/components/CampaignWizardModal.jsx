import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Button,
  Steps,
  Card,
  Typography,
  message,
  Divider,
  Space
} from 'antd';
import {
  NotificationOutlined,
  MailOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;
const { Text, Title } = Typography;

export const CampaignWizardModal = ({
  visible,
  record,
  onClose,
  onSaved
}) => {
  const { isDark } = useAppTheme();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailsText, setEmailsText] = useState('');

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      if (record) {
        form.setFieldsValue({
          subject: record.subject || '',
          body: record.body || '',
          target_type: record.target_type || 'leads',
          priority: record.priority || 'normal',
          status: record.status || 'active',
          action_url: record.action_url || '',
          start_date: record.start_date ? dayjs(record.start_date) : null,
          end_date: record.end_date ? dayjs(record.end_date) : null,
          data_json: record.data_json ? JSON.stringify(record.data_json, null, 2) : ''
        });
        setEmailsText('');
      } else {
        form.resetFields();
        form.setFieldsValue({
          target_type: 'leads',
          priority: 'normal',
          status: 'active'
        });
        setEmailsText('');
      }
    }
  }, [record, visible]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let parsedData = null;
      if (values.data_json && values.data_json.trim()) {
        try {
          parsedData = JSON.parse(values.data_json);
        } catch {
          message.error('JSON de metadados inválido!');
          setLoading(false);
          return;
        }
      }

      const payload = {
        subject: values.subject,
        body: values.body,
        target_type: values.target_type || 'leads',
        priority: values.priority || 'normal',
        status: values.status || 'active',
        action_url: values.action_url || null,
        data_json: parsedData,
        start_date: values.start_date ? values.start_date.toISOString() : new Date().toISOString(),
        end_date: values.end_date ? values.end_date.toISOString() : null
      };

      const meRes = await apiRequest('/me');
      const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
      const tenantId = meData?.tenant_id || '00000000-0000-0000-0000-000000000000';

      if (!record) {
        payload.tenant_id = tenantId;
        const res = await apiRequest('/campaigns', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const campaignId = res.data?.id || (Array.isArray(res.data) && res.data[0]?.id);
          // Parse emails and insert campaign_contacts
          if (emailsText.trim() && campaignId) {
            const rawList = emailsText.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
            const contactPromises = rawList.map(email =>
              apiRequest('/campaign_contacts', {
                method: 'POST',
                body: JSON.stringify({
                  tenant_id: tenantId,
                  campaign_id: campaignId,
                  email,
                  read: false
                })
              })
            );
            await Promise.allSettled(contactPromises);
          }

          message.success('Campanha criada com sucesso!');
          onSaved();
        } else {
          message.error(res.data?.message || 'Falha ao criar campanha');
        }
      } else {
        const res = await apiRequest(`/campaigns?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          if (emailsText.trim()) {
            const rawList = emailsText.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
            const contactPromises = rawList.map(email =>
              apiRequest('/campaign_contacts', {
                method: 'POST',
                body: JSON.stringify({
                  tenant_id: record.tenant_id || tenantId,
                  campaign_id: record.id,
                  email,
                  read: false
                })
              })
            );
            await Promise.allSettled(contactPromises);
          }

          message.success('Campanha atualizada com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao atualizar campanha');
        }
      }
    } catch {
      // validation error
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Configurações',
      icon: <NotificationOutlined />,
      content: (
        <div style={{ padding: '16px 0' }}>
          <Form.Item
            label="Assunto da Campanha (Subject)"
            name="subject"
            rules={[{ required: true, message: 'Informe o assunto da campanha' }]}
          >
            <Input size="large" placeholder="Ex: Lançamento de Novos Recursos de Outono 🍁" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Segmento de Público (Target Type)" name="target_type">
                <Select
                  options={[
                    { label: 'Leads & Prospects', value: 'leads' },
                    { label: 'Clientes Ativos (Subscribers)', value: 'customers' },
                    { label: 'Contatos Inativos (Re-engagement)', value: 'inactive_leads' },
                    { label: 'Parceiros & Afiliados', value: 'partners' },
                    { label: 'Público Geral (Broadcast)', value: 'broadcast' }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Prioridade de Disparo" name="priority">
                <Select
                  options={[
                    { label: 'Normal', value: 'normal' },
                    { label: 'Alta', value: 'high' },
                    { label: 'Urgente', value: 'urgent' },
                    { label: 'Baixa', value: 'low' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Link de Ação / CTA (Action URL)" name="action_url">
            <Input prefix={<LinkOutlined />} placeholder="https://app.selene.com/promo/autumn-2026" />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Mensagem',
      icon: <MailOutlined />,
      content: (
        <div style={{ padding: '16px 0' }}>
          <Form.Item
            label="Corpo da Mensagem de Marketing"
            name="body"
            rules={[{ required: true, message: 'Informe o conteúdo da mensagem' }]}
          >
            <TextArea
              rows={10}
              placeholder="Olá! Estamos entusiasmados em apresentar nossos novos recursos exclusivos..."
            />
          </Form.Item>

          <Form.Item
            label="Parâmetros de Tracking / Metadados (JSON Opcional)"
            name="data_json"
          >
            <TextArea
              rows={3}
              placeholder='{ "utm_source": "newsletter", "utm_campaign": "autumn_launch" }'
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Destinatários',
      icon: <TeamOutlined />,
      content: (
        <div style={{ padding: '16px 0' }}>
          <Text type="secondary" style={{ marginBottom: 12, display: 'block' }}>
            Adicione e-mails de leads ou clientes para vincular a esta campanha (um por linha ou separados por vírgula):
          </Text>
          <TextArea
            rows={8}
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            placeholder="contato1@empresa.com&#10;cliente2@corporativo.com.br&#10;diretoria@exemplo.com"
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </div>
      )
    },
    {
      title: 'Agendamento',
      icon: <CalendarOutlined />,
      content: (
        <div style={{ padding: '16px 0' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Data de Início / Disparo" name="start_date">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Data de Encerramento (End Date)" name="end_date">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Status Inicial da Campanha" name="status">
            <Select
              options={[
                { label: 'Ativa / Em Execução', value: 'active' },
                { label: 'Rascunho (Draft)', value: 'draft' },
                { label: 'Pausada', value: 'paused' },
                { label: 'Concluída', value: 'completed' }
              ]}
            />
          </Form.Item>
        </div>
      )
    }
  ];

  return (
    <Modal
      title={record ? `Editar Campanha: ${record.subject}` : 'Criar Nova Campanha de Marketing'}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        currentStep > 0 && (
          <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
            Anterior
          </Button>
        ),
        currentStep < steps.length - 1 && (
          <Button key="next" type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
            Próximo
          </Button>
        ),
        currentStep === steps.length - 1 && (
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={loading}
            onClick={handleFinish}
          >
            {record ? 'Salvar Campanha' : 'Lançar Campanha'}
          </Button>
        )
      ]}
      destroyOnHidden
    >
      <Steps current={currentStep} items={steps.map(s => ({ title: s.title, icon: s.icon }))} />
      <Form form={form} layout="vertical">
        {steps[currentStep].content}
      </Form>
    </Modal>
  );
};
