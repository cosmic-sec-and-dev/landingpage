import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  message
} from 'antd';
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Text, Title, Paragraph } = Typography;

export const MenuItemCard = ({
  item,
  categories = [],
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const category = categories.find(c => c.id === item.category_id);

  const isAvailable = item.is_active ?? item.is_available ?? true;
  const prepTime = item.attributes_json?.preparation_time_minutes || item.preparation_time_minutes || 15;
  const calories = item.attributes_json?.calories || item.calories;
  const allergens = item.attributes_json?.allergens_info || item.allergens_info;

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/catalog_items?id=eq.${item.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Item do cardápio excluído');
        onRefresh();
      } else {
        message.error('Erro ao excluir item');
      }
    } catch {
      message.error('Erro de conexão');
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
      styles={{ body: {padding: 18} }}
    >
      <div>
        {/* Header Category and Availability */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Tag color="geekblue" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
            {category ? category.name : 'Geral'}
          </Tag>
          <Tag color={isAvailable ? 'green' : 'default'} style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
            {isAvailable ? 'Disponível' : 'Indisponível'}
          </Tag>
        </div>

        {/* Title */}
        <Title
          level={5}
          style={{
            marginBottom: 6,
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: 16
          }}
        >
          {item.name}
        </Title>

        {/* Pricing & Prep Time */}
        <div style={{
          padding: '8px 12px',
          background: isDark ? '#0f172a' : '#f8fafc',
          borderRadius: 8,
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#10b981' }}>
              R$ {Number(item.price || 0).toFixed(2)}
            </span>
          </div>

          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined />
            <span>{prepTime} min</span>
          </div>
        </div>

        {/* Description */}
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: 12,
            marginBottom: 10,
            minHeight: 36
          }}
        >
          {item.description || 'Delicioso prato preparado com ingredientes frescos.'}
        </Paragraph>

        {/* Calories / Allergens */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {calories && (
            <Tag icon={<FireOutlined />} color="volcano" style={{ fontSize: 10, margin: 0 }}>
              {calories} kcal
            </Tag>
          )}
          {allergens && (
            <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>
              Alérgenos: {allergens}
            </Tag>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 10,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        <Space size="small">
          <Tooltip title="Editar Item">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(item)} />
          </Tooltip>
          <Popconfirm title="Remover item do cardápio?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
