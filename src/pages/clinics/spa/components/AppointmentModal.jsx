import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Row,
  Col,
  message
} from 'antd';
import {
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const AppointmentModal = ({
  open,
  record,
  professionals = [],
  services = [],
  rooms = [],
  users = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (record) {
        const appDate = record.appointment_date ? dayjs(record.appointment_date) : dayjs();
        const startTime = record.start_time ? dayjs(record.start_time) : dayjs('09:00:00', 'HH:mm:ss');
        const endTime = record.end_time ? dayjs(record.end_time) : dayjs('09:30:00', 'HH:mm:ss');

        form.setFieldsValue({
          customer_user_id: record.customer_user_id || record.patient_user_id,
          professional_id: record.professional_id,
          service_item_id: record.service_item_id || record.service_id,
          room_id: record.room_id,
          appointment_date: appDate,
          time_range: [startTime, endTime],
          status: record.status || 'scheduled',
          price_charged: Number(record.price_charged ?? record.total_amount ?? 0),
          discount_amount: Number(record.discount_amount || 0),
          final_amount: Number(record.final_amount ?? record.total_amount ?? 0),
          payment_status: record.payment_status || 'pending',
          customer_notes: record.customer_notes || record.notes || '',
          internal_notes: record.internal_notes || ''
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'scheduled',
          payment_status: 'pending',
          appointment_date: dayjs(),
          time_range: [dayjs('09:00', 'HH:mm'), dayjs('09:30', 'HH:mm')],
          price_charged: 0,
          discount_amount: 0,
          final_amount: 0
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const appDateStr = values.appointment_date
        ? values.appointment_date.format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

      const startTimeStr = values.time_range
        ? values.time_range[0].format('HH:mm:ss')
        : '09:00:00';
      const endTimeStr = values.time_range
        ? values.time_range[1].format('HH:mm:ss')
        : '09:30:00';

      const startIso = dayjs(`${appDateStr}T${startTimeStr}`).toISOString();
      const endIso = dayjs(`${appDateStr}T${endTimeStr}`).toISOString();

      const priceCharged = Number(values.price_charged || 0);
      const discount = Number(values.discount_amount || 0);
      const finalAmt = Number(values.final_amount ?? (priceCharged - discount));

      const payload = {
        customer_user_id: values.customer_user_id,
        professional_id: values.professional_id,
        service_item_id: values.service_item_id,
        room_id: values.room_id || null,
        appointment_date: appDateStr,
        start_time: startIso,
        end_time: endIso,
        status: values.status || 'scheduled',
        price_charged: priceCharged,
        discount_amount: discount,
        final_amount: finalAmt > 0 ? finalAmt : 0,
        payment_status: values.payment_status || 'pending',
        customer_notes: values.customer_notes || null,
        internal_notes: values.internal_notes || null
      };

      if (!record) {
        const res = await apiRequest('/clinic_appointments', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Agendamento clínico criado com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao criar agendamento');
        }
      } else {
        const res = await apiRequest(`/clinic_appointments?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Agendamento atualizado com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar agendamento');
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
          <CalendarOutlined style={{ color: '#0284c7' }} />
          <span>{record ? 'Editar Agendamento Clínico' : 'Novo Agendamento Clínico'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Alterações' : 'Confirmar Agendamento'}
      cancelText="Cancelar"
      width={720}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="professional_id"
              label="Profissional Responsável"
              rules={[{ required: true, message: 'Selecione o profissional' }]}
            >
              <Select
                placeholder="Selecione o profissional"
                showSearch
                optionFilterProp="label"
                options={professionals.map(p => {
                  const userMatch = users.find(u => u.id === p.user_id);
                  const name = userMatch
                    ? `${p.title_prefix || 'Dr(a).'} ${userMatch.full_name || userMatch.email}`
                    : p.id.substring(0, 8);
                  return { value: p.id, label: name };
                })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="customer_user_id"
              label="Paciente / Cliente"
              rules={[{ required: true, message: 'Selecione o paciente' }]}
            >
              <Select
                placeholder="Selecione o paciente cadastrado"
                showSearch
                optionFilterProp="label"
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.full_name || u.email} (${u.phone_number || 'Sem tel'})`
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="service_item_id"
              label="Procedimento / Serviço Canônico"
              rules={[{ required: true, message: 'Selecione o serviço' }]}
            >
              <Select
                placeholder="Selecione o procedimento (Catálogo Mestre)"
                showSearch
                optionFilterProp="label"
                allowClear
                options={services.map(s => ({
                  value: s.id,
                  label: `${s.name} - R$ ${Number(s.price || s.base_price || 0).toFixed(2)}`
                }))}
                onChange={(val) => {
                  const selectedSvc = services.find(s => s.id === val);
                  if (selectedSvc) {
                    const price = Number(selectedSvc.price || selectedSvc.base_price || 0);
                    form.setFieldsValue({
                      price_charged: price,
                      final_amount: price
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="room_id" label="Sala / Consultório">
              <Select
                placeholder="Selecione a sala de atendimento"
                allowClear
                options={rooms.map(r => ({
                  value: r.id,
                  label: `${r.name} (${r.room_type || 'Sala'})`
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="appointment_date"
              label="Data da Consulta"
              rules={[{ required: true, message: 'Informe a data' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="time_range"
              label="Horário (Início - Fim)"
              rules={[{ required: true, message: 'Informe o horário' }]}
            >
              <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} minuteStep={5} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="status" label="Status do Atendimento">
              <Select
                options={[
                  { value: 'scheduled', label: '📅 Agendado' },
                  { value: 'confirmed', label: '✅ Confirmado' },
                  { value: 'in_progress', label: '🩺 Em Atendimento' },
                  { value: 'completed', label: '🏆 Concluído (Gera Fatura Hub)' },
                  { value: 'cancelled', label: '❌ Cancelado' },
                  { value: 'no_show', label: '⚠️ Não Compareceu' }
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item name="price_charged" label="Preço (R$)">
              <InputNumber
                prefix="R$"
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                onChange={(val) => {
                  const discount = form.getFieldValue('discount_amount') || 0;
                  form.setFieldsValue({ final_amount: Math.max(0, (val || 0) - discount) });
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item name="final_amount" label="Valor Final (R$)">
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

        <Form.Item name="customer_notes" label="Observações do Paciente">
          <TextArea rows={2} placeholder="Sintomas relatados, queixas prévias..." />
        </Form.Item>

        <Form.Item name="internal_notes" label="Notas Internas da Equipe">
          <TextArea rows={2} placeholder="Orientações médicas, restrições ou alertas da equipe..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default AppointmentModal;
