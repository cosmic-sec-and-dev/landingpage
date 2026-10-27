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
  HomeOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  CompassOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import {
  PROPERTY_STATUS_CONFIG,
  LISTING_TYPE_CONFIG,
  PROPERTY_TYPE_CONFIG
} from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title, Paragraph } = Typography;

export const PropertyCard = ({
  property,
  agents = [],
  onEdit,
  onScheduleVisit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const statusCfg = PROPERTY_STATUS_CONFIG[property.status] || PROPERTY_STATUS_CONFIG.available;
  const listingCfg = LISTING_TYPE_CONFIG[property.listing_type] || LISTING_TYPE_CONFIG.sale;
  const typeCfg = PROPERTY_TYPE_CONFIG[property.property_type] || { label: property.property_type, icon: '🏠' };

  const agent = agents.find(a => a.id === property.agent_id);

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/properties?id=eq.${property.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Imóvel excluído com sucesso');
        onRefresh();
      } else {
        message.error('Erro ao excluir imóvel');
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
        {/* Header Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Space size="small">
            <Tag color={listingCfg.color} style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}>
              {listingCfg.label}
            </Tag>
            <Tag color="geekblue" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
              {typeCfg.icon} {typeCfg.label}
            </Tag>
          </Space>

          <Tag color={statusCfg.color} style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
            {statusCfg.label}
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
          {property.title}
        </Title>

        {/* Price */}
        <div style={{
          padding: '10px 12px',
          background: isDark ? '#0f172a' : '#f8fafc',
          borderRadius: 8,
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline'
        }}>
          <div>
            <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>Valor: </span>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#10b981' }}>
              R$ {Number(property.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {Number(property.condo_fee) > 0 && (
            <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>
              Cond: R$ {Number(property.condo_fee).toFixed(0)}
            </span>
          )}
        </div>

        {/* Attributes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          marginBottom: 14,
          fontSize: 12,
          color: isDark ? '#94a3b8' : '#64748b'
        }}>
          <div>🛏️ {property.bedrooms || 0} Quartos</div>
          <div>🚿 {property.bathrooms || 0} Banheiros</div>
          <div>🚗 {property.parking_spots || 0} Vagas</div>
          <div>📐 {property.total_area || 0} m²</div>
          <div>🏢 {property.suites || 0} Suítes</div>
          <div>🏗️ {property.built_area || 0} m² útil</div>
        </div>

        {/* Description snippet */}
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: 12,
            marginBottom: 12
          }}
        >
          {property.description}
        </Paragraph>
      </div>

      {/* Footer & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
      }}>
        <Button
          size="small"
          icon={<CalendarOutlined />}
          onClick={() => onScheduleVisit(property)}
        >
          Agendar Visita
        </Button>

        <Space size="small">
          <Tooltip title="Editar Imóvel">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(property)} />
          </Tooltip>
          <Popconfirm title="Remover imóvel?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
