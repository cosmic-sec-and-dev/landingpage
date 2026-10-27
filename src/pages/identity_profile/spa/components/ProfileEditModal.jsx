import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Avatar,
  Space,
  Row,
  Col,
  message,
  Card,
  Typography
} from 'antd';
import {
  UserOutlined,
  PictureOutlined,
  SaveOutlined,
  PhoneOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { TusUpload } from '../../../../components/upload/TusUpload';
import { apiRequest } from '../../../../services/api';

const { Text } = Typography;
const { TextArea } = Input;

export const ProfileEditModal = ({
  visible,
  profile,
  onClose,
  onSaved
}) => {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && visible) {
      form.setFieldsValue({
        full_name: profile.full_name || profile.name || '',
        display_name: profile.display_name || '',
        phone_number: profile.phone_number || profile.phone || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        avatar_url: profile.avatar_url || ''
      });
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, visible]);

  const handleFinish = async (values) => {
    if (!profile) return;
    setLoading(true);
    try {
      const payload = {
        full_name: values.full_name,
        display_name: values.display_name || null,
        phone_number: values.phone_number || null,
        bio: values.bio || null,
        website_url: values.website_url || null,
        avatar_url: avatarUrl || values.avatar_url || null
      };

      const res = await apiRequest(`/users?id=eq.${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        message.success('Perfil atualizado com sucesso!');
        onSaved();
      } else {
        const errData = res.data || {};
        message.error(errData.message || 'Falha ao atualizar perfil');
      }
    } catch {
      message.error('Erro de conexão ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Editar Perfil Pessoal"
      open={visible}
      onCancel={onClose}
      width={640}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          Salvar Alterações
        </Button>
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Avatar
            size={80}
            src={avatarUrl}
            icon={<UserOutlined />}
            style={{ marginBottom: 12, background: '#0284c7' }}
          />
          <div>
            <TusUpload
              value={avatarUrl}
              onChange={(url) => {
                setAvatarUrl(url || '');
                form.setFieldsValue({ avatar_url: url || '' });
              }}
              onSuccess={(url) => {
                setAvatarUrl(url || '');
                form.setFieldsValue({ avatar_url: url || '' });
                message.success('Foto carregada! Salve para confirmar.');
              }}
              placeholder="Cole a URL ou envie foto de perfil..."
              accept="image/*"
            />
          </div>
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={14}>
            <Form.Item
              label="Nome Completo"
              name="full_name"
              rules={[{ required: true, message: 'Informe seu nome completo' }]}
            >
              <Input placeholder="Ex: Arthur Pendelton" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              label="Nome de Exibição / Apelido"
              name="display_name"
            >
              <Input placeholder="Ex: Arthur" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Telefone de Contato"
              name="phone_number"
            >
              <Input prefix={<PhoneOutlined />} placeholder="+55 11 98765-4321" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Website / Link Pessoal"
              name="website_url"
            >
              <Input prefix={<GlobalOutlined />} placeholder="https://meusite.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Biografia / Apresentação" name="bio">
          <TextArea
            rows={3}
            placeholder="Fale brevemente sobre você, suas responsabilidades e especialidades..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item label="URL Direta do Avatar (Opcional)" name="avatar_url">
          <Input
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => {
              setAvatarUrl(e.target.value);
              form.setFieldsValue({ avatar_url: e.target.value });
            }}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
