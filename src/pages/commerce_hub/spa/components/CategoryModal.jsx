import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Button, message } from 'antd';
import { FolderAddOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';
import { TusUpload } from '../../../../components/upload/TusUpload';

const { TextArea } = Input;

export const CategoryModal = ({
  open,
  record,
  categories = [],
  categoryAttachments = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(record?.id);

  const currentAttachment = (categoryAttachments || []).find(
    a => a.catalog_category_id === record?.id && !a.is_deleted
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (record) {
        form.setFieldsValue({
          name: record.name,
          parent_id: record.parent_id || undefined,
          description: record.description || '',
          icon_url: record.icon_url || currentAttachment?.url || '',
          display_order: record.display_order ?? 0,
          is_active: record.is_active ?? true
        });
      } else {
        form.setFieldsValue({
          display_order: (categories.length || 0) + 1,
          is_active: true,
          icon_url: ''
        });
      }
    }
  }, [open, record, categories, currentAttachment, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const slugBase = values.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const slug = record?.slug || `${slugBase}-${Math.floor(100 + Math.random() * 900)}`;

      const payload = {
        name: values.name.trim(),
        slug: slug,
        parent_id: values.parent_id || null,
        description: values.description?.trim() || null,
        icon_url: values.icon_url?.trim() || null,
        display_order: values.display_order ?? 0,
        is_active: values.is_active ?? true
      };

      let catId = record?.id;

      if (!isEditing) {
        const res = await apiRequest('/catalog_categories', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = Array.isArray(res.data) ? res.data[0] : res.data;
          catId = created?.id;
        } else {
          message.error(res.data?.message || 'Erro ao cadastrar categoria');
          setLoading(false);
          return;
        }
      } else {
        const res = await apiRequest(`/catalog_categories?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          message.error(res.data?.message || 'Erro ao atualizar categoria');
          setLoading(false);
          return;
        }
      }

      // Persist to catalog_categories_attachments using TUSD url
      if (catId && values.icon_url) {
        if (currentAttachment) {
          if (currentAttachment.url !== values.icon_url) {
            await apiRequest(`/catalog_categories_attachments?id=eq.${currentAttachment.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ url: values.icon_url })
            });
          }
        } else {
          await apiRequest('/catalog_categories_attachments', {
            method: 'POST',
            body: JSON.stringify({
              catalog_category_id: catId,
              url: values.icon_url,
              attachment_type: 'icon',
              display_order: 1,
              is_deleted: false
            })
          });
        }
      }

      message.success(isEditing ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
      onSuccess();
      onCancel();
    } catch (err) {
      console.error(err);
      message.error('Erro de conexão ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const eligibleParents = categories.filter(c => !record || c.id !== record.id);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderAddOutlined style={{ color: '#0284c7', fontSize: 20 }} />
          <span>{isEditing ? 'Editar Categoria do Catálogo' : 'Nova Categoria de Catálogo'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label="Nome da Categoria"
          rules={[{ required: true, message: 'Informe o nome da categoria' }]}
        >
          <Input placeholder="Ex: Bebidas Artesanais, Alimentos, Consultoria..." />
        </Form.Item>

        <Form.Item
          name="parent_id"
          label="Categoria Pai (Opcional - Subcategoria)"
        >
          <Select
            placeholder="Nenhuma (Categoria Raiz)"
            allowClear
            options={eligibleParents.map(c => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        {/* TUSD Resumable Upload - Ícone / Imagem da Categoria */}
        <Form.Item
          name="icon_url"
          label="Ícone / Banner da Categoria (Upload TUSD Resumable)"
        >
          <TusUpload
            placeholder="Selecione um ícone/imagem ou insira a URL..."
            accept="image/*"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <TextArea rows={3} placeholder="Descreva os tipos de produtos pertencentes a esta categoria..." />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Form.Item
            name="display_order"
            label="Ordem de Exibição"
            style={{ flex: 1 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Categoria Ativa"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#0284c7' }}>
            {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
