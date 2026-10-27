import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Radio,
  Select,
  Button,
  Statistic,
  Empty,
  Space,
  Tag,
  Tabs,
  Table,
  Rate,
  Badge,
  Typography,
  Popconfirm,
  Pagination,
  message
} from 'antd';
import {
  ShopOutlined,
  ShoppingOutlined,
  TagOutlined,
  StarOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { CouponModal } from '../components/CouponModal';
import { OrderDrawer } from '../components/OrderDrawer';
import { ORDER_STATUS_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  products = [],
  categories = [],
  orders = [],
  orderItems = [],
  coupons = [],
  ratings = [],
  users = [],
  currentUser,
  kpis = {},
  productPage = 1,
  onProductPageChange,
  productTotal = 0,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('products');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtered Products
  const filteredProducts = products.filter(prod => {
    if (categoryFilter !== 'all' && prod.category_id !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (prod.name || '').toLowerCase().includes(q);
      const matchSku = (prod.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(ord => {
    if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
    return true;
  });

  // Metrics agregados estritamente via RPC do servidor
  const totalProducts = kpis.total_products !== undefined ? Number(kpis.total_products) : (productTotal || products.length);
  const totalSalesRevenue = Number(kpis.total_sales_revenue || 0);
  const pendingOrdersCount = Number(kpis.pending_orders_count || 0);
  const activeCouponsCount = Number(kpis.active_coupons_count || 0);

  const handleDeleteCoupon = async (couponId) => {
    try {
      const res = await apiRequest(`/coupons?id=eq.${couponId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Cupom excluído com sucesso');
        onRefresh();
      } else {
        message.error('Erro ao excluir cupom');
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      {/* Top Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Produtos na Loja</span>}
              value={totalProducts}
              prefix={<ShopOutlined style={{ color: '#0284c7' }} />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Faturamento em Vendas</span>}
              value={totalSalesRevenue}
              prefix={<DollarCircleOutlined style={{ color: '#10b981' }} />}
              formatter={(val) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Pedidos a Processar</span>}
              value={pendingOrdersCount}
              prefix={<ShoppingOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: pendingOrdersCount > 0 ? '#f59e0b' : undefined }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: {padding: 16} }}
          >
            <Statistic
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Cupons Ativos</span>}
              value={activeCouponsCount}
              prefix={<TagOutlined style={{ color: '#8b5cf6' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'products',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShopOutlined style={{ marginRight: 6 }} />
                Vitrine de Produtos
                <GlowingCount count={products.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'orders',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShoppingOutlined style={{ marginRight: 6 }} />
                Pedidos de Clientes
                <GlowingCount count={orders.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'coupons',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <TagOutlined style={{ marginRight: 6 }} />
                Cupons de Desconto
                <GlowingCount count={coupons.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'ratings',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <StarOutlined style={{ marginRight: 6 }} />
                Avaliações & Reviews
                <GlowingCount count={ratings.length} color={isDark ? '#fbbf24' : '#b45309'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'categories',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FolderOpenOutlined style={{ marginRight: 6 }} />
                Categorias
                <GlowingCount count={categories.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
              </span>
            )
          }
        ]}
      />

      {/* View 1: Vitrine de Produtos */}
      {activeTab === 'products' && (
        <>
          <Card
            variant="borderless"
            style={{
              marginBottom: 20,
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: {padding: '14px 20px'} }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} sm={12}>
                <Space wrap>
                  <Select
                    placeholder="Filtrar Categoria"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    style={{ minWidth: 180 }}
                  >
                    <Select.Option value="all">Todas as Categorias</Select.Option>
                    {categories.map(c => (
                      <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                  </Select>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar nome ou SKU..."
                    allowClear
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 220 }}
                  />
                  <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingProduct(null);
                      setProductModalOpen(true);
                    }}
                  >
                    Novo Produto
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {filteredProducts.length === 0 ? (
            <Empty
              description="Nenhum produto cadastrado na vitrine."
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
              >
                Cadastrar Primeiro Produto
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProducts.map(product => (
                <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                  <ProductCard
                    product={product}
                    categories={categories}
                    onEdit={(prod) => {
                      setEditingProduct(prod);
                      setProductModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={productPage}
              pageSize={50}
              total={productTotal || totalProducts}
              onChange={onProductPageChange}
              showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} produtos`}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

      {/* View 2: Pedidos de Clientes */}
      {activeTab === 'orders' && (
        <Card
          variant="borderless"
          style={{
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 12,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          styles={{ body: {padding: 20} }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Radio.Group
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">Todos</Radio.Button>
              <Radio.Button value="pending">Pendentes</Radio.Button>
              <Radio.Button value="processing">Em Separação</Radio.Button>
              <Radio.Button value="shipped">Enviados</Radio.Button>
              <Radio.Button value="delivered">Entregues</Radio.Button>
              <Radio.Button value="cancelled">Cancelados</Radio.Button>
            </Radio.Group>

            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
          </div>

          <Table
            dataSource={filteredOrders}
            rowKey="id"
            pagination={{ pageSize: 50 }}
            columns={[
              {
                title: 'Número do Pedido',
                dataIndex: 'order_number',
                key: 'order_number',
                render: (num, record) => (
                  <Button
                    type="link"
                    style={{ padding: 0, fontWeight: 700 }}
                    onClick={() => {
                      setSelectedOrder(record);
                      setOrderDrawerOpen(true);
                    }}
                  >
                    {num}
                  </Button>
                )
              },
              {
                title: 'Data',
                dataIndex: 'created_at',
                key: 'created_at',
                render: val => dayjs(val).format('DD/MM/YYYY HH:mm')
              },
              {
                title: 'Cliente',
                key: 'customer',
                render: (_, r) => {
                  const cid = r.customer_user_id || r.customer_id;
                  const u = users.find(usr => usr.id === cid);
                  return u ? (u.full_name || u.email) : (r.customer_name || cid?.substring(0, 8) || 'Cliente');
                }
              },
              {
                title: 'Valor Total',
                key: 'total',
                render: (_, r) => <strong>R$ {Number(r.net_amount ?? r.total_amount ?? 0).toFixed(2)}</strong>
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: st => {
                  const cfg = ORDER_STATUS_CONFIG[st] || ORDER_STATUS_CONFIG.pending;
                  return <Tag color={cfg.color}>{cfg.label}</Tag>;
                }
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 100,
                render: (_, record) => (
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedOrder(record);
                      setOrderDrawerOpen(true);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* View 3: Cupons de Desconto */}
      {activeTab === 'coupons' && (
        <Card
          variant="borderless"
          style={{
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 12,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          styles={{ body: {padding: 20} }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Gestão de Cupons Promocionais
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCoupon(null);
                setCouponModalOpen(true);
              }}
            >
              Criar Cupom
            </Button>
          </div>

          <Table
            dataSource={coupons}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Código',
                dataIndex: 'code',
                key: 'code',
                render: code => <Tag color="geekblue" style={{ fontSize: 13, fontWeight: 700 }}>{code}</Tag>
              },
              {
                title: 'Desconto',
                dataIndex: 'discount_value',
                key: 'val',
                render: (val, r) => (
                  <strong>
                    {r.discount_type === 'percentage' ? `${val}% OFF` : `R$ ${Number(val).toFixed(2)} OFF`}
                  </strong>
                )
              },
              {
                title: 'Pedido Mínimo',
                dataIndex: 'min_order_amount',
                key: 'min',
                render: val => Number(val) > 0 ? `R$ ${Number(val).toFixed(2)}` : 'Sem mínimo'
              },
              {
                title: 'Usos',
                key: 'uses',
                render: (_, r) => `${r.used_count || 0} / ${r.max_uses ? r.max_uses : '∞'}`
              },
              {
                title: 'Validade',
                key: 'validity',
                render: (_, r) => {
                  if (!r.valid_until) return 'Indeterminado';
                  return dayjs(r.valid_until).format('DD/MM/YYYY');
                }
              },
              {
                title: 'Status',
                dataIndex: 'is_active',
                key: 'active',
                render: act => <Tag color={act ? 'green' : 'default'}>{act ? 'Ativo' : 'Pausado'}</Tag>
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 140,
                render: (_, r) => (
                  <Space size="small">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingCoupon(r);
                        setCouponModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Popconfirm
                      title="Excluir este cupom?"
                      onConfirm={() => handleDeleteCoupon(r.id)}
                      okText="Sim"
                      cancelText="Não"
                    >
                      <Button size="small" danger>Excluir</Button>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* View 4: Avaliações & Reviews */}
      {activeTab === 'ratings' && (
        <Card
          variant="borderless"
          style={{
            background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
            borderRadius: 12,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}
          styles={{ body: {padding: 20} }}
        >
          <Title level={4} style={{ marginBottom: 16, color: isDark ? '#f8fafc' : '#0f172a' }}>
            Avaliações e Opiniões de Clientes
          </Title>

          <Table
            dataSource={ratings}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Data',
                dataIndex: 'created_at',
                key: 'date',
                render: val => dayjs(val).format('DD/MM/YYYY')
              },
              {
                title: 'Produto',
                dataIndex: 'product_id',
                key: 'product',
                render: pid => {
                  const p = products.find(prod => prod.id === pid);
                  return <strong>{p ? p.name : pid}</strong>;
                }
              },
              {
                title: 'Nota',
                dataIndex: 'rating',
                key: 'rating',
                render: val => <Rate disabled defaultValue={val} style={{ fontSize: 14 }} />
              },
              {
                title: 'Título & Comentário',
                key: 'comment',
                render: (_, r) => (
                  <div>
                    {r.review_title && <div><strong>{r.review_title}</strong></div>}
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>{r.review_comment || 'Sem comentário'}</div>
                  </div>
                )
              },
              {
                title: 'Compra Verificada',
                dataIndex: 'is_verified_purchase',
                key: 'verified',
                render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Verificada' : 'Não verificada'}</Tag>
              }
            ]}
          />
        </Card>
      )}

      {/* View 5: Categorias */}
      {activeTab === 'categories' && (
        <Row gutter={[16, 16]}>
          {categories.map(c => (
            <Col xs={24} sm={12} md={8} key={c.id}>
              <Card
                variant="borderless"
                style={{
                  background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                  borderRadius: 12,
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                styles={{ body: {padding: 18} }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a' }}>{c.name}</Text>
                  <Tag color={c.is_active ? 'green' : 'default'}>{c.is_active ? 'Ativa' : 'Inativa'}</Tag>
                </div>
                <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                  {c.description || 'Categoria de produtos da loja virtual.'}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modals & Drawers */}
      <ProductModal
        open={productModalOpen}
        record={editingProduct}
        categories={categories}
        onCancel={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={onRefresh}
      />

      <CouponModal
        open={couponModalOpen}
        record={editingCoupon}
        onCancel={() => {
          setCouponModalOpen(false);
          setEditingCoupon(null);
        }}
        onSuccess={onRefresh}
      />

      <OrderDrawer
        open={orderDrawerOpen}
        order={selectedOrder}
        orderItems={orderItems}
        products={products}
        users={users}
        onClose={() => {
          setOrderDrawerOpen(false);
          setSelectedOrder(null);
        }}
        onRefresh={onRefresh}
      />
    </div>
  );
};
