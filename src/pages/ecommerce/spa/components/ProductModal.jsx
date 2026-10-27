import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Row,
  Col,
  Button,
  message
} from 'antd';
import { ShoppingOutlined, DollarOutlined, TagOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const ProductModal = ({
  open,
  record,
  categories = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          category_id: record.category_id,
          sku: record.sku || '',
          price: record.price || 0,
          sale_price: record.attributes_json?.sale_price || record.sale_price || null,
          cost_price: record.cost_price || 0,
          stock_quantity: record.current_stock ?? record.stock_quantity ?? 0,
          is_active: record.is_active ?? true,
          description: record.description || ''
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          price: 0,
          cost_price: 0,
          stock_quantity: 0,
          is_active: true
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Math.floor(100 + Math.random() * 900)}`;
      const payload = {
        name: values.name.trim(),
        slug: record?.slug || slug,
        category_id: values.category_id || null,
        sku: values.sku?.trim() || null,
        price: values.price || 0,
        cost_price: values.cost_price || 0,
        current_stock: values.stock_quantity || 0,
        item_type: 'physical',
        available_in_ecommerce: true,
        available_in_pos: true,
        track_inventory: true,
        is_active: values.is_active ?? true,
        description: values.description?.trim() || null,
        attributes_json: {
          sale_price: values.sale_price || null
        }
      };

      if (!record) {
        const res = await apiRequest('/catalog_items', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Produto adicionado à loja virtual!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao criar produto');
        }
      } else {
        const res = await apiRequest(`/catalog_items?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          message.success('Produto atualizado com sucesso!');
          onSuccess();
          onCancel();
        } else {
          message.error(res.data?.message || 'Erro ao atualizar produto');
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
          <ShoppingOutlined style={{ color: '#0284c7' }} />
          <span>{record ? 'Editar Produto da Loja' : 'Cadastrar Novo Produto na Loja'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Alterações' : 'Cadastrar Produto'}
      cancelText="Cancelar"
      width={720}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="name"
              label="Nome do Produto"
              rules={[{ required: true, message: 'Informe o nome do produto' }]}
            >
              <Input placeholder="Ex: Tênis Esportivo Performance V2" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="category_id" label="Categoria">
              <Select
                placeholder="Selecione a categoria"
                allowClear
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="price"
              label="Preço Regular (R$)"
              rules={[{ required: true, message: 'Informe o preço' }]}
            >
              <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="sale_price" label="Preço Promocional (R$)">
              <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} placeholder="Opcional" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="cost_price" label="Custo Unitário (R$)">
              <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="sku" label="Código SKU">
              <Input placeholder="SKU-PROD-01" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="stock_quantity" label="Quantidade em Estoque">
              <InputNumber style={{ width: '100%' }} min={0} precision={0} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="is_active" label="Produto Ativo na Loja" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Descrição Comercial do Produto">
          <TextArea rows={4} placeholder="Especificações técnicas, benefícios e detalhes do produto..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
