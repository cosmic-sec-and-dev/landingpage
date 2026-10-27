import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  Dropdown,
  message
} from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  DollarOutlined,
  EditOutlined,
  DeleteOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { APPOINTMENT_STATUS_COLORS } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title } = Typography;

export const AppointmentCard = ({
  appointment,
  professionals = [],
  services = [],
  rooms = [],
  users = [],
  onEdit,
  onOpenRecord,
  onRefresh
}) => {
  const { isDark } = useAppTheme();

  const patient = users.find(u => u.id === (appointment.customer_user_id || appointment.patient_user_id));
  const professional = professionals.find(p => p.id === appointment.professional_id);
  const profUser = professional ? users.find(u => u.id === professional.user_id) : null;
  const service = services.find(s => s.id === (appointment.service_item_id || appointment.service_id));
  const room = rooms.find(r => r.id === appointment.room_id);

  const statusConfig = APPOINTMENT_STATUS_COLORS[appointment.status] || APPOINTMENT_STATUS_COLORS.scheduled;

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await apiRequest(`/clinic_appointments?id=eq.${appointment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        message.success(`Status alterado para ${APPOINTMENT_STATUS_COLORS[newStatus]?.label || newStatus}`);
        onRefresh();
      } else {
        message.error('Erro ao atualizar status');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiRequest(`/clinic_appointments?id=eq.${appointment.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Agendamento removido');
        onRefresh();
      } else {
        message.error('Erro ao excluir agendamento');
      }
    } catch {
      message.error('Erro ao excluir');
    }
  };

  const statusMenuItems = [
    { key: 'confirmed', label: 'Marcar como Confirmado', icon: <CheckCircleOutlined style={{ color: '#06b6d4' }} />, onClick: () => handleUpdateStatus('confirmed') },
    { key: 'in_progress', label: 'Iniciar Atendimento', icon: <MedicineBoxOutlined style={{ color: '#a855f7' }} />, onClick: () => handleUpdateStatus('in_progress') },
    { key: 'completed', label: 'Concluir Consulta', icon: <CheckCircleOutlined style={{ color: '#22c55e' }} />, onClick: () => handleUpdateStatus('completed') },
    { key: 'cancelled', label: 'Cancelar Consulta', icon: <CloseCircleOutlined style={{ color: '#ef4444' }} />, onClick: () => handleUpdateStatus('cancelled') }
  ];

  return (
    <Card
      hoverable
      style={{
        borderRadius: 14,
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
      styles={{ body: {padding: 18} }}
    >
      <div>
        {/* Header: Time & Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockCircleOutlined style={{ color: '#0284c7' }} />
            <Text strong style={{ fontSize: 14, color: isDark ? '#f8fafc' : '#0f172a' }}>
              {appointment.start_time?.substring(0, 5)} - {appointment.end_time?.substring(0, 5)}
            </Text>
          </div>

          <Tag color={statusConfig.color} style={{ borderRadius: 6, fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
            {statusConfig.label}
          </Tag>
        </div>

        {/* Patient Name */}
        <div style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>Paciente</Text>
          <Text strong style={{ fontSize: 15, color: isDark ? '#f8fafc' : '#0f172a' }}>
            {patient ? (patient.full_name || patient.email) : 'Paciente não identificado'}
          </Text>
          {patient?.phone_number && (
            <Text style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', display: 'block' }}>
              📱 {patient.phone_number}
            </Text>
          )}
        </div>

        {/* Professional & Specialty */}
        <div style={{
          padding: '8px 12px',
          background: isDark ? '#0f172a' : '#f8fafc',
          borderRadius: 8,
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', display: 'block' }}>Profissional</Text>
            <Text style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e2e8f0' : 'rgba(26, 35, 56, 0.85)' }}>
              {profUser ? `${professional?.title_prefix || 'Dr(a).'} ${profUser.full_name || profUser.email}` : 'Profissional'}
            </Text>
          </div>
          {service && (
            <Tag color="blue" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
              {service.name}
            </Tag>
          )}
        </div>

        {/* Room & Price details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {room ? (
            <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <HomeOutlined /> {room.name} (Sala {room.room_number})
            </span>
          ) : <span />}

          <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
            R$ {Number(appointment.final_amount ?? appointment.price_charged ?? appointment.total_amount ?? 0).toFixed(2)}
          </span>
        </div>

        {appointment.notes && (
          <Text italic style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', display: 'block', marginBottom: 10 }}>
            "{appointment.notes}"
          </Text>
        )}
      </div>

      {/* Action Footer */}
      <div style={{
        paddingTop: 12,
        borderTop: isDark ? '1px solid #334155' : '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button
          size="small"
          type="dashed"
          icon={<FileProtectOutlined style={{ color: '#10b981' }} />}
          onClick={() => onOpenRecord(appointment)}
        >
          Prontuário
        </Button>

        <Space size="small">
          <Dropdown menu={{ items: statusMenuItems }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>

          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(appointment)} />
          </Tooltip>

          <Popconfirm title="Remover agendamento?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};
