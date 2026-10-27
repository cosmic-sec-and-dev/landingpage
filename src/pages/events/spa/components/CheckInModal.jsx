import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Alert
} from 'antd';
import {
  QrcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TICKET_STATUS_CONFIG } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Title, Text } = Typography;
const { Search } = Input;

export const CheckInModal = ({
  open,
  event,
  tickets = [],
  tiers = [],
  users = [],
  onClose,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [codeQuery, setCodeQuery] = useState('');
  const [lastCheckedTicket, setLastCheckedTicket] = useState(null);

  if (!event) return null;

  const eventTickets = tickets.filter(t => t.event_id === event.id);

  const handlePerformCheckIn = async (ticket) => {
    if (ticket.status === 'checked_in') {
      message.warning('Este ingresso já realizou check-in!');
      return;
    }
    if (ticket.status === 'cancelled') {
      message.error('Ingresso cancelado! Entrada não permitida.');
      return;
    }

    try {
      const res = await apiRequest(`/event_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'checked_in',
          checked_in_at: new Date().toISOString()
        })
      });

      if (res.ok) {
        message.success(`Check-in validado com sucesso para ${ticket.ticket_code}!`);
        setLastCheckedTicket({ ...ticket, status: 'checked_in', checked_in_at: new Date().toISOString() });
        setCodeQuery('');
        onRefresh();
      } else {
        message.error('Erro ao registrar check-in');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  const handleSearchCode = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return;
    const found = eventTickets.find(t => t.ticket_code.toLowerCase() === trimmed.toLowerCase());
    if (found) {
      handlePerformCheckIn(found);
    } else {
      message.error('Código de ingresso não encontrado neste evento!');
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <QrcodeOutlined style={{ color: '#0284c7', fontSize: 20 }} />
          <span>Credenciamento & Portaria: {event.title}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      destroyOnHidden
    >
      <div style={{
        padding: '16px',
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#f8fafc',
        borderRadius: 10,
        marginBottom: 20
      }}>
        <Title level={5} style={{ margin: '0 0 10px 0' }}>Validar Código QR / Código do Ingresso</Title>
        <Search
          placeholder="Digite ou escaneie o código (Ex: TKT-123456)..."
          enterButton="Validar Entrada"
          size="large"
          value={codeQuery}
          onChange={e => setCodeQuery(e.target.value)}
          onSearch={handleSearchCode}
        />
      </div>

      {lastCheckedTicket && (
        <Alert
          message="Última Validação:"
          description={`Ingresso ${lastCheckedTicket.ticket_code} liberado às ${dayjs(lastCheckedTicket.checked_in_at).format('HH:mm:ss')}`}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={eventTickets}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        size="small"
        columns={[
          {
            title: 'Código',
            dataIndex: 'ticket_code',
            key: 'code',
            render: code => <strong style={{ color: '#0284c7' }}>{code}</strong>
          },
          {
            title: 'Lote / Categoria',
            dataIndex: 'tier_id',
            key: 'tier',
            render: tid => {
              const tier = tiers.find(t => t.id === tid);
              return <Tag color="blue">{tier ? tier.name : tid}</Tag>;
            }
          },
          {
            title: 'Participante',
            dataIndex: 'attendee_user_id',
            key: 'attendee',
            render: uid => {
              const u = users.find(usr => usr.id === uid);
              return u ? (u.full_name || u.email) : uid?.substring(0, 8);
            }
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: st => {
              const cfg = TICKET_STATUS_CONFIG[st] || TICKET_STATUS_CONFIG.valid;
              return <Tag color={cfg.color}>{cfg.label}</Tag>;
            }
          },
          {
            title: 'Ação',
            key: 'act',
            render: (_, record) => (
              <Button
                type="primary"
                size="small"
                disabled={record.status === 'checked_in'}
                style={{
                  background: record.status === 'checked_in' ? undefined : '#10b981',
                  borderColor: record.status === 'checked_in' ? undefined : '#10b981'
                }}
                icon={<CheckCircleOutlined />}
                onClick={() => handlePerformCheckIn(record)}
              >
                {record.status === 'checked_in' ? 'Check-in OK' : 'Liberar Entrada'}
              </Button>
            )
          }
        ]}
      />
    </Modal>
  );
};
