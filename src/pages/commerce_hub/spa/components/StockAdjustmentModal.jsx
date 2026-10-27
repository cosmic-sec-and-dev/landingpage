import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  message
} from 'antd';
import { StockOutlined, DollarOutlined, SwapOutlined } from '@ant-design/icons';
import { STOCK_MOVEMENT_TYPES } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const StockAdjustmentModal = ({
  open,
  defaultItemId,
  items = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        catalog_item_id: defaultItemId || undefined,
        movement_type: 'purchase_receipt',
        quantity_delta: 1,
        unit_cost: 0
      });
    }
  }, [open, defaultItemId, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const selectedItem = items.find(i => i.id === values.catalog_item_id);
      const isNegative = ['sale_deduction', 'recipe_bom_deduction', 'loss_wastage'].includes(values.movement_type);
      const absQty = Math.abs(values.quantity_delta || 1);
      const finalDelta = isNegative ? -absQty : absQty;
      const unitCost = Number(values.unit_cost || selectedItem?.cost_price || 0);
      const totalCost = Math.abs(finalDelta) * unitCost;

      // 1. Insert Movement in master inventory ledger
      const movPayload = {
        item_id: values.catalog_item_id,
        movement_type: values.movement_type,
        quantity: finalDelta,
        unit_cost: unitCost,
        total_cost: totalCost,
        batch_lot_number: values.batch_lot_number?.trim() || null,
        notes: values.reason_notes?.trim() || 'Ajuste operacional de estoque',
        idempotency_hash: 'ADJ-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8)
      };

      const movRes = await apiRequest('/master_inventory_ledger_movements', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(movPayload)
      });

      if (!movRes.ok) {
        message.error(movRes.data?.message || 'Erro ao registrar movimentação');
        return;
      }

      // 2. Update current_stock in catalog_items
      if (selectedItem) {
        const newStock = Math.max(0, Number(selectedItem.current_stock || 0) + finalDelta);
        await apiRequest(`/catalog_items?id=eq.${selectedItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ current_stock: newStock })
        });
      }

      message.success('Movimentação de estoque lançada no livro-razão!');
      onSuccess();
      onCancel();
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
          <SwapOutlined style={{ color: '#0284c7' }} />
          <span>Lançamento no Livro-Razão de Estoque</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Confirmar Lançamento"
      cancelText="Cancelar"
      width={640}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Form.Item
          name="catalog_item_id"
          label="Item do Catálogo"
          rules={[{ required: true, message: 'Selecione o item' }]}
        >
          <Select
            placeholder="Selecione o produto ou insumo"
            showSearch
            optionFilterProp="label"
            options={items.map(i => ({
              value: i.id,
              label: `${i.name} (Estoque Atual: ${Number(i.current_stock || 0).toFixed(2)} ${i.unit_of_measure})`
            }))}
            onChange={(itemId) => {
              const itm = items.find(i => i.id === itemId);
              if (itm && itm.cost_price) {
                form.setFieldsValue({ unit_cost: Number(itm.cost_price) });
              }
            }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="movement_type"
              label="Tipo de Movimentação"
              rules={[{ required: true, message: 'Selecione o tipo' }]}
            >
              <Select options={STOCK_MOVEMENT_TYPES} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="quantity_delta"
              label="Quantidade da Movimentação"
              rules={[{ required: true, message: 'Informe a quantidade' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0.001} precision={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="unit_cost" label="Custo Unitário (R$)">
              <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="batch_lot_number" label="Lote / Nota Fiscal">
              <Input placeholder="Ex: NF-09823 / LOTE-2026-A" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="reason_notes" label="Justificativa / Motivo do Lançamento">
          <TextArea rows={2} placeholder="Ex: Recebimento de carga do fornecedor, quebra durante transporte..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
