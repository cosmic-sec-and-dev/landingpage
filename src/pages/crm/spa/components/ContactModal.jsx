import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  message
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import { CONTACT_TYPES } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

export const ContactModal = ({
  open,
  record,
  users = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          first_name: record.first_name,
          last_name: record.last_name,
          email: record.email,
          phone: record.phone,
          company_name: record.company_name,
          job_title: record.job_title,
          contact_type: record.contact_type || 'lead',
          lead_source: record.lead_source,
          assigned_user_id: record.assigned_user_id
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          contact_type: 'lead'
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email?.trim() || null,
        phone: values.phone?.trim() || null,
        company_name: values.company_name?.trim() || null,
        job_title: values.job_title?.trim() || null,
        contact_type: values.contact_type || 'lead',
        lead_source: values.lead_source?.trim() || null,
        assigned_user_id: values.assigned_user_id || null
      };

      if (!record) {
        const res = await apiRequest('/contacts', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Contato / Lead cadastrado!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao cadastrar contato');
        }
      } else {
        const res = await apiRequest(`/contacts?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Contato atualizado com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar contato');
        }
      }
    } catch {
      message.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#0284c7' }} />
          <span>{record ? 'Editar Contato / Lead' : 'Novo Contato / Lead Comercial'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Alterações' : 'Cadastrar Contato'}
      cancelText="Cancelar"
      width={680}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="first_name"
              label="Nome"
              rules={[{ required: true, message: 'Informe o nome' }]}
            >
              <Input placeholder="Ex: Lucas" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="last_name"
              label="Sobrenome"
              rules={[{ required: true, message: 'Informe o sobrenome' }]}
            >
              <Input placeholder="Ex: Silva" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label="E-mail">
              <Input prefix={<MailOutlined />} placeholder="lucas@empresa.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="phone" label="Telefone / WhatsApp">
              <Input prefix={<PhoneOutlined />} placeholder="+55 11 98765-4321" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="company_name" label="Empresa / Organização">
              <Input prefix={<BankOutlined />} placeholder="Ex: Tech Corp Brasil" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="job_title" label="Cargo / Função">
              <Input placeholder="Ex: Diretor de Tecnologia" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="contact_type" label="Classificação do Contato">
              <Select options={CONTACT_TYPES} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="lead_source" label="Origem do Lead">
              <Select
                placeholder="Selecione a origem"
                options={[
                  { value: 'website', label: '🌐 Formulário do Site' },
                  { value: 'referral', label: '🤝 Indicação' },
                  { value: 'inbound', label: '📥 Inbound Marketing' },
                  { value: 'outbound', label: '📞 Prospecção Ativa' },
                  { value: 'events', label: '🎟️ Eventos & Feiras' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="assigned_user_id" label="Vendedor / Executivo Responsável">
          <Select
            placeholder="Atribuir a um membro da equipe"
            allowClear
            options={users.map(u => ({
              value: u.id,
              label: `${u.full_name || u.email}`
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
