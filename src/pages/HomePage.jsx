import React, { useState, useMemo } from 'react';
import { Row, Col, Typography, Input, Button, Card, Tag, Space, Badge, Tooltip } from 'antd';
import {
  SearchOutlined,
  RobotOutlined,
  SendOutlined,
  AppstoreOutlined,
  RightOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
  ProjectOutlined,
  MedicineBoxOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FundProjectionScreenOutlined,
  CalendarOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  MailOutlined,
  CreditCardOutlined,
  HomeOutlined,
  CoffeeOutlined,
  ShareAltOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  BookOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';
import saasBannerImg from '../assets/images/cosmic_car.png';

const { Title, Paragraph, Text } = Typography;

const appletColorSchemes = {
  'Kanban': { bg: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)', badge: 'KB', color: '#38bdf8', icon: <ProjectOutlined /> },
  'Clinics': { bg: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', badge: 'CL', color: '#10b981', icon: <MedicineBoxOutlined /> },
  'Commerce Hub': { bg: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)', badge: 'CH', color: '#14b8a6', icon: <ShoppingCartOutlined /> },
  'Crm': { bg: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)', badge: 'CR', color: '#ec4899', icon: <FundProjectionScreenOutlined /> },
  'Ecommerce': { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', badge: 'EC', color: '#06b6d4', icon: <ShopOutlined /> },
  'Collaboration': { bg: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', badge: 'CO', color: '#8b5cf6', icon: <TeamOutlined /> },
  'Events': { bg: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', badge: 'EV', color: '#f59e0b', icon: <CalendarOutlined /> },
  'Helpdesk': { bg: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)', badge: 'HD', color: '#6366f1', icon: <CustomerServiceOutlined /> },
  'Infrastructure': { bg: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', badge: 'IN', color: '#14b8a6', icon: <CloudServerOutlined /> },
  'Json Box': { bg: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)', badge: 'JB', color: '#a855f7', icon: <DatabaseOutlined /> },
  'Notifications': { bg: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)', badge: 'NO', color: '#f97316', icon: <MailOutlined /> },
  'Payments': { bg: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)', badge: 'PA', color: '#22c55e', icon: <CreditCardOutlined /> },
  'Real Estate': { bg: 'linear-gradient(135deg, #0284c7 0%, #7dd3fc 100%)', badge: 'RE', color: '#0ea5e9', icon: <HomeOutlined /> },
  'Restaurants': { bg: 'linear-gradient(135deg, #d97706 0%, #fcd34d 100%)', badge: 'RS', color: '#f59e0b', icon: <CoffeeOutlined /> },
  'Social Media': { bg: 'linear-gradient(135deg, #c026d3 0%, #f0abfc 100%)', badge: 'SM', color: '#d946ef', icon: <ShareAltOutlined /> },
  'Users & RBAC': { bg: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)', badge: 'UR', color: '#3b82f6', icon: <UserOutlined /> },
  'Identity & Profile': { bg: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)', badge: 'ID', color: '#06b6d4', icon: <UserOutlined /> },
  'Tenants': { bg: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)', badge: 'TN', color: '#64748b', icon: <BankOutlined /> },
  'Plans & Subscriptions': { bg: 'linear-gradient(135deg, #9333ea 0%, #e879f9 100%)', badge: 'PL', color: '#a855f7', icon: <CreditCardOutlined /> },
  'Audit & System Logs': { bg: 'linear-gradient(135deg, #334155 0%, #64748b 100%)', badge: 'LG', color: '#94a3b8', icon: <FileTextOutlined /> },
  'CMS Advanced': { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', badge: 'CMS', color: '#0284c7', icon: <BookOutlined /> },
  'Blogger': { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', badge: 'BL', color: '#0284c7', icon: <BookOutlined /> },
  'Campaigns': { bg: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)', badge: 'CP', color: '#ef4444', icon: <FireOutlined /> },
  'AntTest': { bg: 'linear-gradient(135deg, #ca8a04 0%, #fde047 100%)', badge: 'AT', color: '#eab308', icon: <ExperimentOutlined /> }
};

export const HomePage = ({ applets = {}, modules = {}, onNavigate }) => {
  const { isDark } = useAppTheme();
  const { hasAccess, authorizedApplets } = usePlan();
  const [searchTerm, setSearchTerm] = useState('');

  const effectiveApplets = (authorizedApplets && Object.keys(authorizedApplets).length > 0)
    ? authorizedApplets
    : (Object.keys(applets).length > 0 ? applets : modules);

  const appletsData = effectiveApplets;

  // Format applets into app items
  const appsList = useMemo(() => {
    return Object.entries(appletsData).map(([tag, endpoints]) => {
      const isKanban = tag.toLowerCase() === 'kanban';
      const scheme = appletColorSchemes[tag] || {
        bg: 'linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)',
        badge: tag.substring(0, 2).toUpperCase(),
        color: '#3b82f6',
        icon: <AppstoreOutlined />
      };

      const cleanAppKey = tag.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const primaryRouteKey = isKanban ? 'kanban' : `${cleanAppKey}_main`;
      const isAllowed = hasAccess(tag);

      return {
        id: tag,
        name: tag,
        routeKey: primaryRouteKey,
        endpointsCount: endpoints.length,
        endpoints,
        isAllowed,
        badge: scheme.badge,
        bg: scheme.bg,
        color: scheme.color,
        icon: scheme.icon,
        description: endpoints[0]?.description || `${endpoints.length} endpoints gerenciados`
      };
    });
  }, [appletsData, hasAccess]);

  // Filter apps based on search
  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) return appsList;
    const lower = searchTerm.toLowerCase();
    return appsList.filter(app =>
      app.name.toLowerCase().includes(lower) ||
      app.description.toLowerCase().includes(lower) ||
      app.endpoints.some(ep => ep.path.toLowerCase().includes(lower))
    );
  }, [appsList, searchTerm]);

  const handleLaunchBotChat = () => {
    if (onNavigate) {
      onNavigate('support_chat');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '40px' }}>

      {/* 1. TOP HERO BANNER WITH IMAGE & BOT SEARCH */}
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '32px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(26, 35, 56, 0.95) 0%, rgba(8, 13, 26, 0.98) 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #cbd5e1',
          boxShadow: isDark
            ? '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)'
            : '0 12px 32px rgba(15, 23, 42, 0.15)'
        }}
      >
        {/* Banner Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(240px, 1fr)',
          alignItems: 'center',
          gap: '24px',
          padding: '36px 36px 32px'
        }}>
          {/* Left Column: Heading & Smart Bot Search */}
          <div style={{ zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '16px' }}>
              <RobotOutlined style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.4px' }}>
                CENTRAL DE APLICATIVOS & FAQ BOT
              </span>
            </div>

            <Title level={2} style={{ color: '#ffffff', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              O que você deseja gerenciar hoje?
            </Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Pesquise ferramentas, acesse os applets multi-tenant ou consulte o assistente inteligente para tirar dúvidas rápidas.
            </Paragraph>

            {/* Smart Search & Bot Input Bar */}
            <div style={{
              display: 'flex',
              gap: '8px',
              background: 'rgba(26, 35, 56, 0.85)',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: '#38bdf8', fontSize: '18px', marginRight: '6px' }} />}
                placeholder="Buscar aplicativo (ex: Kanban, Clínicas) ou pergunte ao FAQ Bot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={() => {
                  if (searchTerm.trim() && filteredApps.length === 0) {
                    handleLaunchBotChat();
                  }
                }}
                variant="borderless"
                style={{
                  color: '#ffffff',
                  fontSize: '15px'
                }}
              />
              <Button
                type="primary"
                size="large"
                icon={<RobotOutlined />}
                onClick={handleLaunchBotChat}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                  border: 0,
                  fontWeight: 600,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
                }}
              >
                Abrir Chat
              </Button>
            </div>

            {/* Quick Suggestions Chips */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Acesso rápido:</span>
              <Tag
                color="blue"
                style={{ cursor: 'pointer', margin: 0, borderRadius: '12px', border: '1px solid rgba(56,189,248,0.3)' }}
                onClick={() => onNavigate?.('kanban')}
              >
                Kanban SPA
              </Tag>
              <Tag
                color="green"
                style={{ cursor: 'pointer', margin: 0, borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}
                onClick={() => onNavigate?.('clinics')}
              >
                Clínicas & Saúde
              </Tag>
              <Tag
                color="cyan"
                style={{ cursor: 'pointer', margin: 0, borderRadius: '12px', border: '1px solid rgba(6,182,212,0.3)' }}
                onClick={() => onNavigate?.('commerce_hub')}
              >
                Commerce Hub & POS
              </Tag>
              <Tag
                color="purple"
                style={{ cursor: 'pointer', margin: 0, borderRadius: '12px', border: '1px solid rgba(168,85,247,0.3)' }}
                onClick={handleLaunchBotChat}
              >
                💬 Dúvidas / FAQ
              </Tag>
            </div>
          </div>

          {/* Right Column: Hero Graphic Image */}
          <div style={{
            position: 'relative',
            height: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
            background: 'rgba(8, 13, 26, 0.8)'
          }}>
            <img
              src={saasBannerImg}
              alt="Selene Platform"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transition: 'transform 0.4s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        </div>
      </div>

      {/* 2. SECTION HEADER & STATS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={3} style={{ color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontSize: '20px', fontWeight: 700 }}>
            Aplicativos & Applets Disponíveis
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {filteredApps.length} applets encontrados • Selecione um applet para iniciar
          </Text>
        </div>

        <Space>
          <Button
            icon={<CustomerServiceOutlined />}
            onClick={handleLaunchBotChat}
            style={{
              borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#cbd5e1',
              color: isDark ? '#38bdf8' : '#0284c7'
            }}
          >
            Atendimento & Chat
          </Button>
        </Space>
      </div>

      {/* 3. APPS GRID (LETTERS & VIBRANT COLORS) */}
      <Row gutter={[20, 20]}>
        {filteredApps.filter(app => app.isAllowed).map((app) => (
          <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
            <Card
              hoverable
              onClick={() => {
                if (app.isAllowed && onNavigate) {
                  onNavigate(app.routeKey);
                }
              }}
              style={{
                height: '100%',
                background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.04)',
                opacity: app.isAllowed ? 1 : 0.6,
                cursor: app.isAllowed ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              styles={{
                body: {
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }
              }}
            >
              {/* Top Row: Color Letter Badge & Endpoints Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: app.bg,
                  boxShadow: `0 4px 16px ${app.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '18px',
                  letterSpacing: '0.5px'
                }}>
                  {app.badge}
                </div>

                <Tag color={app.isAllowed ? 'blue' : 'default'} style={{ margin: 0, fontSize: '11px', borderRadius: '4px' }}>
                  {app.endpointsCount} tabelas
                </Tag>
              </div>

              {/* Title and Description */}
              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ fontSize: '16px', color: isDark ? '#f8fafc' : '#0f172a', display: 'block' }}>
                  {app.name}
                </Text>
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    fontSize: '12px',
                    color: isDark ? '#94a3b8' : '#64748b',
                    margin: '6px 0 0 0',
                    lineHeight: 1.4
                  }}
                >
                  {app.description}
                </Paragraph>
              </div>

              {/* Footer CTA */}
              <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: app.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {app.isAllowed ? 'Acessar Applet' : 'Requer Upgrade'}
                  <RightOutlined style={{ fontSize: '10px' }} />
                </span>
                <span style={{ fontSize: '16px', color: app.color }}>
                  {app.icon}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
