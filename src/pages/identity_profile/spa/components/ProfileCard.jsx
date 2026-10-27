import React, { useState } from 'react';
import {
  Card,
  Avatar,
  Tag,
  Typography,
  Descriptions,
  Space,
  Button,
  Tooltip,
  Modal,
  Input,
  message,
  Badge,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  EditOutlined,
  CameraOutlined,
  GlobalOutlined,
  DeleteOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TusUpload } from '../../../../components/upload/TusUpload';
import { apiRequest } from '../../../../services/api';

const { Title, Text, Paragraph } = Typography;

export const ProfileCard = ({
  profile,
  onEdit,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);

  if (!profile) return null;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copiado!`);
  };

  const handleOpenPhotoModal = () => {
    setPhotoUrl(profile.avatar_url || '');
    setPhotoModalOpen(true);
  };

  const handleSavePhoto = async (newUrl) => {
    const rawUrl = newUrl !== undefined ? newUrl : photoUrl;
    const targetUrl = (rawUrl || '').trim();

    if (newUrl === undefined && !targetUrl) {
      message.warning('Por favor, informe uma URL ou faça o upload de uma imagem antes de salvar.');
      return;
    }

    setSavingPhoto(true);
    try {
      const res = await apiRequest(`/users?id=eq.${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          avatar_url: targetUrl || null
        })
      });

      if (res.ok) {
        message.success(targetUrl ? 'Foto de perfil atualizada com sucesso!' : 'Foto de perfil removida com sucesso!');
        setPhotoModalOpen(false);
        if (onRefresh) onRefresh();
      } else {
        const errData = res.data || {};
        message.error(errData.message || 'Falha ao atualizar foto de perfil');
      }
    } catch {
      message.error('Erro de conexão ao atualizar foto de perfil');
    } finally {
      setSavingPhoto(false);
    }
  };

  const displayName = profile.full_name || profile.display_name || profile.username || profile.email?.split('@')[0] || 'Usuário';

  return (
    <>
      <Card
        style={{
          borderRadius: 16,
          background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Avatar with Quick Photo Change Button */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={84}
                src={profile.avatar_url}
                icon={<UserOutlined />}
                style={{
                  background: '#0284c7',
                  boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
                  border: isDark ? '3px solid #334155' : '3px solid #ffffff'
                }}
              />
              <Tooltip title="Alterar foto de perfil">
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<CameraOutlined />}
                  onClick={handleOpenPhotoModal}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    border: '2px solid #ffffff'
                  }}
                />
              </Tooltip>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Title level={4} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  {displayName}
                </Title>
                {profile.display_name && profile.display_name !== profile.full_name && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    ({profile.display_name})
                  </Text>
                )}
                <Tag color={profile.is_active !== false ? 'success' : 'error'} style={{ borderRadius: 6 }}>
                  {profile.is_active !== false ? 'CONTA ATIVA' : 'INATIVO'}
                </Tag>
              </div>

              <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <MailOutlined /> {profile.email}
              </Text>

              {profile.bio && (
                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ margin: '6px 0 0', fontSize: 13, maxWidth: 600 }}
                >
                  {profile.bio}
                </Paragraph>
              )}
            </div>
          </div>

          <Space wrap>
            <Button
              icon={<CameraOutlined />}
              onClick={handleOpenPhotoModal}
            >
              Trocar Foto
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(profile)}
            >
              Editar Perfil
            </Button>
          </Space>
        </div>

        <Descriptions
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
          size="small"
          style={{ marginTop: 12 }}
        >
          <Descriptions.Item label="Nome Completo">
            <Text strong>{profile.full_name || 'Não informado'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Cargo / Função">
            <Tag color="geekblue">{profile.role || 'Membro da Organização'}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Telefone">
            {profile.phone_number ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <PhoneOutlined /> {profile.phone_number}
              </span>
            ) : (
              <Text type="secondary">Não informado</Text>
            )}
          </Descriptions.Item>

          {profile.website_url && (
            <Descriptions.Item label="Website">
              <a
                href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <GlobalOutlined /> {profile.website_url}
              </a>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Membro Desde">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClockCircleOutlined />
              {profile.created_at ? dayjs(profile.created_at).format('DD/MM/YYYY') : 'Recentemente'}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="ID de Usuário">
            <Space>
              <Text code>{profile.id}</Text>
              <Tooltip title="Copiar ID">
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(profile.id, 'ID do Usuário')}
                />
              </Tooltip>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Tenant ID">
            <Space>
              <Text code>{profile.tenant_id || '00000000-0000'}</Text>
              <Tooltip title="Copiar Tenant ID">
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(profile.tenant_id, 'Tenant ID')}
                />
              </Tooltip>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Modal Dedicado para Alterar Exclusivamente a Foto de Perfil */}
      <Modal
        title="Alterar Foto de Perfil"
        open={photoModalOpen}
        onCancel={() => setPhotoModalOpen(false)}
        footer={[
          profile.avatar_url && (
            <Popconfirm
              key="delete"
              title="Remover foto de perfil?"
              description="Sua conta passará a exibir o ícone padrão."
              onConfirm={() => handleSavePhoto(null)}
              okText="Sim, remover"
              cancelText="Cancelar"
            >
              <Button danger icon={<DeleteOutlined />} loading={savingPhoto}>
                Remover Foto
              </Button>
            </Popconfirm>
          ),
          <Button key="cancel" onClick={() => setPhotoModalOpen(false)}>
            Cancelar
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={savingPhoto}
            onClick={() => handleSavePhoto()}
          >
            Salvar Foto
          </Button>
        ].filter(Boolean)}
        width={480}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Avatar
            size={100}
            src={photoUrl}
            icon={<UserOutlined />}
            style={{
              marginBottom: 16,
              background: '#0284c7',
              border: '3px solid #0284c7'
            }}
          />

          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
              Selecione uma imagem do computador ou informe uma URL direta:
            </Text>
            <TusUpload
              value={photoUrl}
              onChange={(url) => setPhotoUrl(url || '')}
              onSuccess={(url) => {
                setPhotoUrl(url || '');
                message.success('Upload concluído! Clique em Salvar para aplicar.');
              }}
              placeholder="Cole a URL ou envie foto (PNG, JPG, WebP)..."
              accept="image/*"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
