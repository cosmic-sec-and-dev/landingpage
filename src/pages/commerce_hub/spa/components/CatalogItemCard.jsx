import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  Badge,
  message
} from 'antd';
import {
  BarcodeOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { ITEM_TYPE_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title, Paragraph } = Typography;

export const CatalogItemCard = ({
  item,
  categories = [],
  attachments = [],
  onEdit,
  onAdjustStock,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const category = categories.find(c => c.id === item.category_id);
  const typeConfig = ITEM_TYPE_CONFIG[item.item_type] || ITEM_TYPE_CONFIG.physical;

  const coverAttachment = (attachments || []).find(
    a => a.catalog_item_id === item.id && !a.is_deleted && (a.is_cover || a.attachment_type === 'main_photo' || a.attachment_type === 'product_image')
  );
  const imageUrl = coverAttachment?.url;

  const currentStock = Number(item.current_stock || 0);
  const minStock = Number(item.minimum_stock || 0);
  const isLowStock = item.track_inventory && currentStock <= minStock;

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/catalog_items?id=eq.${item.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Item removido do catálogo');
        onRefresh();
      } else {
        message.error('Erro ao excluir item');
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 14,
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
      styles={{ body: {padding: 16} }}
    >
      <div>
        {/* Header Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <Tag color={typeConfig.color} style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
            {typeConfig.label}
          </Tag>

          {item.track_inventory && (
            <Tag
              color={isLowStock ? 'red' : 'green'}
              style={{
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {isLowStock ? <WarningOutlined /> : <CheckCircleOutlined />}
              {currentStock.toFixed(0)} {item.unit_of_measure}
            </Tag>
          )}
        </div>

        {imageUrl && (
          <div style={{
            width: '100%',
            height: 120,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 10,
            background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <img
              src={imageUrl}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Item Title */}
        <Title
          level={5}
          style={{
            marginBottom: 6,
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: 15
          }}
        >
          {item.name}
        </Title>

        {/* SKU / EAN / Category */}
        <div style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', marginBottom: 10 }}>
          {category && <Tag style={{ fontSize: 10, borderRadius: 4 }}>{category.name}</Tag>}
          {item.sku && <span>SKU: {item.sku} </span>}
        </div>

        {/* Pricing */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 10px',
          background: isDark ? '#0f172a' : '#f8fafc',
          borderRadius: 8,
          marginBottom: 12
        }}>
          <div>
            <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', display: 'block' }}>Preço Venda</Text>
            <Text style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>
              R$ {Number(item.price || 0).toFixed(2)}
            </Text>
          </div>

          {Number(item.cost_price) > 0 && (
            <div style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', display: 'block' }}>Custo</Text>
              <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                R$ {Number(item.cost_price || 0).toFixed(2)}
              </Text>
            </div>
          )}
        </div>

        {/* Active Sales Channels */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {item.available_in_pos && <Tag color="blue" style={{ fontSize: 10 }}>PDV / Caixa</Tag>}
          {item.available_in_ecommerce && <Tag color="purple" style={{ fontSize: 10 }}>E-commerce</Tag>}
          {item.available_in_restaurant && <Tag color="orange" style={{ fontSize: 10 }}>Restaurante</Tag>}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        {item.track_inventory ? (
          <Button
            size="small"
            icon={<SwapOutlined style={{ color: '#0284c7' }} />}
            onClick={() => onAdjustStock(item)}
          >
            Ajustar Estoque
          </Button>
        ) : <span />}

        <Space size="small">
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(item)} />
          </Tooltip>
          <Popconfirm title="Remover item?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
