import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message
} from 'antd';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export const EventModal = ({
  open,
  record,
  categories = [],
  currentUser,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          title: record.title,
          slug: record.slug,
          description: record.description,
          location_type: record.location_type || 'physical',
          status: record.status || 'draft',
          dates: [
            record.start_date ? dayjs(record.start_date) : null,
            record.end_date ? dayjs(record.end_date) : null
          ]
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          location_type: 'physical',
          status: 'published',
          dates: [dayjs().add(1, 'day'), dayjs().add(1, 'day').add(4, 'hour')]
        });
      }
    }
  }, [open, record, form]);

  const handleTitleChange = (e) => {
    if (!record) {
      const val = e.target.value;
      const slug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      form.setFieldsValue({ slug });
    }
  };

  const handleFinish = async (values) => {
    try {
      const startDate = values.dates && values.dates[0] ? values.dates[0].toISOString() : new Date().toISOString();
      const endDate = values.dates && values.dates[1] ? values.dates[1].toISOString() : new Date().toISOString();

      const payload = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        location_type: values.location_type,
        status: values.status,
        start_date: startDate,
        end_date: endDate
      };

      if (!record && currentUser?.id) {
        payload.organizer_id = currentUser.id;
      }

      let res;
      if (record) {
        res = await apiRequest(`/event_posts?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/event_posts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(record ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar evento');
      }
    } catch {
      message.error('Erro de conexão ao salvar');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Evento' : 'Novo Evento'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar Evento"
      cancelText="Cancelar"
      width={680}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="title"
              label="Título do Evento"
              rules={[{ required: true, message: 'Informe o título do evento' }]}
            >
              <Input placeholder="Ex: Conferência Nacional de Tecnologia 2026" onChange={handleTitleChange} />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item
              name="slug"
              label="Slug (URL amigável)"
              rules={[{ required: true, message: 'Informe o slug' }]}
            >
              <Input placeholder="conferencia-tech-2026" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dates"
              label="Data e Horário (Início - Fim)"
              rules={[{ required: true, message: 'Selecione as datas' }]}
            >
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="location_type"
              label="Formato"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="physical">📍 Presencial</Select.Option>
                <Select.Option value="online">🌐 Online / Ao Vivo</Select.Option>
                <Select.Option value="hybrid">🔄 Híbrido</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="draft">Rascunho</Select.Option>
                <Select.Option value="published">Publicado</Select.Option>
                <Select.Option value="completed">Concluído</Select.Option>
                <Select.Option value="cancelled">Cancelado</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Descrição do Evento & Programação"
          rules={[{ required: true, message: 'Informe a descrição do evento' }]}
        >
          <TextArea rows={4} placeholder="Detalhes, palestrantes, atrações e informações importantes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
