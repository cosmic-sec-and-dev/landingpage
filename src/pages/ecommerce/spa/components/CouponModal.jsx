import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Button,
  message
} from 'antd';
import { TagOutlined, PercentageOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';

export const CouponModal = ({
  open,
  record,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          code: record.code,
          discount_type: record.discount_type || 'percentage',
          discount_value: record.discount_value || 0,
          min_order_amount: record.min_order_amount || 0,
          max_uses: record.max_uses || null,
          valid_range: record.valid_from && record.valid_until
            ? [dayjs(record.valid_from), dayjs(record.valid_until)]
            : null
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          discount_type: 'percentage',
          discount_value: 10,
          min_order_amount: 0
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const validFrom = values.valid_range ? values.valid_range[0].toISOString() : null;
      const validUntil = values.valid_range ? values.valid_range[1].toISOString() : null;

      const payload = {
        code: values.code.trim().toUpperCase(),
        discount_type: values.discount_type || 'percentage',
        discount_value: values.discount_value || 0,
        min_order_amount: values.min_order_amount || 0,
        max_uses: values.max_uses || null,
        valid_from: validFrom,
        valid_until: validUntil,
        is_active: true
      };

      if (!record) {
        const res = await apiRequest('/coupons', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Cupom promocional criado!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao criar cupom');
        }
      } else {
        const res = await apiRequest(`/coupons?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Cupom atualizado!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar cupom');
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
          <TagOutlined style={{ color: '#10b981' }} />
          <span>{record ? 'Editar Cupom' : 'Novo Cupom Promocional'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Cupom' : 'Criar Cupom'}
      cancelText="Cancelar"
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Form.Item
          name="code"
          label="Código do Cupom"
          rules={[{ required: true, message: 'Informe o código do cupom' }]}
        >
          <Input placeholder="Ex: BEMVINDO10 / BLACKFRIDAY" style={{ textTransform: 'uppercase', fontWeight: 700 }} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="discount_type" label="Tipo de Desconto">
              <Select
                options={[
                  { value: 'percentage', label: '📊 Porcentagem (%)' },
                  { value: 'fixed', label: '💵 Valor Fixo (R$)' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="discount_value"
              label="Valor do Desconto"
              rules={[{ required: true, message: 'Informe o valor' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="min_order_amount" label="Pedido Mínimo (R$)">
              <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="max_uses" label="Limite Máximo de Usos">
              <InputNumber style={{ width: '100%' }} min={1} placeholder="Ilimitado" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="valid_range" label="Período de Validade (Início - Fim)">
          <DatePicker.RangePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
