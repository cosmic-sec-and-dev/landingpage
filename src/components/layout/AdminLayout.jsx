import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Dropdown, Space, Typography, Tag, Button, Form, Input, Card, Tooltip, message } from 'antd';
import { UserOutlined, BellOutlined, GlobalOutlined, CheckCircleOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { Sidebar } from './Sidebar';
import { apiRequest, setAuthToken, getAuthToken } from '../../services/api';
import { usePlan } from '../../context/PlanContext';
import { useAppTheme } from '../../context/ThemeContext';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Isolated LoginFormCard subcomponent to ensure useForm lifecycle is strictly scoped to mount
const LoginFormCard = ({ onLogin, loading, isDark, onNavigate, toggleTheme }) => {
  const [form] = Form.useForm();

  const handleQuickDemoLogin = () => {
    form.setFieldsValue({
      email: 'cosmic@cosmic.com',
      password: 'admin',
      tenant_slug: 'cosmic'
    });
    onLogin({
      email: 'cosmic@cosmic.com',
      password: 'admin',
      tenant_slug: 'cosmic'
    });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: isDark
        ? 'radial-gradient(circle at 15% 20%, rgba(49, 111, 160, 0.45) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(192, 94, 110, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(93, 75, 133, 0.25) 0%, transparent 60%), #151C37'
        : 'radial-gradient(circle at 15% 20%, rgba(49, 111, 160, 0.15) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(192, 94, 110, 0.15) 0%, transparent 45%), #EFDFD2',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}>
        <Tooltip title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}>
          <Button
            type="text"
            shape="circle"
            icon={isDark ? <SunOutlined style={{ color: '#eab308', fontSize: '18px' }} /> : <MoonOutlined style={{ color: '#0284c7', fontSize: '18px' }} />}
            onClick={toggleTheme}
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)'
            }}
          />
        </Tooltip>
      </div>
      <Card
        variant="outlined"
        styles={{ body: { padding: 24 } }}
        style={{
          width: 420,
          background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)' : '0 20px 40px rgba(0, 0, 0, 0.08)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '22px',
            fontWeight: 800,
            marginBottom: '12px'
          }}>
            SL
          </div>
          <Title level={3} style={{ margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>Selene</Title>
          <Paragraph style={{ color: isDark ? '#94a3b8' : '#64748b', margin: '4px 0 0 0' }}>Autenticação PostgREST & Multi-Tenant RLS</Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onLogin}
        >
          <Form.Item label={<span style={{ color: isDark ? '#cbd5e1' : '#334155' }}>E-mail</span>} name="email" rules={[{ required: true, message: 'Por favor, informe seu e-mail' }]}>
            <Input placeholder="seu.email@empresa.com" size="large" autoFocus style={{ background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1', color: isDark ? '#fff' : '#0f172a' }} />
          </Form.Item>
          <Form.Item label={<span style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Senha</span>} name="password" rules={[{ required: true, message: 'Por favor, informe sua senha' }]}>
            <Input.Password placeholder="Sua senha de acesso" size="large" style={{ background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1', color: isDark ? '#fff' : '#0f172a' }} />
          </Form.Item>
          <Form.Item label={<span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Tenant Slug (Opcional)</span>} name="tenant_slug">
            <Input placeholder="slug-da-organizacao" size="large" style={{ background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1', color: isDark ? '#fff' : '#0f172a' }} />
          </Form.Item>
          <Form.Item style={{ marginTop: '24px', marginBottom: '10px' }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)', border: 0, fontWeight: 600, height: '42px' }}>
              Entrar no Dashboard
            </Button>
          </Form.Item>
          <Button
            type="dashed"
            block
            onClick={handleQuickDemoLogin}
            loading={loading}
            style={{ marginBottom: '12px' }}
          >
            Entrar como Cosmic Admin (Demo)
          </Button>
          <Button
            type="text"
            block
            onClick={() => onNavigate?.('landing')}
            style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '13px' }}
          >
            ← Voltar para a Landing Page
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export const AdminLayout = ({ children, applets, modules, currentRoute, onNavigate }) => {
  const { currentPlan, currentUser, setCurrentUser, refetchProfile, authorizedApplets } = usePlan();
  const { isDark, toggleTheme } = useAppTheme();
  const [token, setToken] = useState(getAuthToken());
  const [loginLoading, setLoginLoading] = useState(false);

  const effectiveApplets = (authorizedApplets && Object.keys(authorizedApplets).length > 0)
    ? authorizedApplets
    : (applets || modules || {});

  // Busca perfil /me quando o token estiver presente
  const fetchProfile = async () => {
    const currentTok = getAuthToken();
    if (!currentTok) return;
    try {
      const { data, ok, status } = await apiRequest('/me');
      if (ok && Array.isArray(data) && data.length > 0) {
        if (setCurrentUser) setCurrentUser(data[0]);
      } else if (status === 401 || (ok && Array.isArray(data) && data.length === 0)) {
        // Token is invalid, expired, or database was restored
        localStorage.removeItem('access_token');
        setToken('');
        if (setCurrentUser) setCurrentUser(null);
      }
    } catch (e) {
      // Waiting for authentication
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleLogin = async (values) => {
    setLoginLoading(true);
    try {
      const payload = {
        email: values.email?.trim(),
        password: values.password,
        ...(values.tenant_slug?.trim() ? { tenant_slug: values.tenant_slug.trim() } : {})
      };
      const res = await apiRequest('/rpc/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok && res.data?.access_token) {
        const validToken = await setAuthToken(res.data.access_token);
        setToken(validToken);
        if (res.data.user && setCurrentUser) {
          setCurrentUser(res.data.user);
        }
        if (refetchProfile) refetchProfile();
        message.success('Autenticado com sucesso!');
      } else {
        message.error(res.data?.message || 'Credenciais inválidas');
      }
    } catch (err) {
      message.error('Erro de conexão ao realizar login');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken('');
    if (setCurrentUser) setCurrentUser(null);
    if (refetchProfile) refetchProfile();
    message.info('Sessão encerrada');
  };

  const userMenu = {
    items: [
      {
        key: 'header',
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px' }}>
            <Avatar
              src={currentUser?.avatar_url || currentUser?.avatar}
              icon={<UserOutlined />}
              size="default"
              style={{ backgroundColor: '#2563eb' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>{currentUser?.full_name || 'Cosmic Admin'}</div>
              <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>{currentUser?.email || 'admin@cosmic.com'}</div>
            </div>
          </div>
        )
      },
      { type: 'divider' },
      { key: 'role', label: `Cargo: ${currentUser?.role || 'superadmin'}` },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Sair / Desconectar', onClick: handleLogout }
    ]
  };

  // Se não estiver autenticado, exibe a tela de Login do PostgREST
  if (!token) {
    return (
      <LoginFormCard
        onLogin={handleLogin}
        loading={loginLoading}
        isDark={isDark}
        onNavigate={onNavigate}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Layout style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: isDark
        ? 'linear-gradient(135deg, #151C37 0%, #273357 40%, #5D4B85 75%, #C05E6E 100%)'
        : 'linear-gradient(135deg, #F7E9EC 0%, #EFDFD2 40%, #E0ECF5 75%, #FBEADB 100%)'
    }}>
      <Sidebar applets={effectiveApplets} currentRoute={currentRoute} onNavigate={onNavigate} />
      <Layout style={{
        height: '100vh',
        overflow: 'hidden',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px 16px 10px'
      }}>
        <Header style={{
          height: '60px',
          lineHeight: '60px',
          flexShrink: 0,
          background: isDark ? '#0b152b' : '#ffffff',
          borderRadius: '14px',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: isDark ? '1px solid rgba(56, 189, 248, 0.16)' : '1px solid #cbd5e1',
          boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.45)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
          marginBottom: '12px',
          zIndex: 10
        }}>
          <Space size="middle">
            <GlobalOutlined style={{ color: '#38bdf8' }} />
            <Text style={{ color: isDark ? '#cbd5e1' : '#334155' }} strong>Organização:</Text>
            <Tag color="cyan" style={{ border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd', background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#e0f2fe', color: '#0284c7' }}>
              {currentUser?.tenant_name || currentUser?.tenant?.name || 'Cosmic Enterprises'}
            </Tag>
            <Text type="secondary" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Plano:</Text>
            <Tag color="purple" style={{ border: isDark ? '1px solid rgba(192, 132, 252, 0.3)' : '1px solid #e9d5ff', background: isDark ? 'rgba(192, 132, 252, 0.1)' : '#f3e8ff', color: '#7c3aed' }}>
              {currentPlan}
            </Tag>
          </Space>
          <Space size="middle">
            <Button
              type="dashed"
              size="small"
              icon={<GlobalOutlined />}
              onClick={() => onNavigate?.('landing')}
              style={{ borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : '#0284c7', color: isDark ? '#38bdf8' : '#0284c7', background: isDark ? 'rgba(56, 189, 248, 0.05)' : '#f0f9ff' }}
            >
              Suíte Selene
            </Button>

            {/* Theme Toggle Button */}
            <Tooltip title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}>
              <Button
                type="text"
                shape="circle"
                icon={isDark ? <SunOutlined style={{ color: '#eab308', fontSize: '16px' }} /> : <MoonOutlined style={{ color: '#0284c7', fontSize: '16px' }} />}
                onClick={toggleTheme}
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Tooltip>

            <Tag icon={<CheckCircleOutlined />} color="success" style={{ border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid #bbf7d0', background: isDark ? 'rgba(74, 222, 128, 0.1)' : '#f0fdf4', color: '#16a34a' }}>
              JWT Ativo
            </Tag>
            <BellOutlined style={{ fontSize: '18px', color: isDark ? '#cbd5e1' : '#64748b', cursor: 'pointer' }} />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={currentUser?.avatar_url || currentUser?.avatar}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#2563eb', border: isDark ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #93c5fd' }}
                />
                <Text style={{ color: isDark ? '#f8fafc' : '#0f172a' }} strong>{currentUser?.full_name || 'Cosmic Admin'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content Solid Card Container with Internal Scroll */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          background: isDark ? '#0b152b' : '#f8fafc',
          borderRadius: '14px',
          border: isDark ? '1px solid rgba(56, 189, 248, 0.16)' : '1px solid #cbd5e1',
          boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Content style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px',
            background: 'transparent'
          }} className="custom-content-scroll">
            {children}
          </Content>
        </div>
      </Layout>
    </Layout>
  );
};
