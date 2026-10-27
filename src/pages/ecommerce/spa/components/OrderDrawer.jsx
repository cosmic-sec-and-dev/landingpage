import React from 'react';
import {
  Drawer,
  Tag,
  Typography,
  Table,
  Row,
  Col,
  Space,
  Button,
  Divider,
  Select,
  message
} from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { ORDER_STATUS_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title, Paragraph } = Typography;

export const OrderDrawer = ({
  open,
  order,
  orderItems = [],
  products = [],
  users = [],
  onClose,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  if (!order) return null;

  const customer = users.find(u => u.id === (order.customer_user_id || order.customer_id)) || { full_name: order.customer_name };
  const items = orderItems.filter(i => i.order_id === order.id);
  const statusCfg = ORDER_STATUS_CONFIG[order.status] || { color: 'blue', label: order.status };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await apiRequest(`/commerce_orders?id=eq.${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        message.success(`Status alterado com sucesso!`);
        onRefresh();
      } else {
        message.error('Erro ao atualizar status');
      }
    } catch {
      message.error('Erro ao atualizar status');
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
          <div>
            <Tag color="geekblue" style={{ fontWeight: 700 }}>{order.order_number}</Tag>
            <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 8 }}>Pedido de Compra</span>
          </div>
          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
        </div>
      }
      placement="right"
      width={680}
      open={open}
      onClose={onClose}
    >
      <div style={{
        padding: '12px 16px',
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#f8fafc',
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 13
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <p style={{ margin: '3px 0' }}>👤 <strong>Cliente:</strong> {customer ? (customer.full_name || customer.email) : (order.customer_name || 'Não identificado')}</p>
            <p style={{ margin: '3px 0' }}>📅 <strong>Data da Compra:</strong> {dayjs(order.created_at).format('DD/MM/YYYY HH:mm')}</p>
          </Col>
          <Col span={12}>
            <p style={{ margin: '3px 0' }}>📦 <strong>Status Atual:</strong></p>
            <Select
              value={order.status}
              onChange={handleUpdateStatus}
              style={{ width: 180 }}
              options={[
                { value: 'pending', label: '⏳ Pendente' },
                { value: 'authorized', label: '💳 Autorizado' },
                { value: 'completed', label: '✅ Concluído' },
                { value: 'cancelled', label: '❌ Cancelado' },
                { value: 'refunded', label: '↩️ Reembolsado' }
              ]}
            />
          </Col>
        </Row>
      </div>

      <Divider>Itens do Pedido</Divider>

      <Table
        dataSource={items}
        rowKey="id"
        pagination={false}
        size="small"
        columns={[
          {
            title: 'Produto',
            dataIndex: 'item_id',
            key: 'prod',
            render: (iid, record) => {
              const targetId = iid || record.product_id;
              const p = products.find(prod => prod.id === targetId);
              return <strong>{p ? p.name : (record.item_name || targetId)}</strong>;
            }
          },
          { title: 'Qtd', dataIndex: 'quantity', key: 'qty', width: 70 },
          {
            title: 'Unitário',
            dataIndex: 'unit_price',
            key: 'unit_price',
            render: val => `R$ ${Number(val || 0).toFixed(2)}`,
            width: 110
          },
          {
            title: 'Total',
            dataIndex: 'total_price',
            key: 'total_price',
            render: val => <strong>R$ ${Number(val || 0).toFixed(2)}</strong>,
            width: 120
          }
        ]}
      />

      <Divider />

      <div style={{ textAlign: 'right', fontSize: 14 }}>
        <p style={{ margin: '4px 0', color: isDark ? '#94a3b8' : '#64748b' }}>Subtotal: R$ {Number(order.gross_amount || order.subtotal_amount || 0).toFixed(2)}</p>
        {Number(order.discount_amount) > 0 && (
          <p style={{ margin: '4px 0', color: '#ef4444' }}>Desconto: -R$ {Number(order.discount_amount).toFixed(2)}</p>
        )}
        <Title level={4} style={{ margin: '8px 0', color: '#10b981' }}>
          Total Pago: R$ {Number(order.net_amount || order.total_amount || 0).toFixed(2)}
        </Title>
      </div>
    </Drawer>
  );
};
