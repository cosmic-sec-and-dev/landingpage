import React, { useState } from 'react';
import {
  Row,
  Col,
  Tabs,
  Button,
  Empty
} from 'antd';
import {
  UserOutlined,
  SafetyCertificateOutlined,
  BankOutlined
} from '@ant-design/icons';
import { ProfileCard } from '../components/ProfileCard';
import { ProfileEditModal } from '../components/ProfileEditModal';
import { SecuritySettingsCard } from '../components/SecuritySettingsCard';
import { TenantMembershipCard } from '../components/TenantMembershipCard';

export const MainAppView = ({
  profile,
  onRefresh,
  loading
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      key: 'overview',
      label: <span><UserOutlined /> Visão Geral & Dados</span>,
      children: (
        <div>
          <ProfileCard
            profile={profile}
            onEdit={() => setEditModalOpen(true)}
            onRefresh={onRefresh}
          />

          <div style={{ marginTop: 20 }}>
            <TenantMembershipCard profile={profile} />
          </div>
        </div>
      )
    },
    {
      key: 'security',
      label: <span><SafetyCertificateOutlined /> Segurança & Credenciais</span>,
      children: (
        <SecuritySettingsCard profile={profile} />
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabs}
        size="large"
      />

      <ProfileEditModal
        visible={editModalOpen}
        profile={profile}
        onClose={() => setEditModalOpen(false)}
        onSaved={() => {
          setEditModalOpen(false);
          onRefresh();
        }}
      />
    </div>
  );
};
