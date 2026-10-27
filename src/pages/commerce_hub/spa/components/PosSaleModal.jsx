import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Row,
  Col,
  Tag,
  Divider,
  message
} from 'antd';
import { ShoppingCartOutlined, PlusOutlined, DeleteOutlined, CreditCardOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

export const PosSaleModal = ({
  open,
  items = [],
  users = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [cart, setCart] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [qtyInput, setQtyInput] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setCart([]);
      setSelectedItemId(null);
      setQtyInput(1);
      form.setFieldsValue({
        origin_channel: 'pos_counter',
        payment_method: 'credit_card',
        discount_amount: 0
      });
    }
  }, [open, form]);

  const handleAddItemToCart = () => {
    if (!selectedItemId) return;
    const itemObj = items.find(i => i.id === selectedItemId);
    if (!itemObj) return;

    const existingIndex = cart.findIndex(c => c.item_id === selectedItemId);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += Number(qtyInput || 1);
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setCart(updated);
    } else {
      const unitPrice = Number(itemObj.price || 0);
      const quantity = Number(qtyInput || 1);
      setCart([...cart, {
        item_id: itemObj.id,
        name: itemObj.name,
        unit_price: unitPrice,
        unit_cost: Number(itemObj.cost_price || 0),
        item_type: itemObj.item_type || 'physical',
        quantity: quantity,
        total: unitPrice * quantity
      }]);
    }
    setSelectedItemId(null);
    setQtyInput(1);
  };

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const grossTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const handleFinish = async (values) => {
    if (cart.length === 0) {
      message.warning('Adicione ao menos um item no carrinho!');
      return;
    }

    setLoading(true);
    try {
      const discount = Number(values.discount_amount || 0);
      const netTotal = Math.max(0, grossTotal - discount);

      // 1. Insert Commerce Order
      const orderPayload = {
        order_number: 'ORD-' + Date.now().toString(36).toUpperCase(),
        origin_channel: values.origin_channel || 'pos_counter',
        customer_name: values.customer_name?.trim() || 'Consumidor Final',
        customer_tax_id: values.customer_tax_id?.trim() || null,
        gross_amount: grossTotal,
        discount_amount: discount,
        tax_amount: 0,
        net_amount: netTotal,
        status: 'completed',
        notes: values.notes || 'Venda direta registrada via PDV'
      };

      const orderRes = await apiRequest('/commerce_orders', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
        message.error(orderRes.data?.message || 'Erro ao registrar venda');
        return;
      }

      const createdOrder = Array.isArray(orderRes.data) ? orderRes.data[0] : orderRes.data;
      const orderId = createdOrder?.id;

      if (orderId) {
        // 2. Insert order items (Trigger handles BOM & stock deduction in ledger)
        for (const itm of cart) {
          await apiRequest('/commerce_order_items', {
            method: 'POST',
            body: JSON.stringify({
              order_id: orderId,
              item_id: itm.item_id,
              item_type: itm.item_type,
              item_name: itm.name,
              quantity: itm.quantity,
              unit_price: itm.unit_price,
              unit_cost: itm.unit_cost,
              discount_amount: 0,
              total_price: itm.total
            })
          });

          // Update item cached current_stock
          const catalogItemObj = items.find(i => i.id === itm.item_id);
          if (catalogItemObj && catalogItemObj.track_inventory) {
            const newStock = Math.max(0, Number(catalogItemObj.current_stock || 0) - itm.quantity);
            await apiRequest(`/catalog_items?id=eq.${catalogItemObj.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ current_stock: newStock })
            });
          }
        }

        // 3. Insert Payment
        await apiRequest('/commerce_order_payments', {
          method: 'POST',
          body: JSON.stringify({
            order_id: orderId,
            payment_method: values.payment_method || 'credit_card',
            amount: netTotal,
            status: 'authorized'
          })
        });
      }

      message.success(`Venda de R$ ${netTotal.toFixed(2)} registrada com baixa em estoque!`);
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
          <ShoppingCartOutlined style={{ color: '#10b981' }} />
          <span>Frente de Caixa (PDV) / Registro de Venda</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={`Finalizar Venda (R$ ${grossTotal.toFixed(2)})`}
      cancelText="Cancelar"
      width={780}
      destroyOnHidden
    >
      <div style={{ padding: '8px 0' }}>
        {/* Item Selector Bar */}
        <div style={{
          display: 'flex',
          gap: 10,
          padding: 12,
          background: 'rgba(2, 132, 199, 0.05)',
          borderRadius: 10,
          marginBottom: 16
        }}>
          <Select
            placeholder="Buscar item no catálogo para adicionar..."
            style={{ flex: 1 }}
            showSearch
            optionFilterProp="label"
            value={selectedItemId}
            onChange={setSelectedItemId}
            options={items.map(i => ({
              value: i.id,
              label: `${i.name} (R$ ${Number(i.price || 0).toFixed(2)} | Estoque: ${Number(i.current_stock || 0).toFixed(0)})`
            }))}
          />

          <InputNumber
            min={1}
            value={qtyInput}
            onChange={setQtyInput}
            style={{ width: 90 }}
            placeholder="Qtd"
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddItemToCart}
            disabled={!selectedItemId}
          >
            Adicionar
          </Button>
        </div>

        {/* Cart Table */}
        <Table
          dataSource={cart}
          rowKey="item_id"
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
          columns={[
            { title: 'Item', dataIndex: 'name', key: 'name' },
            { title: 'Qtd', dataIndex: 'quantity', key: 'quantity', width: 80 },
            {
              title: 'Unitário',
              dataIndex: 'unit_price',
              key: 'unit_price',
              render: val => `R$ ${Number(val).toFixed(2)}`,
              width: 110
            },
            {
              title: 'Subtotal',
              dataIndex: 'total',
              key: 'total',
              render: val => <strong>R$ {Number(val).toFixed(2)}</strong>,
              width: 120
            },
            {
              title: '',
              key: 'actions',
              width: 50,
              render: (_, __, index) => (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFromCart(index)}
                />
              )
            }
          ]}
        />

        <Divider style={{ margin: '14px 0' }} />

        {/* Customer & Payment Form */}
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="customer_name" label="Nome do Cliente">
                <Input placeholder="Consumidor Final" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="payment_method" label="Forma de Pagamento">
                <Select
                  options={[
                    { value: 'credit_card', label: '💳 Cartão de Crédito' },
                    { value: 'debit_card', label: '💳 Cartão de Débito' },
                    { value: 'pix', label: '⚡ PIX Instantâneo' },
                    { value: 'cash', label: '💵 Dinheiro em Espécie' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="discount_amount" label="Desconto Aplicado (R$)">
                <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="origin_channel" label="Canal de Origem">
                <Select
                  options={[
                    { value: 'pos_counter', label: '🏬 Balcão / PDV Físico' },
                    { value: 'ecommerce', label: '🌐 Loja Virtual / Online' },
                    { value: 'whatsapp_orders', label: '📱 Pedido WhatsApp' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};
