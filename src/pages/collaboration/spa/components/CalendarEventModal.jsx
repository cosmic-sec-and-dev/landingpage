import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, InputNumber, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';
import { EVENT_LOCATIONS } from '../schemaConfig';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export const CalendarEventModal = ({
  visible,
  onClose,
  onSuccess,
  initialValues,
  calendars = [],
  users = [],
  currentUser
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          date_range: [
            initialValues.start_at ? dayjs(initialValues.start_at) : null,
            initialValues.end_at ? dayjs(initialValues.end_at) : null
          ]
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          calendar_id: calendars[0]?.id || null,
          organizer_id: currentUser?.id || null,
          location_type: 'google_meet',
          reminder_minutes_before: 15,
          status: 'confirmed',
          is_all_day: false,
          date_range: [dayjs().add(1, 'hour'), dayjs().add(2, 'hour')]
        });
      }
    }
  }, [visible, initialValues, calendars, currentUser, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        calendar_id: values.calendar_id,
        organizer_id: values.organizer_id || currentUser?.id,
        title: values.title,
        description: values.description,
        location_type: values.location_type,
        meeting_url: values.meeting_url,
        physical_location: values.physical_location,
        start_at: values.date_range?.[0]?.toISOString(),
        end_at: values.date_range?.[1]?.toISOString(),
        is_all_day: values.is_all_day || false,
        reminder_minutes_before: values.reminder_minutes_before || 15,
        status: values.status || 'confirmed'
      };

      let res;
      if (isEditing) {
        res = await apiRequest(`/collaboration_events?id=eq.${initialValues.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/collaboration_events', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(isEditing ? 'Evento atualizado com sucesso!' : 'Evento agendado com sucesso!');
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        message.error(res.error || 'Falha ao salvar evento na agenda');
      }
    } catch {
      // Form validation error
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Reunião / Evento' : 'Agendar Novo Evento ou Reunião'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEditing ? 'Salvar Alterações' : 'Agendar Evento'}
      cancelText="Cancelar"
      width={720}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="title"
              label="Título da Reunião / Compromisso"
              rules={[{ required: true, message: 'Informe o título do evento' }]}
            >
              <Input placeholder="Ex: Daily Sync Engenharia, Sprint Planning, Alinhamento de Produto..." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="calendar_id"
              label="Calendário / Agenda"
              rules={[{ required: true, message: 'Selecione o calendário' }]}
            >
              <Select
                options={calendars.map(c => ({
                  value: c.id,
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: c.color_hex || '#3b82f6',
                          display: 'inline-block'
                        }}
                      />
                      {c.name}
                    </span>
                  )
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="date_range"
              label="Data & Horário (Início - Fim)"
              rules={[{ required: true, message: 'Selecione o período do evento' }]}
            >
              <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="is_all_day" label="Dia Inteiro" valuePropName="checked">
              <Switch checkedChildren="Sim" unCheckedChildren="Não" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="location_type" label="Tipo de Local / Plataforma">
              <Select
                options={EVENT_LOCATIONS.map(l => ({
                  value: l.value,
                  label: l.label
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="meeting_url" label="Link da Reunião Virtual (Google Meet / Zoom)">
              <Input placeholder="https://meet.google.com/xyz-abcd-efg" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="physical_location" label="Local Presencial / Sala de Reunião">
          <Input placeholder="Ex: Sala de Conferência 02 - 3º Andar" />
        </Form.Item>

        <Form.Item name="description" label="Pauta & Descrição">
          <TextArea rows={3} placeholder="Descreva os tópicos a serem discutidos e objetivos da reunião..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="reminder_minutes_before" label="Lembrete com Antecedência (minutos)">
              <InputNumber min={0} max={1440} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status do Evento">
              <Select
                options={[
                  { value: 'confirmed', label: 'Confirmado' },
                  { value: 'tentative', label: 'Provisório' },
                  { value: 'cancelled', label: 'Cancelado' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
