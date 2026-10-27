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
  ShoppingOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Text, Title } = Typography;

export const ProductCard = ({
  product,
  categories = [],
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const category = categories.find(c => c.id === product.category_id);
  const salePrice = product.attributes_json?.sale_price || product.sale_price;
  const isPromo = Number(salePrice) > 0 && Number(salePrice) < Number(product.price);
  const stock = Number(product.current_stock ?? product.stock_quantity ?? 0);

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/catalog_items?id=eq.${product.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Produto removido da loja');
        onRefresh();
      } else {
        message.error('Erro ao excluir produto');
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
        {/* Header Category and Stock */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Tag color="geekblue" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
            {category ? category.name : 'Geral'}
          </Tag>

          <Tag color={stock > 0 ? 'green' : 'red'} style={{ borderRadius: 6, fontSize: 11 }}>
            {stock > 0 ? `${stock} em estoque` : 'Esgotado'}
          </Tag>
        </div>

        {/* Title */}
        <Title
          level={5}
          style={{
            marginBottom: 6,
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: 15
          }}
        >
          {product.name}
        </Title>

        {product.sku && (
          <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', marginBottom: 10 }}>
            SKU: {product.sku}
          </div>
        )}

        {/* Pricing */}
        <div style={{
          padding: '10px 12px',
          background: isDark ? '#0f172a' : '#f8fafc',
          borderRadius: 8,
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            {isPromo ? (
              <div>
                <span style={{ fontSize: 12, textDecoration: 'line-through', color: isDark ? '#64748b' : '#94a3b8', marginRight: 6 }}>
                  R$ {Number(product.price).toFixed(2)}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
                  R$ {Number(salePrice).toFixed(2)}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                R$ {Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <Tag color={product.is_active ? 'green' : 'default'} style={{ margin: 0 }}>
            {product.is_active ? 'Ativo' : 'Pausado'}
          </Tag>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 10,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        <Space size="small">
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(product)} />
          </Tooltip>
          <Popconfirm title="Remover produto da loja?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
