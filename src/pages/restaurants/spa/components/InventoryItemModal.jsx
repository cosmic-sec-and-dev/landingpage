import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  message
} from 'antd';
import { apiRequest } from '../../../../services/api';
import { UNIT_OF_MEASURE_OPTIONS } from '../schemaConfig';

export const InventoryItemModal = ({
  open,
  record,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          sku: record.sku,
          unit_of_measure: record.unit_of_measure || 'kg',
          current_stock: record.current_stock,
          minimum_stock: record.minimum_stock,
          cost_per_unit: record.cost_price ?? record.cost_per_unit ?? 0,
          supplier_name: record.attributes_json?.supplier_name || record.supplier_name || '',
          is_active: record.is_active ?? true
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          unit_of_measure: 'kg',
          current_stock: 10,
          minimum_stock: 5,
          cost_per_unit: 0,
          is_active: true
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    try {
      const generatedSlug = (values.name || 'insumo')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const payload = {
        name: values.name,
        slug: record?.slug || `${generatedSlug}-${Date.now().toString(36)}`,
        sku: values.sku || null,
        unit_of_measure: values.unit_of_measure,
        current_stock: values.current_stock || 0,
        minimum_stock: values.minimum_stock || 0,
        cost_price: values.cost_per_unit || 0,
        item_type: 'raw_material',
        track_inventory: true,
        available_in_restaurant: false,
        is_active: values.is_active ?? true,
        attributes_json: {
          supplier_name: values.supplier_name || null
        }
      };

      let res;
      if (record) {
        res = await apiRequest(`/catalog_items?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/catalog_items', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(record ? 'Insumo atualizado!' : 'Ingrediente cadastrado no estoque!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar insumo');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Insumo / Ingrediente' : 'Novo Ingrediente no Estoque'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar Insumo"
      cancelText="Cancelar"
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Nome do Ingrediente / Insumo"
              rules={[{ required: true, message: 'Informe o nome' }]}
            >
              <Input placeholder="Ex: Queijo Parmesão Ralado / Filé Mignon" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="sku" label="Código SKU / Ref">
              <Input placeholder="ING-001" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="unit_of_measure"
              label="Unidade de Medida"
              rules={[{ required: true }]}
            >
              <Select options={UNIT_OF_MEASURE_OPTIONS} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="current_stock"
              label="Estoque Atual"
              rules={[{ required: true, message: 'Informe a quantidade' }]}
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="minimum_stock" label="Estoque Mínimo">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="cost_per_unit" label="Custo Unitário (R$)">
              <InputNumber min={0} precision={2} prefix="R$" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="supplier_name" label="Fornecedor Principal">
              <Input placeholder="Distribuidora de Carnes e Queijos..." />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="is_active" label="Insumo Ativo" valuePropName="checked">
          <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
