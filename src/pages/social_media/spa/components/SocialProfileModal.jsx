import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Statistic, Divider, message } from 'antd';
import { UserOutlined, LinkOutlined, GlobalOutlined, GithubOutlined, LinkedinOutlined, TwitterOutlined } from '@ant-design/icons';
import { apiRequest } from '../../../../services/api';

const { TextArea } = Input;

export const SocialProfileModal = ({ open, onCancel, onSuccess, profile, currentUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        bio: profile?.bio || '',
        website: profile?.social_links?.website || '',
        linkedin: profile?.social_links?.linkedin || '',
        github: profile?.social_links?.github || '',
        twitter: profile?.social_links?.twitter || ''
      });
    }
  }, [open, profile]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let userId = currentUser?.id;
      if (!userId) {
        const meRes = await apiRequest('/me');
        const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
        userId = meData?.id;
      }

      const socialLinks = {
        website: values.website || '',
        linkedin: values.linkedin || '',
        github: values.github || '',
        twitter: values.twitter || ''
      };

      if (profile?.id) {
        // Update existing profile
        await apiRequest(`/social_profiles?id=eq.${profile.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            bio: values.bio?.trim() || '',
            social_links: socialLinks
          })
        });
      } else {
        // Create new profile
        await apiRequest('/social_profiles', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            bio: values.bio?.trim() || '',
            followers_count: 0,
            following_count: 0,
            social_links: socialLinks
          })
        });
      }

      message.success('Perfil social atualizado com sucesso!');
      if (onSuccess) onSuccess();
      onCancel();
    } catch {
      message.error('Erro ao salvar perfil social');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: '#d946ef' }} />
          <span>Editar Perfil Social & Bio</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Salvar Perfil"
      cancelText="Cancelar"
      destroyOnHidden
      centered
      width={560}
    >
      <div style={{ marginTop: '16px' }}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={12}>
            <Statistic
              title="Seguidores"
              value={profile?.followers_count || 0}
              valueStyle={{ color: '#d946ef', fontWeight: 700 }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Seguindo"
              value={profile?.following_count || 0}
              valueStyle={{ color: '#8b5cf6', fontWeight: 700 }}
            />
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Form form={form} layout="vertical">
          <Form.Item name="bio" label="Biografia / Apresentação">
            <TextArea
              placeholder="Conte aos membros da organização sobre sua atuação, interesses e projetos..."
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="website" label="Website / Blog">
                <Input prefix={<GlobalOutlined />} placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="linkedin" label="LinkedIn">
                <Input prefix={<LinkedinOutlined />} placeholder="linkedin.com/in/..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="github" label="GitHub">
                <Input prefix={<GithubOutlined />} placeholder="github.com/..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="twitter" label="Twitter / X">
                <Input prefix={<TwitterOutlined />} placeholder="@usuario" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};
