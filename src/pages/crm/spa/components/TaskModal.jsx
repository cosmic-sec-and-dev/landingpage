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
  message
} from 'antd';
import { CheckSquareOutlined, CalendarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const TaskModal = ({
  open,
  record,
  defaultDealId,
  deals = [],
  contacts = [],
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
          title: record.title,
          description: record.description,
          assigned_user_id: record.assigned_user_id,
          contact_id: record.contact_id,
          deal_id: record.deal_id,
          due_date: record.due_date ? dayjs(record.due_date) : null,
          priority: record.priority || 'medium',
          status: record.status || 'pending'
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          deal_id: defaultDealId || undefined,
          priority: 'medium',
          status: 'pending'
        });
      }
    }
  }, [open, record, defaultDealId, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let assignedId = values.assigned_user_id;
      if (!assignedId) {
        const meRes = await apiRequest('/me');
        const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
        assignedId = meData?.id;
      }

      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() || null,
        assigned_user_id: assignedId,
        contact_id: values.contact_id || null,
        deal_id: values.deal_id || null,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        priority: values.priority || 'medium',
        status: values.status || 'pending'
      };

      if (!record) {
        const res = await apiRequest('/tasks', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Tarefa de follow-up criada!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao criar tarefa');
        }
      } else {
        const res = await apiRequest(`/tasks?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Tarefa atualizada!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar tarefa');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckSquareOutlined style={{ color: '#0284c7' }} />
          <span>{record ? 'Editar Tarefa de Follow-up' : 'Nova Tarefa de Follow-up'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Tarefa' : 'Criar Tarefa'}
      cancelText="Cancelar"
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Título da Ação de Follow-up"
          rules={[{ required: true, message: 'Informe a tarefa' }]}
        >
          <Input placeholder="Ex: Ligar para alinhar minuta do contrato" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="deal_id" label="Oportunidade Vinculada">
              <Select
                placeholder="Selecione o negócio"
                allowClear
                options={deals.map(d => ({ value: d.id, label: d.title }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="contact_id" label="Contato Vinculado">
              <Select
                placeholder="Selecione o contato"
                allowClear
                options={contacts.map(c => ({
                  value: c.id,
                  label: `${c.first_name} ${c.last_name}`
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="due_date" label="Prazo / Vencimento">
              <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="priority" label="Prioridade">
              <Select
                options={[
                  { value: 'high', label: '🔥 Alta' },
                  { value: 'medium', label: '⚡ Média' },
                  { value: 'low', label: '☕ Baixa' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Detalhes da Tarefa">
          <TextArea rows={3} placeholder="Pauta da conversa, pontos pendentes de fechamento..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
