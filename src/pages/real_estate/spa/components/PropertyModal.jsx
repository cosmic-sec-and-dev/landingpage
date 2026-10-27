import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  message
} from 'antd';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const PropertyModal = ({
  open,
  record,
  agents = [],
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          title: record.title,
          description: record.description,
          property_type: record.property_type || 'apartment',
          listing_type: record.listing_type || 'sale',
          price: record.price,
          condo_fee: record.condo_fee,
          tax_fee: record.tax_fee,
          bedrooms: record.bedrooms,
          bathrooms: record.bathrooms,
          suites: record.suites,
          parking_spots: record.parking_spots,
          total_area: record.total_area,
          built_area: record.built_area,
          agent_id: record.agent_id,
          status: record.status || 'available'
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          property_type: 'apartment',
          listing_type: 'sale',
          status: 'available',
          price: 500000,
          bedrooms: 2,
          bathrooms: 2,
          suites: 1,
          parking_spots: 1,
          total_area: 80,
          built_area: 70
        });
      }
    }
  }, [open, record, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        property_type: values.property_type,
        listing_type: values.listing_type,
        price: values.price,
        condo_fee: values.condo_fee || 0,
        tax_fee: values.tax_fee || 0,
        bedrooms: values.bedrooms || 0,
        bathrooms: values.bathrooms || 0,
        suites: values.suites || 0,
        parking_spots: values.parking_spots || 0,
        total_area: values.total_area || 0,
        built_area: values.built_area || 0,
        agent_id: values.agent_id || null,
        status: values.status
      };

      let res;
      if (record) {
        res = await apiRequest(`/properties?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/properties', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        message.success(record ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!');
        onSuccess();
        onCancel();
      } else {
        message.error(res.error || 'Erro ao salvar imóvel');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Modal
      title={record ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar Imóvel"
      cancelText="Cancelar"
      width={780}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="title"
              label="Título do Imóvel"
              rules={[{ required: true, message: 'Informe o título' }]}
            >
              <Input placeholder="Ex: Apartamento 3 Quartos c/ Varanda Gourmet nos Jardins" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="agent_id" label="Corretor Responsável">
              <Select placeholder="Selecione o corretor" allowClear>
                {agents.map(ag => (
                  <Select.Option key={ag.id} value={ag.id}>
                    CRECI {ag.license_number} ({ag.phone})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="listing_type" label="Finalidade" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="sale">Venda</Select.Option>
                <Select.Option value="rent">Locação</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item name="property_type" label="Tipo do Imóvel" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="apartment">🏢 Apartamento</Select.Option>
                <Select.Option value="house">🏡 Casa</Select.Option>
                <Select.Option value="commercial">🏬 Comercial</Select.Option>
                <Select.Option value="land">📐 Terreno</Select.Option>
                <Select.Option value="penthouse">🌇 Cobertura</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item name="price" label="Preço (R$)" rules={[{ required: true, message: 'Informe o valor' }]}>
              <InputNumber min={0} precision={2} prefix="R$" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="available">Disponível</Select.Option>
                <Select.Option value="reserved">Reservado</Select.Option>
                <Select.Option value="sold">Vendido</Select.Option>
                <Select.Option value="rented">Alugado</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={4}>
            <Form.Item name="bedrooms" label="Quartos">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="suites" label="Suítes">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="bathrooms" label="Banheiros">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="parking_spots" label="Vagas">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="total_area" label="Área Total (m²)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="built_area" label="Área Útil (m²)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Descrição Detalhada & Diferenciais"
          rules={[{ required: true, message: 'Informe a descrição do imóvel' }]}
        >
          <TextArea rows={4} placeholder="Acabamentos, mobília, posição solar, comodidades do condomínio..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
