import React, { useState } from 'react';
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
  InputNumber,
  message,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TAB_STATUS_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Title, Text } = Typography;

export const TabDrawer = ({
  open,
  tab,
  tabItems = [],
  menus = [],
  onClose,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!tab) return null;

  const currentTabItems = tabItems.filter(i => i.tab_id === tab.id);
  const statusCfg = TAB_STATUS_CONFIG[tab.status] || TAB_STATUS_CONFIG.open;

  const handleAddItem = async () => {
    if (!selectedMenuId) {
      message.warning('Selecione um prato ou bebida');
      return;
    }

    const menuItem = menus.find(m => m.id === selectedMenuId);
    if (!menuItem) return;

    setAdding(true);
    try {
      const unitPrice = Number(menuItem.price || 0);
      const totalPrice = unitPrice * quantity;

      const res = await apiRequest('/restaurant_tab_items', {
        method: 'POST',
        body: JSON.stringify({
          tab_id: tab.id,
          item_id: menuItem.id,
          quantity: quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          status: 'pending'
        })
      });

      if (res.ok) {
        // Recalculate tab total
        const newTotal = Number(tab.total_amount || 0) + totalPrice;
        await apiRequest(`/restaurant_tabs?id=eq.${tab.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            total_amount: newTotal,
            final_amount: newTotal - Number(tab.discount_amount || 0)
          })
        });

        message.success(`${quantity}x ${menuItem.name} lançado na comanda!`);
        setSelectedMenuId(null);
        setQuantity(1);
        onRefresh();
      } else {
        message.error('Erro ao adicionar item à comanda');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveItem = async (itemId, itemTotalPrice) => {
    try {
      const res = await apiRequest(`/restaurant_tab_items?id=eq.${itemId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const newTotal = Math.max(0, Number(tab.total_amount || 0) - Number(itemTotalPrice || 0));
        await apiRequest(`/restaurant_tabs?id=eq.${tab.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            total_amount: newTotal,
            final_amount: newTotal - Number(tab.discount_amount || 0)
          })
        });

        message.success('Item removido da comanda');
        onRefresh();
      }
    } catch {
      message.error('Erro ao remover item');
    }
  };

  const handleCloseTab = async () => {
    try {
      const res = await apiRequest(`/restaurant_tabs?id=eq.${tab.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
      });

      if (res.ok) {
        message.success('Comanda fechada e conta finalizada!');
        onRefresh();
        onClose();
      } else {
        message.error('Erro ao fechar comanda');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
          <div>
            <Tag color="geekblue" style={{ fontWeight: 700 }}>{tab.tab_number}</Tag>
            <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 8 }}>
              Mesa {tab.table_number || 'Balcão'}
            </span>
          </div>
          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
        </div>
      }
      placement="right"
      width={680}
      open={open}
      onClose={onClose}
    >
      {/* Customer Info */}
      <div style={{
        padding: '12px 16px',
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#f8fafc',
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 13
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <p style={{ margin: '3px 0' }}>👤 <strong>Cliente:</strong> {tab.customer_name || 'Consumidor'}</p>
            <p style={{ margin: '3px 0' }}>📞 <strong>Contato:</strong> {tab.customer_phone || '-'}</p>
          </Col>
          <Col span={12}>
            <p style={{ margin: '3px 0' }}>🕒 <strong>Abertura:</strong> {dayjs(tab.opened_at).format('DD/MM/YYYY HH:mm')}</p>
            {tab.closed_at && (
              <p style={{ margin: '3px 0' }}>🏁 <strong>Fechamento:</strong> {dayjs(tab.closed_at).format('DD/MM/YYYY HH:mm')}</p>
            )}
          </Col>
        </Row>
      </div>

      {/* Add Items Toolbar */}
      {tab.status === 'open' && (
        <div style={{
          padding: '12px 16px',
          background: isDark ? '#0f172a' : '#f1f5f9',
          borderRadius: 10,
          marginBottom: 20
        }}>
          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
            Lançar Novo Pedido na Mesa:
          </Text>
          <Row gutter={8} align="middle">
            <Col span={14}>
              <Select
                placeholder="Selecione o prato ou bebida..."
                value={selectedMenuId}
                onChange={setSelectedMenuId}
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                {menus.filter(m => m.is_active !== false && m.is_available !== false).map(m => (
                  <Select.Option key={m.id} value={m.id}>
                    {m.name} - R$ {Number(m.price).toFixed(2)}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <InputNumber
                min={1}
                value={quantity}
                onChange={setQuantity}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
                loading={adding}
                style={{ width: '100%' }}
              >
                Lançar
              </Button>
            </Col>
          </Row>
        </div>
      )}

      <Divider>Itens Consumidos na Mesa</Divider>

      <Table
        dataSource={currentTabItems}
        rowKey="id"
        pagination={false}
        size="small"
        columns={[
          {
            title: 'Item',
            dataIndex: 'item_id',
            key: 'item',
            render: (iid, record) => {
              const targetId = iid || record.menu_id;
              const m = menus.find(menu => menu.id === targetId);
              return <strong>{m ? m.name : targetId}</strong>;
            }
          },
          { title: 'Qtd', dataIndex: 'quantity', key: 'qty', width: 60 },
          {
            title: 'Unitário',
            dataIndex: 'unit_price',
            key: 'unit_price',
            render: val => `R$ ${Number(val || 0).toFixed(2)}`,
            width: 90
          },
          {
            title: 'Total',
            dataIndex: 'total_price',
            key: 'total_price',
            render: val => <strong>R$ ${Number(val || 0).toFixed(2)}</strong>,
            width: 100
          },
          ...(tab.status === 'open' ? [{
            title: '',
            key: 'actions',
            width: 45,
            render: (_, r) => (
              <Popconfirm title="Remover item?" onConfirm={() => handleRemoveItem(r.id, r.total_price)}>
                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )
          }] : [])
        ]}
      />

      <Divider />

      <div style={{ textAlign: 'right', fontSize: 15 }}>
        <p style={{ margin: '4px 0', color: isDark ? '#94a3b8' : '#64748b' }}>
          Subtotal: R$ {Number(tab.total_amount || 0).toFixed(2)}
        </p>
        {Number(tab.discount_amount) > 0 && (
          <p style={{ margin: '4px 0', color: '#ef4444' }}>
            Desconto: -R$ {Number(tab.discount_amount).toFixed(2)}
          </p>
        )}
        <Title level={3} style={{ margin: '10px 0', color: '#10b981' }}>
          Total a Pagar: R$ {Number(tab.final_amount || tab.total_amount || 0).toFixed(2)}
        </Title>

        {tab.status === 'open' && (
          <Popconfirm
            title="Deseja encerrar o atendimento e fechar a conta da mesa?"
            onConfirm={handleCloseTab}
            okText="Fechar Conta"
            cancelText="Voltar"
          >
            <Button
              type="primary"
              size="large"
              icon={<DollarCircleOutlined />}
              style={{ background: '#10b981', borderColor: '#10b981', marginTop: 12 }}
            >
              Fechar Conta & Concluir Pagamento
            </Button>
          </Popconfirm>
        )}
      </div>
    </Drawer>
  );
};
