import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Segmented,
  Button,
  Avatar,
  Tag,
  Typography,
  Divider,
  Space,
  Empty,
  Badge
} from 'antd';
import {
  ShareAltOutlined,
  TeamOutlined,
  HeartOutlined,
  StarOutlined,
  PlusOutlined,
  MessageOutlined,
  UserOutlined,
  GlobalOutlined,
  FireOutlined,
  NotificationOutlined,
  EditOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { PostComposer } from '../components/PostComposer';
import { PostCard } from '../components/PostCard';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { DirectChatDrawer } from '../components/DirectChatDrawer';
import { SocialProfileModal } from '../components/SocialProfileModal';

const { Text, Title, Paragraph } = Typography;

export const MainAppView = ({
  posts = [],
  attachments = [],
  comments = [],
  likes = [],
  savedPosts = [],
  groups = [],
  profiles = [],
  users = [],
  chats = [],
  currentUser,
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'announcements' | 'discussions' | 'saved' | 'mine'
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const currentUserId = currentUser?.id;
  const myProfile = profiles.find(p => p.user_id === currentUserId) || profiles[0];

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (selectedGroupId && post.group_id !== selectedGroupId) return false;

    if (feedFilter === 'announcements') return post.post_type === 'announcement';
    if (feedFilter === 'discussions') return post.post_type === 'discussion';
    if (feedFilter === 'saved') {
      return savedPosts.some(s => s.post_id === post.id && s.user_id === currentUserId);
    }
    if (feedFilter === 'mine') return post.user_id === currentUserId;

    return true;
  });

  const statCardStyle = {
    background: isDark ? 'rgba(26, 35, 56, 0.75)' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    borderRadius: '14px',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.03)'
  };

  const widgetCardStyle = {
    background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: isDark ? '0 6px 24px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.03)',
    marginBottom: '20px'
  };

  return (
    <div>
      {/* Top Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '22px' }}>
        <Col xs={12} sm={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Publicações no Feed"
              value={posts.length}
              prefix={<ShareAltOutlined style={{ color: '#d946ef' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Comunidades & Grupos"
              value={groups.length}
              prefix={<TeamOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Reações & Curtidas"
              value={likes.length}
              prefix={<HeartOutlined style={{ color: '#ec4899' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card style={statCardStyle} styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="Publicações Salvas"
              value={savedPosts.length}
              prefix={<StarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Social Hub Layout */}
      <Row gutter={[24, 24]}>
        {/* Left / Center Feed Stream */}
        <Col xs={24} lg={16}>
          {/* Post Composer */}
          <PostComposer
            groups={groups}
            currentUser={currentUser}
            onPostCreated={onRefresh}
          />

          {/* Feed Filter Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px'
          }}>
            <Segmented
              options={[
                { label: 'Todos', value: 'all', icon: <GlobalOutlined /> },
                { label: 'Comunicados', value: 'announcements', icon: <NotificationOutlined /> },
                { label: 'Tópicos', value: 'discussions', icon: <FireOutlined /> },
                { label: 'Salvos', value: 'saved', icon: <StarOutlined /> },
                { label: 'Meus Posts', value: 'mine', icon: <UserOutlined /> }
              ]}
              value={feedFilter}
              onChange={setFeedFilter}
              style={{
                background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#e2e8f0',
                padding: '4px',
                borderRadius: '10px'
              }}
            />

            {selectedGroupId && (
              <Tag
                closable
                onClose={() => setSelectedGroupId(null)}
                color="purple"
                style={{ borderRadius: '6px', padding: '4px 10px', fontSize: '13px' }}
              >
                Filtrado por Grupo: {groups.find(g => g.id === selectedGroupId)?.name}
              </Tag>
            )}
          </div>

          {/* Posts Feed Stream */}
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                attachments={attachments}
                comments={comments}
                likes={likes}
                savedPosts={savedPosts}
                groups={groups}
                profiles={profiles}
                users={users}
                currentUser={currentUser}
                onRefresh={onRefresh}
              />
            ))
          ) : (
            <Card style={widgetCardStyle} styles={{ body: { padding: '40px', textAlign: 'center' } }}>
              <Empty
                description={
                  <span style={{ color: '#94a3b8' }}>
                    Nenhuma publicação encontrada para o filtro selecionado.
                  </span>
                }
              />
            </Card>
          )}
        </Col>

        {/* Right Column: Widgets & Directory */}
        <Col xs={24} lg={8}>
          {/* User Profile Summary Card */}
          <Card style={widgetCardStyle} styles={{ body: { padding: '20px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <Avatar
                size={54}
                src={currentUser?.avatar_url}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 12px rgba(217, 70, 239, 0.3)'
                }}
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: '16px', display: 'block' }}>
                  {currentUser?.full_name || 'Meu Perfil'}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {currentUser?.email}
                </Text>
              </div>
              <Button
                type="text"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => setProfileModalOpen(true)}
              />
            </div>

            {myProfile?.bio && (
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ fontSize: '13px', color: isDark ? '#cbd5e1' : '#475569', marginBottom: '14px' }}
              >
                {myProfile.bio}
              </Paragraph>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '10px 0',
              background: isDark ? 'rgba(26, 35, 56, 0.4)' : '#f8fafc',
              borderRadius: '10px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: '16px', color: '#d946ef' }}>
                  {myProfile?.followers_count || 0}
                </Text>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Seguidores</div>
              </div>
              <Divider type="vertical" style={{ height: '32px' }} />
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: '16px', color: '#8b5cf6' }}>
                  {myProfile?.following_count || 0}
                </Text>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Seguindo</div>
              </div>
            </div>
          </Card>

          {/* Communities & Groups Widget */}
          <Card
            style={widgetCardStyle}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <TeamOutlined style={{ color: '#8b5cf6' }} />
                  <span>Comunidades</span>
                </Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateGroupOpen(true)}
                  style={{
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
                    border: 'none'
                  }}
                >
                  Novo Grupo
                </Button>
              </div>
            }
            styles={{ body: { padding: '16px' } }}
          >
            {groups.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groups.map(group => {
                  const isSelected = selectedGroupId === group.id;
                  return (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupId(isSelected ? null : group.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: isSelected
                          ? (isDark ? 'rgba(217, 70, 239, 0.15)' : '#fdf4ff')
                          : (isDark ? 'rgba(26, 35, 56, 0.4)' : '#f8fafc'),
                        border: isSelected
                          ? '1px solid #d946ef'
                          : (isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9'),
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <Text strong style={{ fontSize: '13.5px', color: isSelected ? '#d946ef' : undefined }}>
                          {group.name}
                        </Text>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          {group.members_count || 1} membros • {group.privacy_type === 'private' ? '🔒 Privado' : '🌐 Público'}
                        </div>
                      </div>

                      <Tag color={isSelected ? 'purple' : 'default'} style={{ borderRadius: '6px' }}>
                        {isSelected ? 'Ativo' : 'Ver Feed'}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: '13px' }}>
                Nenhuma comunidade criada ainda.
              </div>
            )}
          </Card>

          {/* Direct Messages Quick Widget */}
          <Card
            style={widgetCardStyle}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <MessageOutlined style={{ color: '#ec4899' }} />
                  <span>Mensagens Diretas</span>
                </Space>
                <Button
                  size="small"
                  onClick={() => setChatDrawerOpen(true)}
                  style={{ borderRadius: '6px' }}
                >
                  Abrir Chat
                </Button>
              </div>
            }
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <Button
                type="primary"
                block
                icon={<MessageOutlined />}
                onClick={() => setChatDrawerOpen(true)}
                style={{
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                Abrir Mensagens ({chats.length} conversas)
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modals & Drawers */}
      <CreateGroupModal
        open={createGroupOpen}
        onCancel={() => setCreateGroupOpen(false)}
        onSuccess={onRefresh}
        currentUser={currentUser}
      />

      <DirectChatDrawer
        open={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        chats={chats}
        currentUser={currentUser}
        onRefresh={onRefresh}
      />

      <SocialProfileModal
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        onSuccess={onRefresh}
        profile={myProfile}
        currentUser={currentUser}
      />
    </div>
  );
};
