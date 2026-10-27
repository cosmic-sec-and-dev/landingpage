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
import { CustomerServiceOutlined, UserOutlined, TagOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const TicketModal = ({
  open,
  record,
  departments = [],
  categories = [],
  slaPolicies = [],
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
          subject: record.subject,
          description: record.description,
          requester_user_id: record.requester_user_id,
          assigned_agent_id: record.assigned_agent_id,
          department_id: record.department_id,
          category_id: record.category_id,
          sla_policy_id: record.sla_policy_id,
          priority: record.priority || 'medium',
          status: record.status || 'open',
          channel: record.channel || 'web_portal'
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          priority: 'medium',
          status: 'open',
          channel: 'web_portal'
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let requesterId = values.requester_user_id;
      if (!requesterId) {
        const meRes = await apiRequest('/me');
        const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
        requesterId = meData?.id;
      }

      const randomNum = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        subject: values.subject.trim(),
        description: values.description.trim(),
        requester_user_id: requesterId,
        assigned_agent_id: values.assigned_agent_id || null,
        department_id: values.department_id || null,
        category_id: values.category_id || null,
        sla_policy_id: values.sla_policy_id || null,
        priority: values.priority || 'medium',
        status: values.status || 'open',
        channel: values.channel || 'web_portal'
      };

      if (!record) {
        payload.ticket_number = randomNum;
        const res = await apiRequest('/helpdesk_tickets', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Chamado de suporte aberto com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao abrir chamado');
        }
      } else {
        const res = await apiRequest(`/helpdesk_tickets?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Chamado atualizado com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar chamado');
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
          <CustomerServiceOutlined style={{ color: '#0284c7' }} />
          <span>{record ? `Editar Chamado (${record.ticket_number})` : 'Novo Chamado de Suporte'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Alterações' : 'Abrir Chamado'}
      cancelText="Cancelar"
      width={720}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Form.Item
          name="subject"
          label="Assunto / Título do Chamado"
          rules={[{ required: true, message: 'Informe o assunto do chamado' }]}
        >
          <Input placeholder="Ex: Falha na integração de pagamentos via webhook" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="requester_user_id"
              label="Solicitante (Usuário / Cliente)"
              rules={[{ required: true, message: 'Selecione o solicitante' }]}
            >
              <Select
                placeholder="Selecione o solicitante"
                showSearch
                optionFilterProp="label"
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.full_name || u.email}`
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="assigned_agent_id" label="Agente de Suporte Responsável">
              <Select
                placeholder="Atribuir a um atendente"
                allowClear
                showSearch
                optionFilterProp="label"
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.full_name || u.email}`
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="department_id" label="Departamento / Fila">
              <Select
                placeholder="Selecione o departamento"
                allowClear
                options={departments.map(d => ({ value: d.id, label: d.name }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="category_id" label="Categoria do Problema">
              <Select
                placeholder="Selecione a categoria"
                allowClear
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="priority" label="Prioridade">
              <Select
                options={[
                  { value: 'urgent', label: '🚨 Urgente' },
                  { value: 'high', label: '🔥 Alta' },
                  { value: 'medium', label: '⚡ Média' },
                  { value: 'low', label: '☕ Baixa' }
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item name="status" label="Status">
              <Select
                options={[
                  { value: 'open', label: '🔵 Aberto' },
                  { value: 'pending', label: '🟠 Pendente' },
                  { value: 'resolved', label: '🟢 Resolvido' },
                  { value: 'closed', label: '⚪ Fechado' }
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item name="sla_policy_id" label="Política SLA">
              <Select
                placeholder="Padrão"
                allowClear
                options={slaPolicies.map(s => ({ value: s.id, label: `${s.name} (${s.resolution_time_minutes}m)` }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Descrição Detalhada do Problema"
          rules={[{ required: true, message: 'Descreva a ocorrência' }]}
        >
          <TextArea rows={4} placeholder="Descreva os passos para reproduzir, comportamento esperado e mensagens de erro..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
