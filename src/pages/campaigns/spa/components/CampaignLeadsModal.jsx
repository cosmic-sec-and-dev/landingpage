import React, { useState } from 'react';
import {
  Modal,
  Table,
  Tag,
  Button,
  Input,
  Space,
  Typography,
  message,
  Popconfirm
} from 'antd';
import {
  UserAddOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { Text } = Typography;

export const CampaignLeadsModal = ({
  visible,
  campaign,
  contacts = [],
  onClose,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const campaignContacts = contacts.filter(c => c.campaign_id === campaign?.id);

  const handleAddContact = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      const meRes = await apiRequest('/me');
      const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
      const tenantId = campaign?.tenant_id || meData?.tenant_id || '00000000-0000-0000-0000-000000000000';

      const res = await apiRequest('/campaign_contacts', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: tenantId,
          campaign_id: campaign.id,
          email: newEmail.trim(),
          read: false
        })
      });

      if (res.ok) {
        message.success('Contato adicionado à campanha!');
        setNewEmail('');
        onRefresh();
      } else {
        message.error('Falha ao adicionar contato');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const res = await apiRequest(`/campaign_contacts?id=eq.${contactId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Contato removido');
        onRefresh();
      }
    } catch {
      message.error('Erro ao excluir contato');
    }
  };

  const columns = [
    {
      title: 'E-mail do Destinatário',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span style={{ fontWeight: 500 }}><MailOutlined style={{ marginRight: 6 }} />{text}</span>
    },
    {
      title: 'Status de Leitura',
      dataIndex: 'read',
      key: 'read',
      render: (read) => (
        <Tag color={read ? 'success' : 'default'} icon={read ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {read ? 'Lido (Opened)' : 'Não Lido'}
        </Tag>
      )
    },
    {
      title: 'Data de Leitura',
      dataIndex: 'read_at',
      key: 'read_at',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Remover destinatário?"
          onConfirm={() => handleDeleteContact(record.id)}
        >
          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <Modal
      title={`Destinatários & Leads: ${campaign?.subject}`}
      open={visible}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>
      ]}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Adicionar novo e-mail de lead/contato..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onPressEnter={handleAddContact}
          />
          <Button type="primary" icon={<UserAddOutlined />} loading={adding} onClick={handleAddContact}>
            Adicionar Contato
          </Button>
        </Space.Compact>
      </div>

      <Table
        dataSource={campaignContacts}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        size="small"
      />
    </Modal>
  );
};
