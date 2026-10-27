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
  Typography,
  Popconfirm,
  Badge,
  message
} from 'antd';
import {
  CoffeeOutlined,
  AppstoreOutlined,
  DollarCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  ShoppingOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { MenuItemCard } from '../components/MenuItemCard';
import { MenuItemModal } from '../components/MenuItemModal';
import { TabModal } from '../components/TabModal';
import { TabDrawer } from '../components/TabDrawer';
import { InventoryItemModal } from '../components/InventoryItemModal';
import { TAB_STATUS_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  menus = [],
  categories = [],
  tabs = [],
  tabItems = [],
  inventoryItems = [],
  users = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('menu');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const [tabModalOpen, setTabModalOpen] = useState(false);

  const [tabDrawerOpen, setTabDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);

  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);

  // Filtered Menu Items
  const filteredMenus = menus.filter(item => {
    if (categoryFilter !== 'all' && item.category_id !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  // Metrics
  const openTabsCount = tabs.filter(t => t.status === 'open').length;
  const totalMenuItems = menus.length;
  const totalRevenue = tabs
    .filter(t => t.status === 'closed')
    .reduce((acc, t) => acc + Number(t.final_amount || t.total_amount || 0), 0);
  const lowStockIngredientsCount = inventoryItems.filter(
    i => Number(i.current_stock || 0) <= Number(i.minimum_stock || 0)
  ).length;

  const handleDeleteInventory = async (id) => {
    try {
      const res = await apiRequest(`/catalog_items?id=eq.${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Insumo removido');
        onRefresh();
      } else {
        message.error('Erro ao excluir insumo');
      }
    } catch {
      message.error('Erro de conexão');
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Mesas / Comandas Abertas</span>}
              value={openTabsCount}
              prefix={<CoffeeOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: openTabsCount > 0 ? '#10b981' : undefined }}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Itens no Cardápio</span>}
              value={totalMenuItems}
              prefix={<AppstoreOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Faturamento (Comandas)</span>}
              value={totalRevenue}
              prefix={<DollarCircleOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Ingredientes c/ Estoque Baixo</span>}
              value={lowStockIngredientsCount}
              prefix={<WarningOutlined style={{ color: lowStockIngredientsCount > 0 ? '#ef4444' : '#10b981' }} />}
              valueStyle={{ color: lowStockIngredientsCount > 0 ? '#ef4444' : '#10b981' }}
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
            key: 'menu',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <AppstoreOutlined style={{ marginRight: 6 }} />
                Cardápio Digital
                <GlowingCount count={menus.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'tabs',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <CoffeeOutlined style={{ marginRight: 6 }} />
                Mesas & Comandas
                <GlowingCount count={tabs.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'inventory',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShoppingOutlined style={{ marginRight: 6 }} />
                Insumos & Despensa
                <GlowingCount count={inventoryItems.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
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

      {/* View 1: Cardápio Digital */}
      {activeTab === 'menu' && (
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
                    placeholder="Buscar prato ou bebida..."
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
                      setEditingMenuItem(null);
                      setMenuModalOpen(true);
                    }}
                  >
                    Novo Prato / Bebida
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {filteredMenus.length === 0 ? (
            <Empty
              description="Nenhum item cadastrado no cardápio."
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingMenuItem(null);
                  setMenuModalOpen(true);
                }}
              >
                Adicionar Primeiro Prato
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredMenus.map(item => (
                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                  <MenuItemCard
                    item={item}
                    categories={categories}
                    onEdit={(itm) => {
                      setEditingMenuItem(itm);
                      setMenuModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* View 2: Mesas & Comandas */}
      {activeTab === 'tabs' && (
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
              Gestão de Mesas e Comandas em Atendimento
            </Title>
            <Button
              type="primary"
              icon={<CoffeeOutlined />}
              style={{ background: '#10b981', borderColor: '#10b981' }}
              onClick={() => setTabModalOpen(true)}
            >
              Abrir Nova Mesa / Comanda
            </Button>
          </div>

          <Table
            dataSource={tabs}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Comanda / Mesa',
                key: 'tab_mesa',
                render: (_, r) => (
                  <div>
                    <Tag color="geekblue" style={{ fontWeight: 700 }}>{r.tab_number}</Tag>
                    <strong>Mesa {r.table_number || 'Balcão'}</strong>
                  </div>
                )
              },
              {
                title: 'Cliente',
                dataIndex: 'customer_name',
                key: 'cust',
                render: val => val || 'Consumidor'
              },
              {
                title: 'Abertura',
                dataIndex: 'opened_at',
                key: 'opened_at',
                render: val => dayjs(val).format('DD/MM/YYYY HH:mm')
              },
              {
                title: 'Total Consumido',
                dataIndex: 'total_amount',
                key: 'total',
                render: val => <strong>R$ {Number(val || 0).toFixed(2)}</strong>
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: st => {
                  const cfg = TAB_STATUS_CONFIG[st] || TAB_STATUS_CONFIG.open;
                  return <Tag color={cfg.color}>{cfg.label}</Tag>;
                }
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 120,
                render: (_, record) => (
                  <Button
                    size="small"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedTab(record);
                      setTabDrawerOpen(true);
                    }}
                  >
                    Ver Comanda
                  </Button>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* View 3: Insumos & Despensa */}
      {activeTab === 'inventory' && (
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
              Estoque de Ingredientes & Insumos da Cozinha
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingInventoryItem(null);
                setInventoryModalOpen(true);
              }}
            >
              Cadastrar Insumo
            </Button>
          </div>

          <Table
            dataSource={inventoryItems}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Ingrediente',
                dataIndex: 'name',
                key: 'name',
                render: (name, r) => (
                  <div>
                    <strong>{name}</strong>
                    {r.sku && <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>SKU: {r.sku}</div>}
                  </div>
                )
              },
              {
                title: 'Estoque Atual',
                key: 'stock',
                render: (_, r) => {
                  const current = Number(r.current_stock || 0);
                  const min = Number(r.minimum_stock || 0);
                  const isLow = current <= min;
                  return (
                    <Tag color={isLow ? 'red' : 'green'} style={{ fontWeight: 700 }}>
                      {current.toFixed(2)} {r.unit_of_measure}
                    </Tag>
                  );
                }
              },
              {
                title: 'Estoque Mínimo',
                dataIndex: 'minimum_stock',
                key: 'min',
                render: (val, r) => `${Number(val || 0).toFixed(2)} ${r.unit_of_measure}`
              },
              {
                title: 'Custo Unitário',
                dataIndex: 'cost_price',
                key: 'cost',
                render: (val, r) => `R$ ${Number(val ?? r.cost_per_unit ?? 0).toFixed(2)}`
              },
              {
                title: 'Fornecedor',
                dataIndex: 'attributes_json',
                key: 'sup',
                render: (attr, r) => attr?.supplier_name || r.supplier_name || '-'
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
                        setEditingInventoryItem(r);
                        setInventoryModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Popconfirm
                      title="Excluir este insumo?"
                      onConfirm={() => handleDeleteInventory(r.id)}
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

      {/* View 4: Categorias */}
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
                  {c.description || 'Categoria de pratos e bebidas do cardápio.'}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modals & Drawers */}
      <MenuItemModal
        open={menuModalOpen}
        record={editingMenuItem}
        categories={categories}
        onCancel={() => {
          setMenuModalOpen(false);
          setEditingMenuItem(null);
        }}
        onSuccess={onRefresh}
      />

      <TabModal
        open={tabModalOpen}
        currentUser={currentUser}
        onCancel={() => setTabModalOpen(false)}
        onSuccess={onRefresh}
      />

      <TabDrawer
        open={tabDrawerOpen}
        tab={selectedTab}
        tabItems={tabItems}
        menus={menus}
        onClose={() => {
          setTabDrawerOpen(false);
          setSelectedTab(null);
        }}
        onRefresh={onRefresh}
      />

      <InventoryItemModal
        open={inventoryModalOpen}
        record={editingInventoryItem}
        onCancel={() => {
          setInventoryModalOpen(false);
          setEditingInventoryItem(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
};
