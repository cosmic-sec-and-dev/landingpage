import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Row,
  Col,
  message
} from 'antd';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const VisitModal = ({
  open,
  record,
  defaultPropertyId,
  properties = [],
  clients = [],
  agents = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          property_id: record.property_id,
          client_id: record.client_id,
          agent_id: record.agent_id,
          scheduled_at: record.scheduled_at ? dayjs(record.scheduled_at) : null,
          status: record.status || 'scheduled',
          feedback: record.feedback
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          property_id: defaultPropertyId || (properties[0] ? properties[0].id : undefined),
          agent_id: agents[0] ? agents[0].id : undefined,
          scheduled_at: dayjs().add(1, 'day').set('hour', 14).set('minute', 0),
          status: 'scheduled'
        });
      }
    }
  }, [open, record, defaultPropertyId, properties, agents, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        property_id: values.property_id,
        client_id: values.client_id,
        agent_id: values.agent_id,
        scheduled_at: values.scheduled_at ? values.scheduled_at.toISOString() : new Date().toISOString(),
        status: values.status,
        feedback: values.feedback || null
      };

      let res;
      if (record) {
        res = await apiRequest(`/visits?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/visits', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(record ? 'Visita atualizada!' : 'Visita agendada com sucesso!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar visita');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Visita' : 'Agendar Visita ao Imóvel'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar Agendamento"
      cancelText="Cancelar"
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="property_id"
          label="Imóvel Selecionado"
          rules={[{ required: true, message: 'Selecione o imóvel' }]}
        >
          <Select placeholder="Selecione o imóvel">
            {properties.map(p => (
              <Select.Option key={p.id} value={p.id}>
                {p.title} (R$ {Number(p.price).toLocaleString('pt-BR')})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="client_id"
              label="Cliente Interessado"
              rules={[{ required: true, message: 'Selecione o cliente' }]}
            >
              <Select placeholder="Selecione o cliente">
                {clients.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.full_name} ({c.phone})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="agent_id"
              label="Corretor Acompanhante"
              rules={[{ required: true, message: 'Selecione o corretor' }]}
            >
              <Select placeholder="Selecione o corretor">
                {agents.map(ag => (
                  <Select.Option key={ag.id} value={ag.id}>
                    CRECI {ag.license_number}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="scheduled_at"
              label="Data e Horário da Visita"
              rules={[{ required: true, message: 'Selecione a data' }]}
            >
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="status" label="Status da Visita" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="scheduled">Agendada</Select.Option>
                <Select.Option value="completed">Realizada</Select.Option>
                <Select.Option value="cancelled">Cancelada</Select.Option>
                <Select.Option value="no_show">Não compareceu</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="feedback" label="Parecer / Feedback do Cliente">
          <TextArea rows={3} placeholder="Gostou da planta, achou o valor alto, fez proposta..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
