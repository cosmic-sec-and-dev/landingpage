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
  Badge,
  Typography,
  Pagination
} from 'antd';
import {
  AppstoreOutlined,
  StockOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  SwapOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  FolderAddOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { GlowingCount } from '../../../../components/common/GlowingCount';
import { CatalogItemCard } from '../components/CatalogItemCard';
import { CatalogItemModal } from '../components/CatalogItemModal';
import { CategoryModal } from '../components/CategoryModal';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';
import { PosSaleModal } from '../components/PosSaleModal';
import { GatewayModal } from '../components/GatewayModal';
import { ITEM_TYPE_CONFIG, STOCK_MOVEMENT_TYPES } from '../schemaConfig';

const { Search } = Input;
const { Title, Text } = Typography;

export const MainAppView = ({
  items = [],
  categories = [],
  sales = [],
  saleItems = [],
  stockMovements = [],
  gateways = [],
  transactions = [],
  itemAttachments = [],
  categoryAttachments = [],
  digitalDeliverables = [],
  users = [],
  currentUser,
  kpis = {},
  catalogPage = 1,
  onCatalogPageChange,
  catalogTotal = 0,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('catalog');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);

  const [posModalOpen, setPosModalOpen] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);

  // Filtered Items
  const filteredItems = items.filter(item => {
    if (typeFilter !== 'all' && item.item_type !== typeFilter) return false;
    if (categoryFilter !== 'all' && item.category_id !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchSku = (item.sku || '').toLowerCase().includes(q);
      const matchEan = (item.barcode_ean || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchEan) return false;
    }

    return true;
  });

  // Metrics agregados estritamente via RPC do servidor PostgreSQL
  const totalCatalogItems = kpis.total_catalog_items !== undefined ? Number(kpis.total_catalog_items) : (catalogTotal || items.length);
  const totalStockValue = Number(kpis.total_stock_value || 0);
  const totalSalesRevenue = Number(kpis.total_sales_revenue || 0);
  const lowStockCount = Number(kpis.low_stock_count || 0);

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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Itens no Catálogo</span>}
              value={totalCatalogItems}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Valor Total em Estoque</span>}
              value={totalStockValue}
              prefix={<StockOutlined style={{ color: '#10b981' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Receita Total de Vendas</span>}
              value={totalSalesRevenue}
              prefix={<DollarOutlined style={{ color: '#0284c7' }} />}
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
              title={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Itens c/ Estoque Baixo</span>}
              value={lowStockCount}
              valueStyle={{ color: lowStockCount > 0 ? '#ef4444' : '#10b981' }}
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
            key: 'catalog',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <AppstoreOutlined style={{ marginRight: 6 }} />
                Catálogo Geral de Itens
                <GlowingCount count={items.length} color={isDark ? '#38bdf8' : '#0284c7'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'ledger',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <StockOutlined style={{ marginRight: 6 }} />
                Livro-Razão de Estoque
                <GlowingCount count={stockMovements.length} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'sales',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShoppingCartOutlined style={{ marginRight: 6 }} />
                Vendas & Histórico PDV
                <GlowingCount count={sales.length} color={isDark ? '#f59e0b' : '#d97706'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'payments',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <CreditCardOutlined style={{ marginRight: 6 }} />
                Gateways & Pagamentos
                <GlowingCount count={gateways.length} color={isDark ? '#c084fc' : '#9333ea'} isDark={isDark} />
              </span>
            )
          },
          {
            key: 'categories',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FolderOpenOutlined style={{ marginRight: 6 }} />
                Categorias
                <GlowingCount count={categories.length} color={isDark ? '#ec4899' : '#db2777'} isDark={isDark} />
              </span>
            )
          }
        ]}
      />

      {/* View 1: Catálogo Mestre de Itens */}
      {activeTab === 'catalog' && (
        <>
          {/* Toolbar */}
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
              <Col xs={24} lg={14}>
                <Space wrap>
                  <Radio.Group
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    buttonStyle="solid"
                    size="middle"
                  >
                    <Radio.Button value="all">Todos</Radio.Button>
                    <Radio.Button value="physical">Físicos</Radio.Button>
                    <Radio.Button value="digital">Digitais</Radio.Button>
                    <Radio.Button value="service">Serviços</Radio.Button>
                    <Radio.Button value="raw_material">Insumos</Radio.Button>
                  </Radio.Group>

                  <Select
                    placeholder="Categoria"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    style={{ minWidth: 150 }}
                  >
                    <Select.Option value="all">Todas Categorias</Select.Option>
                    {categories.map(c => (
                      <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                  </Select>
                </Space>
              </Col>

              <Col xs={24} lg={10}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Search
                    placeholder="Buscar nome, SKU ou EAN..."
                    allowClear
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: 190 }}
                  />
                  <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingItem(null);
                      setItemModalOpen(true);
                    }}
                  >
                    Novo Item
                  </Button>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                    onClick={() => setPosModalOpen(true)}
                  >
                    Frente de Caixa (PDV)
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <Empty
              description="Nenhum item encontrado no catálogo mestre."
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingItem(null);
                  setItemModalOpen(true);
                }}
              >
                Cadastrar Primeiro Item
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredItems.map(item => (
                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                  <CatalogItemCard
                    item={item}
                    categories={categories}
                    attachments={itemAttachments}
                    onEdit={(itm) => {
                      setEditingItem(itm);
                      setItemModalOpen(true);
                    }}
                    onAdjustStock={(itm) => {
                      setSelectedItemForStock(itm.id);
                      setStockModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Col>
              ))}
            </Row>
          )}

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={catalogPage}
              pageSize={50}
              total={catalogTotal || totalCatalogItems}
              onChange={onCatalogPageChange}
              showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} itens`}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

      {/* View 2: Livro-Razão de Estoque */}
      {activeTab === 'ledger' && (
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
              Livro-Razão Imutável de Movimentações de Estoque
            </Title>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              onClick={() => {
                setSelectedItemForStock(null);
                setStockModalOpen(true);
              }}
            >
              Lançamento Manual de Estoque
            </Button>
          </div>

          <Table
            dataSource={stockMovements}
            rowKey="id"
            pagination={{ pageSize: 50 }}
            columns={[
              {
                title: 'Data/Hora',
                dataIndex: 'created_at',
                key: 'created_at',
                render: val => dayjs(val).format('DD/MM/YYYY HH:mm')
              },
              {
                title: 'Item',
                key: 'item',
                render: (_, r) => {
                  const id = r.item_id || r.catalog_item_id;
                  const itm = items.find(i => i.id === id);
                  return itm ? <strong>{itm.name}</strong> : id?.substring(0, 8);
                }
              },
              {
                title: 'Tipo de Movimento',
                dataIndex: 'movement_type',
                key: 'type',
                render: type => {
                  const cfg = STOCK_MOVEMENT_TYPES.find(t => t.value === type);
                  return <Tag color={cfg?.color || 'blue'}>{cfg?.label || type}</Tag>;
                }
              },
              {
                title: 'Variação Qtd',
                key: 'qty',
                render: (_, r) => {
                  const num = Number(r.quantity ?? r.quantity_delta ?? 0);
                  const isPositive = num > 0;
                  return (
                    <span style={{ fontWeight: 700, color: isPositive ? '#10b981' : '#ef4444' }}>
                      {isPositive ? `+${num.toFixed(2)}` : num.toFixed(2)}
                    </span>
                  );
                }
              },
              {
                title: 'Custo Unitário',
                dataIndex: 'unit_cost',
                key: 'cost',
                render: val => `R$ ${Number(val || 0).toFixed(2)}`
              },
              {
                title: 'Motivo / Justificativa',
                key: 'notes',
                render: (_, r) => r.notes || r.reason_notes || '-'
              }
            ]}
          />
        </Card>
      )}

      {/* View 3: Vendas & PDV */}
      {activeTab === 'sales' && (
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
              Histórico Unificado de Vendas
            </Title>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              style={{ background: '#10b981', borderColor: '#10b981' }}
              onClick={() => setPosModalOpen(true)}
            >
              Nova Venda no Balcão (PDV)
            </Button>
          </div>

          <Table
            dataSource={sales}
            rowKey="id"
            pagination={{ pageSize: 50 }}
            columns={[
              {
                title: 'Data/Hora',
                dataIndex: 'created_at',
                key: 'created_at',
                render: val => dayjs(val).format('DD/MM/YYYY HH:mm')
              },
              {
                title: 'Canal',
                dataIndex: 'origin_channel',
                key: 'channel',
                render: ch => <Tag color="cyan">{ch}</Tag>
              },
              {
                title: 'Cliente',
                dataIndex: 'customer_name',
                key: 'customer',
                render: val => val || 'Consumidor Final'
              },
              {
                title: 'Valor Bruto',
                dataIndex: 'gross_amount',
                key: 'gross',
                render: val => `R$ ${Number(val || 0).toFixed(2)}`
              },
              {
                title: 'Desconto',
                dataIndex: 'discount_amount',
                key: 'discount',
                render: val => `R$ ${Number(val || 0).toFixed(2)}`
              },
              {
                title: 'Valor Líquido',
                dataIndex: 'net_amount',
                key: 'net',
                render: val => <strong style={{ color: '#10b981' }}>R$ {Number(val || 0).toFixed(2)}</strong>
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: st => <Tag color="green">{st?.toUpperCase()}</Tag>
              }
            ]}
          />
        </Card>
      )}

      {/* View 4: Categorias */}
      {activeTab === 'categories' && (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  Categorias do Catálogo & Classificação
                </Title>
                <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                  Gerencie a taxonomia, categorias pai e subcategorias para catálogo, PDV e cardápios
                </Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                style={{
                  background: '#0284c7',
                  borderColor: '#0284c7',
                  borderRadius: 8,
                  fontWeight: 600
                }}
              >
                Nova Categoria
              </Button>
            </div>
          </Card>

          {categories.length === 0 ? (
            <Card
              variant="borderless"
              style={{
                background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                borderRadius: 12,
                textAlign: 'center',
                padding: 40
              }}
            >
              <Empty description="Nenhuma categoria cadastrada. Crie a primeira categoria para organizar seu catálogo." />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {categories.map(c => {
                const parentCat = categories.find(p => p.id === c.parent_id);
                const catAtt = (categoryAttachments || []).find(a => a.catalog_category_id === c.id && !a.is_deleted);
                const iconSrc = c.icon_url || catAtt?.url;

                return (
                  <Col xs={24} sm={12} md={8} key={c.id}>
                    <Card
                      variant="borderless"
                      style={{
                        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                        borderRadius: 12,
                        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      styles={{ body: { padding: 18 } }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {iconSrc && (
                            <img
                              src={iconSrc}
                              alt={c.name}
                              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a' }}>{c.name}</Text>
                        </div>
                        <Tag color={c.is_active ? 'green' : 'default'}>{c.is_active ? 'Ativa' : 'Inativa'}</Tag>
                      </div>
                      {parentCat && (
                        <div style={{ marginBottom: 6 }}>
                          <Tag color="cyan">Subcategoria de: {parentCat.name}</Tag>
                        </div>
                      )}
                      <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                        {c.description || 'Categoria de produtos e serviços do catálogo.'}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Ordem: {c.display_order ?? 0}</Text>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingCategory(c);
                            setCategoryModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Space>
      )}

      {/* View 5: Gateways & Pagamentos */}
      {activeTab === 'payments' && (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Card
            variant="borderless"
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  Provedores & Gateways de Pagamento
                </Title>
                <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                  Gerenciamento de adquirentes, maquininhas TEF, PIX direto e integrações bancárias
                </Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingGateway(null);
                  setGatewayModalOpen(true);
                }}
                style={{
                  background: '#6366f1',
                  borderColor: '#6366f1',
                  borderRadius: 8,
                  fontWeight: 600
                }}
              >
                Novo Gateway
              </Button>
            </div>
          </Card>

          {/* Cards dos Gateways */}
          <Row gutter={[16, 16]}>
            {gateways.length === 0 ? (
              <Col orientation="left" span={24}>
                <Card
                  variant="borderless"
                  style={{
                    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                    borderRadius: 12,
                    textAlign: 'center',
                    padding: 30
                  }}
                >
                  <Empty description="Nenhum gateway configurado. Adicione um terminal TEF, Stone ou Pix." />
                </Card>
              </Col>
            ) : (
              gateways.map(g => (
                <Col xs={24} sm={12} md={8} key={g.id}>
                  <Card
                    variant="borderless"
                    style={{
                      background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                      borderRadius: 12,
                      boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                    styles={{ body: { padding: 18 } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <Text strong style={{ fontSize: 16, color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {g.name}
                        </Text>
                        <br />
                        <Tag color="purple" style={{ marginTop: 4 }}>{g.provider_type?.toUpperCase()}</Tag>
                      </div>
                      <Space>
                        <Tag color={g.is_active ? 'green' : 'default'}>{g.is_active ? 'Ativo' : 'Inativo'}</Tag>
                        {g.is_test_mode && <Tag color="warning">Sandbox</Tag>}
                      </Space>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingGateway(g);
                          setGatewayModalOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          {/* Transações Financeiras */}
          <Card
            variant="borderless"
            title={
              <Space>
                <CreditCardOutlined style={{ color: '#6366f1' }} />
                <span style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                  Registro de Transações Financeiras ({transactions.length})
                </span>
              </Space>
            }
            style={{
              background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
              borderRadius: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <Table
              dataSource={transactions}
              rowKey="id"
              pagination={{ pageSize: 50 }}
              columns={[
                {
                  title: 'Data',
                  dataIndex: 'created_at',
                  key: 'date',
                  render: d => dayjs(d).format('DD/MM/YYYY HH:mm')
                },
                {
                  title: 'Provedor / Gateway',
                  dataIndex: 'gateway_id',
                  key: 'gw',
                  render: gwId => {
                    const gw = gateways.find(g => g.id === gwId);
                    return gw ? <Tag color="purple">{gw.name}</Tag> : <Text type="secondary">N/A</Text>;
                  }
                },
                {
                  title: 'Método / Tipo',
                  dataIndex: 'payment_tender_type',
                  key: 'tender',
                  render: t => <Tag>{t?.toUpperCase()}</Tag>
                },
                {
                  title: 'NSU / Aut.',
                  key: 'nsu',
                  render: (_, r) => <Text code>{r.nsu_terminal || r.gateway_authorization_code || 'N/A'}</Text>
                },
                {
                  title: 'Valor Bruto',
                  dataIndex: 'amount',
                  key: 'amt',
                  render: a => `R$ ${Number(a || 0).toFixed(2)}`
                },
                {
                  title: 'Taxa Gateway',
                  dataIndex: 'fee_amount',
                  key: 'fee',
                  render: f => `R$ ${Number(f || 0).toFixed(2)}`
                },
                {
                  title: 'Líquido',
                  dataIndex: 'net_amount',
                  key: 'net',
                  render: n => <strong style={{ color: '#10b981' }}>R$ {Number(n || 0).toFixed(2)}</strong>
                },
                {
                  title: 'Status',
                  dataIndex: 'gateway_status',
                  key: 'status',
                  render: s => (
                    <Tag color={s === 'approved' ? 'green' : s === 'pending' ? 'orange' : 'red'}>
                      {s?.toUpperCase()}
                    </Tag>
                  )
                }
              ]}
            />
          </Card>
        </Space>
      )}

      {/* Item Modal */}
      <CatalogItemModal
        open={itemModalOpen}
        record={editingItem}
        categories={categories}
        attachments={itemAttachments}
        digitalDeliverables={digitalDeliverables}
        onCancel={() => {
          setItemModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={onRefresh}
        onAddCategory={() => {
          setEditingCategory(null);
          setCategoryModalOpen(true);
        }}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={stockModalOpen}
        defaultItemId={selectedItemForStock}
        items={items}
        onCancel={() => {
          setStockModalOpen(false);
          setSelectedItemForStock(null);
        }}
        onSuccess={onRefresh}
      />

      {/* POS Sale Modal */}
      <PosSaleModal
        open={posModalOpen}
        items={items}
        users={users}
        onCancel={() => setPosModalOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Gateway Modal */}
      <GatewayModal
        open={gatewayModalOpen}
        record={editingGateway}
        onCancel={() => {
          setGatewayModalOpen(false);
          setEditingGateway(null);
        }}
        onSuccess={onRefresh}
      />

      {/* Category Modal */}
      <CategoryModal
        open={categoryModalOpen}
        record={editingCategory}
        categories={categories}
        categoryAttachments={categoryAttachments}
        onCancel={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
};
