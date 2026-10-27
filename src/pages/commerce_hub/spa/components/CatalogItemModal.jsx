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
import { AppstoreAddOutlined, DollarOutlined, BarcodeOutlined } from '@ant-design/icons';
import { ITEM_TYPE_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';
import { TusUpload } from '../../../../components/upload/TusUpload';

const { TextArea } = Input;

export const CatalogItemModal = ({
  open,
  record,
  categories = [],
  attachments = [],
  digitalDeliverables = [],
  onCancel,
  onSuccess,
  onAddCategory
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const itemType = Form.useWatch('item_type', form);

  const currentCover = (attachments || []).find(
    a => a.catalog_item_id === record?.id && !a.is_deleted && (a.is_cover || a.attachment_type === 'main_photo' || a.attachment_type === 'product_image')
  );
  const currentDeliverable = (digitalDeliverables || []).find(
    d => d.catalog_item_id === record?.id
  );

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          category_id: record.category_id,
          item_type: record.item_type || 'physical',
          sku: record.sku || '',
          barcode_ean: record.barcode_ean || '',
          unit_of_measure: record.unit_of_measure || 'un',
          price: record.price || 0,
          cost_price: record.cost_price || 0,
          current_stock: record.current_stock || 0,
          minimum_stock: record.minimum_stock || 0,
          track_inventory: record.track_inventory ?? true,
          available_in_pos: record.available_in_pos ?? true,
          available_in_ecommerce: record.available_in_ecommerce ?? false,
          available_in_restaurant: record.available_in_restaurant ?? false,
          description: record.description || '',
          cover_image_url: currentCover?.url || '',
          download_file_url: currentDeliverable?.download_file_url || ''
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          item_type: 'physical',
          unit_of_measure: 'un',
          price: 0,
          cost_price: 0,
          current_stock: 0,
          minimum_stock: 0,
          track_inventory: true,
          available_in_pos: true,
          available_in_ecommerce: false,
          available_in_restaurant: false,
          cover_image_url: '',
          download_file_url: ''
        });
      }
    }
  }, [open, record, currentCover, currentDeliverable, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Math.floor(100 + Math.random() * 900)}`;
      const payload = {
        name: values.name.trim(),
        slug: record?.slug || slug,
        category_id: values.category_id || null,
        item_type: values.item_type || 'physical',
        sku: values.sku?.trim() || null,
        barcode_ean: values.barcode_ean?.trim() || null,
        unit_of_measure: values.unit_of_measure || 'un',
        price: values.price || 0,
        cost_price: values.cost_price || 0,
        current_stock: values.current_stock || 0,
        minimum_stock: values.minimum_stock || 0,
        track_inventory: values.track_inventory ?? true,
        available_in_pos: values.available_in_pos ?? true,
        available_in_ecommerce: values.available_in_ecommerce ?? false,
        available_in_restaurant: values.available_in_restaurant ?? false,
        description: values.description?.trim() || null,
        is_active: true
      };

      let targetId = record?.id;

      if (!record) {
        const res = await apiRequest('/catalog_items', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = Array.isArray(res.data) ? res.data[0] : res.data;
          targetId = created?.id;
        } else {
          message.error(res.data?.message || 'Erro ao cadastrar item');
          setLoading(false);
          return;
        }
      } else {
        const res = await apiRequest(`/catalog_items?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          message.error(res.data?.message || 'Erro ao atualizar item');
          setLoading(false);
          return;
        }
      }

      // Persist Cover Image to catalog_items_attachments via TUSD url
      if (targetId && values.cover_image_url) {
        if (currentCover) {
          if (currentCover.url !== values.cover_image_url) {
            await apiRequest(`/catalog_items_attachments?id=eq.${currentCover.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ url: values.cover_image_url })
            });
          }
        } else {
          await apiRequest('/catalog_items_attachments', {
            method: 'POST',
            body: JSON.stringify({
              catalog_item_id: targetId,
              url: values.cover_image_url,
              attachment_type: 'main_photo',
              is_cover: true,
              display_order: 1,
              is_deleted: false
            })
          });
        }
      }

      // Persist Deliverable for Digital Products
      if (targetId && values.item_type === 'digital' && values.download_file_url) {
        if (currentDeliverable) {
          if (currentDeliverable.download_file_url !== values.download_file_url) {
            await apiRequest(`/digital_item_deliverables?id=eq.${currentDeliverable.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ download_file_url: values.download_file_url })
            });
          }
        } else {
          await apiRequest('/digital_item_deliverables', {
            method: 'POST',
            body: JSON.stringify({
              catalog_item_id: targetId,
              delivery_type: 'direct_download',
              download_file_url: values.download_file_url,
              access_duration_days: 365,
              max_downloads_per_user: 5,
              is_active: true
            })
          });
        }
      }

      message.success(record ? 'Item atualizado com sucesso!' : 'Item cadastrado no catálogo com sucesso!');
      onSuccess();
      onCancel();
    } catch (err) {
      console.error(err);
      message.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreAddOutlined style={{ color: '#0284c7' }} />
          <span>{record ? 'Editar Item do Catálogo' : 'Novo Item no Catálogo Mestre'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={record ? 'Salvar Alterações' : 'Cadastrar Item'}
      cancelText="Cancelar"
      width={760}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="name"
              label="Nome do Item / Produto / Serviço"
              rules={[{ required: true, message: 'Informe o nome do item' }]}
            >
              <Input placeholder="Ex: Camiseta Algodão Orgânico / Consulta Especialista" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="item_type" label="Tipo de Item (Polimórfico)">
              <Select
                options={Object.entries(ITEM_TYPE_CONFIG).map(([k, v]) => ({
                  value: k,
                  label: v.label
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* TUSD Resumable Upload - Foto Principal */}
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="cover_image_url"
              label="Foto / Imagem do Produto (Upload TUSD Resumable)"
            >
              <TusUpload
                placeholder="Selecione ou arraste a imagem do produto..."
                accept="image/*"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* TUSD Resumable Upload - Arquivo Entregável se Digital */}
        {itemType === 'digital' && (
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="download_file_url"
                label="Arquivo Digital / E-book / Download (Upload TUSD Resumable)"
                extra="Arquivo que será entregue e liberado ao cliente após aprovação do pagamento."
              >
                <TusUpload
                  placeholder="Selecione o arquivo digital (PDF, ZIP, EPUB, software)..."
                  accept="*/*"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="category_id"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span>Categoria</span>
                  {onAddCategory && (
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        onAddCategory();
                      }}
                      style={{ fontSize: 12, color: '#0284c7', marginLeft: 8 }}
                    >
                      + Nova Categoria
                    </a>
                  )}
                </div>
              }
            >
              <Select
                placeholder="Selecione a categoria"
                allowClear
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="sku" label="Código SKU">
              <Input placeholder="SKU-10293" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="barcode_ean" label="Código de Barras EAN">
              <Input prefix={<BarcodeOutlined />} placeholder="7891234567890" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="price"
              label="Preço de Venda (R$)"
              rules={[{ required: true, message: 'Informe o preço' }]}
            >
              <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="cost_price" label="Preço de Custo (R$)">
              <InputNumber prefix="R$" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="unit_of_measure" label="Unidade de Medida">
              <Select
                options={[
                  { value: 'un', label: 'un (Unidade)' },
                  { value: 'kg', label: 'kg (Quilograma)' },
                  { value: 'g', label: 'g (Grama)' },
                  { value: 'l', label: 'l (Litro)' },
                  { value: 'ml', label: 'ml (Mililitro)' },
                  { value: 'cx', label: 'cx (Caixa)' },
                  { value: 'hr', label: 'hr (Hora)' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="current_stock" label="Estoque Atual">
              <InputNumber style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="minimum_stock" label="Estoque Mínimo (Alerta)">
              <InputNumber style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="track_inventory" label="Controlar Estoque" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="available_in_pos" label="Disponível no PDV / Balcão" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="available_in_ecommerce" label="Disponível no E-commerce" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="available_in_restaurant" label="Disponível no Cardápio" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Descrição Completa do Item">
          <TextArea rows={3} placeholder="Características técnicas, especificações e detalhes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
