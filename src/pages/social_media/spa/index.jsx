import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const SocialMediaSpaPage = () => {
  const { hasAccess } = usePlan();
  const { isDark } = useAppTheme();

  if (!hasAccess('Social Media') && !hasAccess('posts') && !hasAccess('social_media')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Social Media."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    posts: [],
    attachments: [],
    comments: [],
    likes: [],
    savedPosts: [],
    groups: [],
    users: [],
    profiles: [],
    chats: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllSocialData = async () => {
    setLoading(true);
    try {
      const [
        postsRes,
        attsRes,
        commentsRes,
        likesRes,
        savedRes,
        groupsRes,
        profilesRes,
        chatsRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest('/posts?order=created_at.desc'),
        apiRequest('/posts_attachments'),
        apiRequest('/comments?order=created_at.asc'),
        apiRequest('/likes'),
        apiRequest('/saved_posts'),
        apiRequest('/groups'),
        apiRequest('/social_profiles'),
        apiRequest('/social_chats'),
        apiRequest('/users'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        posts: postsRes.ok && Array.isArray(postsRes.data) ? postsRes.data : [],
        attachments: attsRes.ok && Array.isArray(attsRes.data) ? attsRes.data : [],
        comments: commentsRes.ok && Array.isArray(commentsRes.data) ? commentsRes.data : [],
        likes: likesRes.ok && Array.isArray(likesRes.data) ? likesRes.data : [],
        savedPosts: savedRes.ok && Array.isArray(savedRes.data) ? savedRes.data : [],
        groups: groupsRes.ok && Array.isArray(groupsRes.data) ? groupsRes.data : [],
        profiles: profilesRes.ok && Array.isArray(profilesRes.data) ? profilesRes.data : [],
        chats: chatsRes.ok && Array.isArray(chatsRes.data) ? chatsRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do Social Media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSocialData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <AppletHeader
          tag="Social Media"
          title="Social Workplace & Comunidades"
          description="Rede social interna da organização: feed corporativo, comunidades, discussões e mensageria direta."
          count={moduleData.posts.length}
        />
      </div>

      {loading && moduleData.posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          posts={moduleData.posts}
          attachments={moduleData.attachments}
          comments={moduleData.comments}
          likes={moduleData.likes}
          savedPosts={moduleData.savedPosts}
          groups={moduleData.groups}
          profiles={moduleData.profiles}
          users={moduleData.users}
          chats={moduleData.chats}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllSocialData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default SocialMediaSpaPage;
