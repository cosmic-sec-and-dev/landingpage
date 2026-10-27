import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  Row,
  Col,
  Button,
  message,
  Card
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  SendOutlined,
  ThunderboltOutlined,
  UserOutlined,
  LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const SendNotificationModal = ({
  visible,
  record,
  defaultChannel = 'push', // 'push' | 'email'
  onClose,
  onSaved
}) => {
  const { isDark } = useAppTheme();
  const [form] = Form.useForm();
  const [channel, setChannel] = useState(defaultChannel);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (record) {
        setChannel(record._channel || defaultChannel);
        form.setFieldsValue({
          title_or_subject: record.title || record.subject || '',
          body: record.body || '',
          target_type: record.target_type || 'broadcast',
          priority: record.priority || 'normal',
          action_url: record.action_url || '',
          icon_url: record.icon_url || '',
          start_date: record.start_date ? dayjs(record.start_date) : null,
          end_date: record.end_date ? dayjs(record.end_date) : null,
          data_json: record.data_json ? JSON.stringify(record.data_json, null, 2) : ''
        });
      } else {
        setChannel(defaultChannel);
        form.resetFields();
        form.setFieldsValue({
          target_type: 'broadcast',
          priority: 'normal'
        });
      }
    }
  }, [record, visible, defaultChannel]);

  const handleFinish = async (values) => {
    setLoading(true);
    let parsedData = null;
    if (values.data_json && values.data_json.trim()) {
      try {
        parsedData = JSON.parse(values.data_json);
      } catch {
        message.error('JSON de dados adicionais inválido!');
        setLoading(false);
        return;
      }
    }

    const isEmail = channel === 'email';
    const payload = {
      body: values.body,
      target_type: values.target_type || 'broadcast',
      priority: values.priority || 'normal',
      action_url: values.action_url || null,
      data_json: parsedData || {},
      start_date: values.start_date ? values.start_date.toISOString() : (record?.start_date || new Date().toISOString()),
      end_date: values.end_date ? values.end_date.toISOString() : null,
      status: 'sent'
    };

    if (isEmail) {
      payload.subject = values.title_or_subject;
    } else {
      payload.title = values.title_or_subject;
      payload.icon_url = values.icon_url || null;
    }

    const endpoint = isEmail ? '/email_notifications' : '/push_notifications';

    try {
      if (!record) {
        const meRes = await apiRequest('/me');
        const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
        if (meData?.tenant_id) {
          payload.tenant_id = meData.tenant_id;
        }
        if (meData?.id) {
          payload.user_id = meData.id;
        }

        const res = await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success(`${isEmail ? 'E-mail' : 'Push'} enviado/agendado com sucesso!`);
          onSaved();
        } else {
          message.error(res.data?.message || 'Falha ao enviar notificação');
        }
      } else {
        const res = await apiRequest(`${endpoint}?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Notificação atualizada com sucesso!');
          onSaved();
        } else {
          message.error('Falha ao atualizar notificação');
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
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SendOutlined style={{ color: '#0284c7' }} />
          {record ? 'Editar Notificação' : 'Disparar Nova Notificação'}
        </span>
      }
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
          icon={<SendOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          {record ? 'Salvar Notificação' : 'Disparar Agora'}
        </Button>
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ target_type: 'broadcast', priority: 'normal' }}
      >
        {!record && (
          <div style={{ marginBottom: 18, textAlign: 'center' }}>
            <Radio.Group
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="push">
                <BellOutlined style={{ marginRight: 6 }} />
                Push Notification (App/Web)
              </Radio.Button>
              <Radio.Button value="email">
                <MailOutlined style={{ marginRight: 6 }} />
                Notificação por E-mail
              </Radio.Button>
            </Radio.Group>
          </div>
        )}

        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              label={channel === 'email' ? 'Assunto do E-mail' : 'Título da Notificação Push'}
              name="title_or_subject"
              rules={[{ required: true, message: 'Informe o título/assunto' }]}
            >
              <Input placeholder={channel === 'email' ? 'Ex: Confirmação de Acesso ao Sistema' : 'Ex: Nova Mensagem Importante'} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Prioridade de Envio" name="priority">
              <Select
                options={[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Alta (High)', value: 'high' },
                  { label: 'Urgente / Alerta', value: 'urgent' },
                  { label: 'Baixa (Low)', value: 'low' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Corpo da Mensagem"
          name="body"
          rules={[{ required: true, message: 'Informe o texto da mensagem' }]}
        >
          <TextArea
            rows={5}
            placeholder="Digite a mensagem que o usuário visualizará..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Tipo de Destinatário (Target)" name="target_type">
              <Select
                options={[
                  { label: 'Todos os Usuários (Broadcast)', value: 'broadcast' },
                  { label: 'Usuários Ativos (Active Users)', value: 'active_users' },
                  { label: 'Administradores (Admins)', value: 'admins' },
                  { label: 'Usuário Específico', value: 'direct' }
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="URL de Ação (Clique/Redirecionamento)" name="action_url">
              <Input prefix={<LinkOutlined />} placeholder="https://..." />
            </Form.Item>
          </Col>
        </Row>

        {channel === 'push' && (
          <Form.Item label="URL do Ícone (Opcional)" name="icon_url">
            <Input placeholder="https://assets.selene.com/icons/alert.png" />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Data de Início / Envio Agendado" name="start_date">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Data de Expiração (End Date)" name="end_date">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Payload de Dados Adicionais (JSON Opcional)"
          name="data_json"
          extra="Parâmetros customizados para deep-linking ou processamento."
        >
          <TextArea
            rows={3}
            placeholder='{ "module": "finance", "action_id": "inv_123" }'
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
