import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Slider,
  Row,
  Col,
  Button,
  message
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  PercentageOutlined,
  CalendarOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const DealModal = ({
  open,
  record,
  defaultStageId,
  pipelines = [],
  stages = [],
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
          amount: record.amount,
          pipeline_id: record.pipeline_id,
          stage_id: record.stage_id,
          contact_id: record.contact_id,
          assigned_user_id: record.assigned_user_id,
          probability: record.probability ?? 50,
          expected_close_date: record.expected_close_date ? dayjs(record.expected_close_date) : null,
          status: record.status || 'open',
          lost_reason: record.lost_reason || ''
        });
      } else {
        form.resetFields();
        const firstPipe = pipelines[0]?.id;
        form.setFieldsValue({
          pipeline_id: firstPipe,
          stage_id: defaultStageId || stages.find(s => s.pipeline_id === firstPipe)?.id,
          probability: 50,
          status: 'open',
          amount: 1000
        });
      }
    }
  }, [open, record, defaultStageId, pipelines, stages, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        title: values.title.trim(),
        amount: values.amount || 0,
        pipeline_id: values.pipeline_id,
        stage_id: values.stage_id,
        contact_id: values.contact_id,
        assigned_user_id: values.assigned_user_id || null,
        probability: values.probability ?? 50,
        expected_close_date: values.expected_close_date ? values.expected_close_date.toISOString() : null,
        status: values.status || 'open',
        lost_reason: values.lost_reason || null
      };

      if (!record) {
        const res = await apiRequest('/deals', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Oportunidade de negócio criada!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao criar oportunidade');
        }
      } else {
        const res = await apiRequest(`/deals?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Oportunidade atualizada com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar oportunidade');
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
          <DollarOutlined style={{ color: '#10b981' }} />
          <span>{record ? 'Editar Oportunidade Comercial' : 'Nova Oportunidade de Negócio'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Oportunidade' : 'Criar Oportunidade'}
      cancelText="Cancelar"
      width={720}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Título da Oportunidade / Negócio"
          rules={[{ required: true, message: 'Informe o título do negócio' }]}
        >
          <Input placeholder="Ex: Licença Anual Enterprise - Grupo Alpha" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="contact_id"
              label="Contato Principal / Empresa"
              rules={[{ required: true, message: 'Selecione o contato' }]}
            >
              <Select
                placeholder="Selecione o lead/cliente"
                showSearch
                optionFilterProp="label"
                options={contacts.map(c => ({
                  value: c.id,
                  label: `${c.first_name} ${c.last_name}${c.company_name ? ` (${c.company_name})` : ''}`
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="amount"
              label="Valor Estimado (R$)"
              rules={[{ required: true, message: 'Informe o valor' }]}
            >
              <InputNumber
                prefix="R$"
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="pipeline_id"
              label="Funil de Vendas"
              rules={[{ required: true, message: 'Selecione o funil' }]}
            >
              <Select
                placeholder="Selecione o funil"
                options={pipelines.map(p => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="stage_id"
              label="Etapa Atual"
              rules={[{ required: true, message: 'Selecione a etapa' }]}
            >
              <Select
                placeholder="Selecione a etapa"
                options={stages.map(s => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="assigned_user_id" label="Responsável Comercial">
              <Select
                placeholder="Selecione o responsável"
                allowClear
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.full_name || u.email}`
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="expected_close_date" label="Previsão de Fechamento">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="probability" label="Probabilidade de Fechamento (%)">
          <Slider
            marks={{
              0: '0%',
              25: '25%',
              50: '50%',
              75: '75%',
              100: '100%'
            }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="status" label="Status Comercial">
              <Select
                options={[
                  { value: 'open', label: '🔵 Em Negociação (Aberto)' },
                  { value: 'won', label: '🟢 Ganho / Fechado' },
                  { value: 'lost', label: '🔴 Perdido' }
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="lost_reason" label="Motivo da Perda (Se aplicável)">
              <Input placeholder="Ex: Preço, Concorrência, Budget..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
