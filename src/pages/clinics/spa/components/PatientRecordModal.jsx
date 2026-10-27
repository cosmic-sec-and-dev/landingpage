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
import {
  FileProtectOutlined,
  MedicineBoxOutlined,
  UserOutlined
} from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const PatientRecordModal = ({
  open,
  record,
  appointment,
  professionals = [],
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
          patient_user_id: record.patient_user_id,
          professional_id: record.professional_id,
          record_type: record.record_type || 'consultation',
          chief_complaint: record.chief_complaint || '',
          diagnosis: record.diagnosis || '',
          prescription: record.prescription || '',
          clinical_notes: record.clinical_notes || ''
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          patient_user_id: appointment?.patient_user_id || undefined,
          professional_id: appointment?.professional_id || undefined,
          record_type: 'consultation'
        });
      }
    }
  }, [open, record, appointment, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        patient_user_id: values.patient_user_id,
        professional_id: values.professional_id,
        appointment_id: appointment?.id || record?.appointment_id || null,
        record_type: values.record_type || 'consultation',
        chief_complaint: values.chief_complaint || null,
        diagnosis: values.diagnosis || null,
        prescription: values.prescription || null,
        clinical_notes: values.clinical_notes || null
      };

      if (!record) {
        const res = await apiRequest('/clinic_patient_records', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Evolução clínica registrada no prontuário!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao registrar evolução');
        }
      } else {
        const res = await apiRequest(`/clinic_patient_records?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Prontuário atualizado com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar prontuário');
        }
      }
    } catch {
      message.error('Erro de conexão ao salvar prontuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileProtectOutlined style={{ color: '#10b981' }} />
          <span>{record ? 'Editar Registro Clínico' : 'Novo Registro de Prontuário / Evolução'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Salvar no Prontuário"
      cancelText="Cancelar"
      width={760}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="patient_user_id"
              label="Paciente"
              rules={[{ required: true, message: 'Selecione o paciente' }]}
            >
              <Select
                placeholder="Selecione o paciente"
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
                  const name = userMatch ? `${p.title_prefix || 'Dr(a).'} ${userMatch.full_name || userMatch.email}` : p.id.substring(0, 8);
                  return { value: p.id, label: name };
                })}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="record_type" label="Tipo de Registro Clínico">
          <Select
            options={[
              { value: 'consultation', label: '🩺 Consulta / Anamnese Inicial' },
              { value: 'evolution', label: '📈 Evolução do Tratamento' },
              { value: 'procedure', label: '💉 Procedimento Realizado' },
              { value: 'exam_result', label: '📑 Laudo / Resultado de Exame' },
              { value: 'aesthetic_session', label: '✨ Sessão de Estética' }
            ]}
          />
        </Form.Item>

        <Form.Item name="chief_complaint" label="Queixa Principal / Motivo da Visita">
          <Input placeholder="Ex: Dor lombar intensa há 3 dias, busca avaliação estética..." />
        </Form.Item>

        <Form.Item name="diagnosis" label="Diagnóstico / Avaliação Clínica">
          <TextArea rows={2} placeholder="Avaliação dos sintomas, hipótese diagnóstica ou CID..." />
        </Form.Item>

        <Form.Item name="prescription" label="Prescrição / Plano Terapêutico">
          <TextArea rows={3} placeholder="Medicamentos prescritos, dosagens, horários e recomendações terapêuticas..." />
        </Form.Item>

        <Form.Item name="clinical_notes" label="Anotações Confidenciais do Profissional">
          <TextArea rows={3} placeholder="Observações de evolução, alertas médicos e dados de acompanhamento..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
