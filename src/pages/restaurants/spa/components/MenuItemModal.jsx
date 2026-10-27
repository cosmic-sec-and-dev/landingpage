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

const { TextArea } = Input;

export const MenuItemModal = ({
  open,
  record,
  categories = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          slug: record.slug,
          category_id: record.category_id,
          price: record.price,
          cost_price: record.cost_price,
          preparation_time_minutes: record.attributes_json?.preparation_time_minutes || record.preparation_time_minutes || 15,
          calories: record.attributes_json?.calories || record.calories,
          allergens_info: record.attributes_json?.allergens_info || record.allergens_info,
          description: record.description,
          is_available: record.is_active ?? record.is_available ?? true
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          category_id: categories[0] ? categories[0].id : undefined,
          price: 25,
          cost_price: 10,
          preparation_time_minutes: 15,
          is_available: true
        });
      }
    }
  }, [open, record, categories, form]);

  const handleNameChange = (e) => {
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
      const payload = {
        name: values.name,
        slug: values.slug,
        category_id: values.category_id || null,
        price: values.price,
        cost_price: values.cost_price || 0,
        item_type: 'manufactured',
        available_in_restaurant: true,
        available_in_pos: true,
        is_active: values.is_available ?? true,
        description: values.description || null,
        attributes_json: {
          preparation_time_minutes: values.preparation_time_minutes || 15,
          calories: values.calories || null,
          allergens_info: values.allergens_info || null
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
        message.success(record ? 'Item atualizado com sucesso!' : 'Item adicionado ao cardápio!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar item do cardápio');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Item do Cardápio' : 'Novo Prato / Bebida no Cardápio'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar no Cardápio"
      cancelText="Cancelar"
      width={680}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="name"
              label="Nome do Prato / Bebida"
              rules={[{ required: true, message: 'Informe o nome' }]}
            >
              <Input placeholder="Ex: Risoto de Cogumelos Trufado" onChange={handleNameChange} />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item
              name="slug"
              label="Slug do Item"
              rules={[{ required: true, message: 'Informe o slug' }]}
            >
              <Input placeholder="risoto-cogumelos-trufado" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="category_id" label="Categoria do Menu">
              <Select placeholder="Selecione a categoria">
                {categories.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="price"
              label="Preço de Venda (R$)"
              rules={[{ required: true, message: 'Informe o preço' }]}
            >
              <InputNumber min={0} precision={2} prefix="R$" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="cost_price" label="Custo Estimado (R$)">
              <InputNumber min={0} precision={2} prefix="R$" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="preparation_time_minutes" label="Tempo de Preparo (min)">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="calories" label="Calorias (kcal)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="allergens_info" label="Alérgenos">
              <Input placeholder="Glúten, lactose, nozes..." />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Descrição dos Ingredientes & Apresentação">
          <TextArea rows={3} placeholder="Acompanhamentos, ponto da carne, molhos especiais..." />
        </Form.Item>

        <Form.Item name="is_available" label="Item Disponível para Pedidos" valuePropName="checked">
          <Switch checkedChildren="Disponível" unCheckedChildren="Indisponível / Esgotado" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
