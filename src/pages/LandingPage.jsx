import React, { useState } from 'react';
import { 
  Row, Col, Typography, Button, Card, Tag, Space, Divider, 
  Badge, Input, Statistic, Modal, Tooltip 
} from 'antd';
import { 
  RocketOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined, 
  AppstoreOutlined, 
  ApiOutlined, 
  GlobalOutlined, 
  ArrowRightOutlined, 
  CheckCircleFilled, 
  LockOutlined, 
  DatabaseOutlined, 
  LaptopOutlined, 
  FundProjectionScreenOutlined, 
  CloudServerOutlined, 
  ShopOutlined, 
  MedicineBoxOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  CustomerServiceOutlined, 
  MailOutlined, 
  CreditCardOutlined, 
  HomeOutlined, 
  ShareAltOutlined, 
  FileTextOutlined, 
  ProjectOutlined, 
  EyeOutlined,
  ExportOutlined,
  DashboardOutlined,
  LineChartOutlined,
  CrownOutlined,
  SunOutlined,
  MoonOutlined,
  CoffeeOutlined,
  ShoppingCartOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../context/ThemeContext';
import { WindowsXPDesktop } from '../components/WindowsXPDesktop';
import netexImg from '../assets/images/netex1.png';
import saasImg from '../assets/images/saas2.png';
import cosmicCarImg from '../assets/images/cosmic_car.png';

const { Title, Paragraph, Text } = Typography;

export const LandingPage = ({ onNavigateToAdmin, onOpenLogin }) => {
  const { isDark, toggleTheme } = useAppTheme();
  const [selectedApplet, setSelectedApplet] = useState(null);

  const colors = {
    bgRoot: isDark
      ? 'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgb(10, 11, 61) 50%, rgb(166, 38, 122) 100%)'
      : 'linear-gradient(135deg, rgb(255, 220, 249) 0%, rgb(229, 246, 255) 40%, rgb(249, 243, 190) 100%)',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    navBg: isDark ? 'rgba(8, 13, 26, 0.88)' : 'rgba(255, 255, 255, 0.92)',
    navBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    cardBg: isDark ? 'rgba(26, 35, 56, 0.75)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    cardShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
    metricCardBg: isDark ? 'rgba(26, 35, 56, 0.65)' : '#ffffff',
    metricCardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    archBg: isDark ? 'linear-gradient(135deg, rgba(26, 35, 56, 0.95) 0%, rgba(8, 13, 26, 0.98) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    archBorder: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.25)',
    archInnerBg: isDark ? 'rgba(8, 13, 26, 0.8)' : '#f8fafc',
    footerBg: isDark ? 'rgba(8, 13, 26, 0.95)' : '#f1f5f9',
    footerBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    navLinkColor: isDark ? '#cbd5e1' : '#334155'
  };

  const appletsList = [
    {
      id: 'cms_advanced',
      title: 'CMS Advanced & Conteúdo',
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#0284c7' }} />,
      tag: 'CMS Corporativo',
      color: '#0284c7',
      description: 'Gestão institucional de artigos, páginas corporativas, temas dinâmicos e sidebars com versionamento.',
      endpoints: '28 Endpoints',
      highlights: ['Páginas Dinâmicas', 'Temas Customizáveis', 'Anexos & Mídia']
    },
    {
      id: 'campaigns',
      title: 'Marketing & Campanhas',
      icon: <RocketOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />,
      tag: 'Growth & Outreach',
      color: '#f59e0b',
      description: 'Disparos de broadcast multicanal, segmentação avançada de audiência e métricas de engajamento em tempo real.',
      endpoints: '22 Endpoints',
      highlights: ['Segmentação de Leads', 'Métricas de Leitura', 'Automação de Disparo']
    },
    {
      id: 'clinics',
      title: 'Clínicas & Saúde',
      icon: <MedicineBoxOutlined style={{ fontSize: '24px', color: '#10b981' }} />,
      tag: 'Saúde & Telemedicina',
      color: '#10b981',
      description: 'Gestão completa para clínicas e consultórios: corpo clínico, salas, agendas médicas e prontuários eletrônicos.',
      endpoints: '45 Endpoints',
      highlights: ['Prontuário Eletrônico', 'Gestão de Especialistas', 'Agenda Inteligente']
    },
    {
      id: 'collaboration',
      title: 'Colaboração & Equipes',
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#8b5cf6' }} />,
      tag: 'Workplace Conectado',
      color: '#8b5cf6',
      description: 'Canais corporativos, postagens internas, calendário colaborativo de eventos e mensageria em tempo real.',
      endpoints: '52 Endpoints',
      highlights: ['Canais de Discussão', 'Eventos de Equipe', 'Notas Compartilhadas']
    },
    {
      id: 'crm',
      title: 'CRM & Vendas',
      icon: <FundProjectionScreenOutlined style={{ fontSize: '24px', color: '#ec4899' }} />,
      tag: 'Funil de Vendas',
      color: '#ec4899',
      description: 'Pipelines customizáveis, gestão visual de deals (negócios), histórico de interações e tarefas de prospecção.',
      endpoints: '40 Endpoints',
      highlights: ['Funis Customizáveis', 'Histórico de Interações', 'Prospecção Ativa']
    },
    {
      id: 'ecommerce',
      title: 'E-commerce & Catálogo',
      icon: <ShopOutlined style={{ fontSize: '24px', color: '#06b6d4' }} />,
      tag: 'Varejo Digital',
      color: '#06b6d4',
      description: 'Catálogo hierárquico de produtos, carrinhos de compra, cupons de desconto, checkout e gestão de pedidos.',
      endpoints: '65 Endpoints',
      highlights: ['Catálogo de Produtos', 'Carrinhos em Tempo Real', 'Gestão de Cupons']
    },
    {
      id: 'events',
      title: 'Eventos & Ingressos',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#eab308' }} />,
      tag: 'Ticketing & Lives',
      color: '#eab308',
      description: 'Gestão de eventos presenciais e digitais, lotes de ingressos (tiers), emissão de tickets e cronograma.',
      endpoints: '34 Endpoints',
      highlights: ['Lotes & Tiers', 'Emissão de Ingressos', 'Categorização & Tags']
    },
    {
      id: 'helpdesk',
      title: 'Helpdesk & Atendimento',
      icon: <CustomerServiceOutlined style={{ fontSize: '24px', color: '#6366f1' }} />,
      tag: 'Suporte & SLAs',
      color: '#6366f1',
      description: 'Central de suporte multicanal, controle rigoroso de SLA por departamento, base de conhecimento e feedbacks.',
      endpoints: '48 Endpoints',
      highlights: ['Políticas de SLA', 'Base de Conhecimento', 'Respostas Rápidas']
    },
    {
      id: 'infrastructure',
      title: 'Infraestrutura & Painéis',
      icon: <CloudServerOutlined style={{ fontSize: '24px', color: '#14b8a6' }} />,
      tag: 'DevOps & Telemetria',
      color: '#14b8a6',
      description: 'Monitoramento de servidores, widgets dinâmicos de telemetria, dashboards customizados e repositório de arquivos.',
      endpoints: '30 Endpoints',
      highlights: ['Health Check de Servidores', 'Widgets Operacionais', 'Armazenamento de Arquivos']
    },
    {
      id: 'json_box',
      title: 'JSON Box Schemaless',
      icon: <DatabaseOutlined style={{ fontSize: '24px', color: '#a855f7' }} />,
      tag: 'Armazenamento Flexível',
      color: '#a855f7',
      description: 'Caixas de armazenamento schemaless para integração ultrarrápida de dados não-estruturados e payloads JSON.',
      endpoints: '18 Endpoints',
      highlights: ['NoSQL Relacional', 'Payloads Flexíveis', 'Indexação GIN Nativa']
    },
    {
      id: 'kanban',
      title: 'Kanban & Gestão Ágil',
      icon: <ProjectOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />,
      tag: 'Produtividade Ágil',
      color: '#3b82f6',
      description: 'Quadros ágeis de gestão visual com colunas personalizáveis, atribuição de membros, prioridades e prazos.',
      endpoints: '26 Endpoints',
      highlights: ['Quadros Personalizados', 'Tarefas Colaborativas', 'Membros & Atribuições']
    },
    {
      id: 'notifications',
      title: 'Central de Notificações',
      icon: <MailOutlined style={{ fontSize: '24px', color: '#f97316' }} />,
      tag: 'Comunicação Multicanal',
      color: '#f97316',
      description: 'Motor centralizado de disparo de e-mails transacionais e notificações push com logs de entrega e status.',
      endpoints: '20 Endpoints',
      highlights: ['E-mails Transacionais', 'Push Notifications', 'Fila de Disparo']
    },
    {
      id: 'payments',
      title: 'Financeiro & Faturamento',
      icon: <CreditCardOutlined style={{ fontSize: '24px', color: '#22c55e' }} />,
      tag: 'Billing & Cobrança',
      color: '#22c55e',
      description: 'Emissão e controle de faturas (invoices), transações financeiras, métodos de pagamento e gestão de reembolsos.',
      endpoints: '36 Endpoints',
      highlights: ['Faturamento Recorrente', 'Transações Financeiras', 'Gestão de Reembolsos']
    },
    {
      id: 'real_estate',
      title: 'Gestão Imobiliária',
      icon: <HomeOutlined style={{ fontSize: '24px', color: '#0ea5e9' }} />,
      tag: 'Propriedades & Vendas',
      color: '#0ea5e9',
      description: 'Portfólio de imóveis, gestão de corretores credenciados, agendamento de visitas de clientes e métricas de views.',
      endpoints: '44 Endpoints',
      highlights: ['Catálogo de Imóveis', 'Agenda de Visitas', 'Métricas de Visualização']
    },
    {
      id: 'commerce_hub',
      title: 'Unified Commerce & POS',
      icon: <ShoppingCartOutlined style={{ fontSize: '24px', color: '#10b981' }} />,
      tag: 'Commerce Hub & POS',
      color: '#10b981',
      description: 'Motor centralizado de vendas omnichannel, terminal de frente de caixa (PDV), split payments e livro-razão de estoque.',
      endpoints: '48 Endpoints',
      highlights: ['Universal Item Master', 'Unified Commerce Hub', 'Inventory Ledger']
    },
    {
      id: 'restaurants',
      title: 'Restaurantes & Gastronomia',
      icon: <CoffeeOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />,
      tag: 'Food Service & Bar',
      color: '#f59e0b',
      description: 'Comandas digitais, cardápios interativos, controle de mesas, ficha técnica de receitas e promoções programadas.',
      endpoints: '38 Endpoints',
      highlights: ['Comandas & Mesas', 'Ficha Técnica / Receitas', 'Agendador de Promoções']
    },
    {
      id: 'social_media',
      title: 'Rede Social & Comunidade',
      icon: <ShareAltOutlined style={{ fontSize: '24px', color: '#d946ef' }} />,
      tag: 'Engajamento Social',
      color: '#d946ef',
      description: 'Perfis sociais de membros, grupos de interesse, feeds de publicações, comentários, curtidas e chats privados.',
      endpoints: '46 Endpoints',
      highlights: ['Perfis & Grupos', 'Feed Interativo', 'Mensageria Social']
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: colors.bgRoot,
      color: colors.textPrimary,
      fontFamily: "'Inter', sans-serif",
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      {/* Background Ambient Glows */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        background: isDark
          ? 'radial-gradient(circle at 15% 15%, rgba(29, 78, 216, 0.25) 0%, transparent 40%), radial-gradient(circle at 85% 25%, rgba(234, 179, 8, 0.12) 0%, transparent 35%), radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
          : 'radial-gradient(circle at 15% 15%, rgba(56, 189, 248, 0.15) 0%, transparent 40%), radial-gradient(circle at 85% 25%, rgba(234, 179, 8, 0.08) 0%, transparent 35%)'
      }} />

      {/* 1. TOP NAVIGATION NAVBAR */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        background: colors.navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.navBorder}`,
        padding: '0 32px',
        transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 800
            }}>
              SL
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '19px', fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.5px' }}>
                  SELENE
                </span>
                <Tag color="cyan" style={{ fontSize: '11px', fontWeight: 700, padding: '0 6px', margin: 0, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  SUITE
                </Tag>
              </div>
              <span style={{ fontSize: '11px', color: colors.textSecondary, letterSpacing: '0.3px', fontWeight: 500 }}>
                by Cosmic Sec&Dev
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <a href="#xp-arcade-section" style={{ color: colors.navLinkColor, fontWeight: 600, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🕹️</span> Windows XP
            </a>
            <a href="#suite" style={{ color: colors.navLinkColor, fontWeight: 500, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}>
              Produtos
            </a>
            <a href="#commerce-hub" style={{ color: colors.navLinkColor, fontWeight: 500, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}>
              Unified Commerce Hub
            </a>
            <a href="#modules" style={{ color: colors.navLinkColor, fontWeight: 500, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}>
              Applets SaaS
            </a>
            <a href="#architecture" style={{ color: colors.navLinkColor, fontWeight: 500, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}>
              Arquitetura & Ledger
            </a>
            <a href="#cosmic-secdev" style={{ color: colors.navLinkColor, fontWeight: 500, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}>
              Cosmic Sec&Dev
            </a>
          </div>

          {/* Action CTAs */}
          <Space size="middle">
            {/* Theme Toggle Button */}
            <Tooltip title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}>
              <Button
                type="text"
                shape="circle"
                icon={isDark ? <SunOutlined style={{ color: '#eab308', fontSize: '18px' }} /> : <MoonOutlined style={{ color: '#0284c7', fontSize: '18px' }} />}
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

            <Button 
              type="default" 
              href="https://cosmic-zip.github.io/NettravelerEX/" 
              target="_blank"
              icon={<ExportOutlined />}
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                color: isDark ? '#e2e8f0' : '#0f172a',
                fontWeight: 600
              }}
            >
              NettravelerEX
            </Button>
            <Button 
              type="primary" 
              icon={<DashboardOutlined />}
              onClick={onNavigateToAdmin}
              hidden
              style={{
                display: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                borderColor: 'transparent',
                boxShadow: '0 0 18px rgba(56, 189, 248, 0.35)',
                fontWeight: 600
              }}
            >
              Entrar no SaaS
            </Button>
          </Space>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main style={{ position: 'relative', zIndex: 1, paddingTop: '74px', paddingBottom: '80px' }}>
        
        {/* 2. HERO SECTION */}
        <section style={{ padding: '80px 24px 60px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '30px', background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#e0f2fe', border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd', boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)', marginBottom: '24px' }}>
            <SafetyCertificateOutlined style={{ color: '#0284c7' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#bae6fd' : '#0369a1', letterSpacing: '0.4px' }}>
              SUÍTE CORPORATIVA DE ALTA PERFORMANCE & CIBERSEGURANÇA
            </span>
          </div>

          {/* Main Title */}
          <Title level={1} style={{ 
            fontSize: 'clamp(32px, 5vw, 56px)', 
            fontWeight: 800, 
            color: colors.textPrimary, 
            letterSpacing: '-1.5px', 
            lineHeight: 1.15,
            maxWidth: '960px',
            margin: '0 auto 20px'
          }}>
            A Nova Geração em <span style={{ 
              background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 50%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Inteligência Operacional</span> & Plataforma SaaS Multi-Tenant
          </Title>

          {/* Subtitle / Paragraph */}
          <Paragraph style={{ 
            fontSize: 'clamp(16px, 2vw, 19px)', 
            color: colors.textSecondary, 
            maxWidth: '820px', 
            margin: '0 auto 32px',
            lineHeight: 1.6 
          }}>
            Soluções integradas desenvolvidas pela <strong>Cosmic Sec&Dev</strong>, unindo o poder em OPSEC e operações para Purple Team do <strong>NettravelerEX</strong> à flexibilidade modular e segurança institucional do <strong>Selene</strong>.
          </Paragraph>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '54px' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<AppstoreOutlined />} 
              onClick={() => {
                const el = document.getElementById('modules');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ 
                height: '52px', 
                padding: '0 32px', 
                fontSize: '16px', 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
                border: 0
              }}
            >
              Explorar Applets SaaS
            </Button>
            <Button 
              size="large" 
              icon={<ExportOutlined />}
              href="https://cosmic-zip.github.io/NettravelerEX/"
              target="_blank"
              style={{ 
                height: '52px', 
                padding: '0 28px', 
                fontSize: '16px', 
                fontWeight: 600,
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                color: colors.textPrimary
              }}
            >
              Conhecer NettravelerEX
            </Button>
          </div>

          {/* Metrics Counter Strip */}
          <Row gutter={[24, 24]} style={{ maxWidth: '1040px', margin: '0 auto' }}>
            <Col xs={12} sm={6}>
              <div style={{ padding: '20px', background: colors.metricCardBg, border: `1px solid ${colors.metricCardBorder}`, borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: colors.cardShadow }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>161+</div>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px', fontWeight: 500 }}>Endpoints Ativos</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ padding: '20px', background: colors.metricCardBg, border: `1px solid ${colors.metricCardBorder}`, borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: colors.cardShadow }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#d97706', letterSpacing: '-0.5px' }}>23</div>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px', fontWeight: 500 }}>Applets Verticais</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ padding: '20px', background: colors.metricCardBg, border: `1px solid ${colors.metricCardBorder}`, borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: colors.cardShadow }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981', letterSpacing: '-0.5px' }}>100%</div>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px', fontWeight: 500 }}>Isolamento RLS</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ padding: '20px', background: colors.metricCardBg, border: `1px solid ${colors.metricCardBorder}`, borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: colors.cardShadow }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.5px' }}>3.000+</div>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '4px', fontWeight: 500 }}>Meta de Integrações</div>
              </div>
            </Col>
          </Row>
        </section>

        {/* 2.5 WINDOWS XP INTERACTIVE ARCADE SECTION */}
        <WindowsXPDesktop />

        {/* 3. SUITE PRODUCTS SHOWCASE */}
        <section id="suite" style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Tag color="blue" style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px' }}>
              PORTFÓLIO INTEGRADO
            </Tag>
            <Title level={2} style={{ color: colors.textPrimary, fontSize: '34px', fontWeight: 800, margin: '12px 0 6px', letterSpacing: '-0.5px' }}>
              Excelência Tecnológica
            </Title>
            <Paragraph style={{ color: colors.textSecondary, fontSize: '16px', maxWidth: '640px', margin: '0 auto' }}>
              Da segurança operacional ofensiva e defensiva para equipes de Purple Team à orquestração empresarial multi-tenant.
            </Paragraph>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <img 
              src={cosmicCarImg} 
              alt="Excelência Tecnológica" 
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'inline-block'
              }}
            />
          </div>
        </section>

        {/* 3.5 UNIFIED COMMERCE HUB, UNIVERSAL ITEM MASTER & INVENTORY LEDGER SECTION */}
        <section id="commerce-hub" style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Tag color="cyan" style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px' }}>
              INOVAÇÃO TRANSCENDENTAL
            </Tag>
            <Title level={2} style={{ color: colors.textPrimary, fontSize: '36px', fontWeight: 800, margin: '12px 0 6px', letterSpacing: '-0.5px' }}>
              Motor de Comércio Unificado & Livro-Razão
            </Title>
            <Paragraph style={{ color: colors.textSecondary, fontSize: '16px', maxWidth: '820px', margin: '0 auto' }}>
              A convergência perfeita entre <strong>Universal Item Master</strong>, <strong>Unified Commerce Hub</strong> e <strong>Inventory Ledger</strong>, eliminando silos e unificando o controle operacional e financeiro em tempo real.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <Card style={{
                height: '100%',
                background: colors.cardBg,
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
                borderRadius: '16px',
                boxShadow: colors.cardShadow
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '22px' }}>
                    <AppstoreOutlined />
                  </div>
                  <div>
                    <Tag color="blue" style={{ fontWeight: 700 }}>CATÁLOGO POLIMÓRFICO</Tag>
                    <Title level={4} style={{ color: colors.textPrimary, margin: 0, fontSize: '18px', fontWeight: 800 }}>
                      Universal Item Master
                    </Title>
                  </div>
                </div>
                <Paragraph style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                  Abandone as tabelas fragmentadas. O <strong>Universal Item Master</strong> unifica em um único modelo de dados canônico produtos físicos, infoprodutos digitais (e-books, cursos), fichas técnicas/receitas de pratos e serviços clínicos com duração e papéis elegíveis.
                </Paragraph>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#0284c7', marginRight: '6px' }} /> Produtos Físicos, Digitais & Serviços</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#0284c7', marginRight: '6px' }} /> Ficha Técnica & Receitas ($N:N$)</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#0284c7', marginRight: '6px' }} /> Entregáveis Digitais & Licenças</div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card style={{
                height: '100%',
                background: colors.cardBg,
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(234, 179, 8, 0.25)' : '1px solid #fde68a',
                borderRadius: '16px',
                boxShadow: colors.cardShadow
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontSize: '22px' }}>
                    <ShopOutlined />
                  </div>
                  <div>
                    <Tag color="gold" style={{ fontWeight: 700 }}>OMNICHANNEL & POS</Tag>
                    <Title level={4} style={{ color: colors.textPrimary, margin: 0, fontSize: '18px', fontWeight: 800 }}>
                      Unified Commerce Hub
                    </Title>
                  </div>
                </div>
                <Paragraph style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                  Conecte qualquer canal de venda à mesma frente transacional. O <strong>Unified Commerce Hub</strong> gerencia sessões de caixa (abertura, sangria, suprimento e fechamento cego) e liquidação multi-meio (split payments entre dinheiro, TEF/maquininha, PIX e gateways).
                </Paragraph>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#d97706', marginRight: '6px' }} /> Sessões de Caixa PDV & Turnos</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#d97706', marginRight: '6px' }} /> Split Payments & Troco Exato</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#d97706', marginRight: '6px' }} /> Vendas Omnichannel Centralizadas</div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card style={{
                height: '100%',
                background: colors.cardBg,
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #bbf7d0',
                borderRadius: '16px',
                boxShadow: colors.cardShadow
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: '22px' }}>
                    <DatabaseOutlined />
                  </div>
                  <div>
                    <Tag color="green" style={{ fontWeight: 700 }}>PARTIDA DOBRADA</Tag>
                    <Title level={4} style={{ color: colors.textPrimary, margin: 0, fontSize: '18px', fontWeight: 800 }}>
                      Inventory Ledger
                    </Title>
                  </div>
                </div>
                <Paragraph style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                  Rastreabilidade com precisão contábil. O <strong>Inventory Ledger</strong> substitui updates mutáveis por um livro-razão append-only, auditando cada entrada, perda, dedução por venda ou consumo de insumo por ficha técnica com histórico completo.
                </Paragraph>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#16a34a', marginRight: '6px' }} /> Livro-Razão de Estoque Imutável</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#16a34a', marginRight: '6px' }} /> Dedução Automática por Ficha Técnica</div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}><CheckCircleFilled style={{ color: '#16a34a', marginRight: '6px' }} /> Auditoria & Controle de Lotes/Validade</div>
                </div>
              </Card>
            </Col>
          </Row>
        </section>

        {/* 4. MODULES GRID SECTION (23 SAAS APPLETS) */}
        <section id="modules" style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Tag color="purple" style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px' }}>
              APPLETS ESPECIALIZADOS
            </Tag>
            <Title level={2} style={{ color: colors.textPrimary, fontSize: '34px', fontWeight: 800, margin: '12px 0 6px', letterSpacing: '-0.5px' }}>
              Applets Verticais Especializados
            </Title>
            <Paragraph style={{ color: colors.textSecondary, fontSize: '16px', maxWidth: '680px', margin: '0 auto' }}>
              Arquitetura corporativa desacoplada onde cada applet funciona como uma vertical de negócios completa e autônoma.
            </Paragraph>
          </div>

          <Row gutter={[20, 20]}>
            {appletsList.map((applet) => (
              <Col xs={24} sm={12} lg={8} key={applet.id}>
                <Card 
                  hoverable
                  onClick={() => setSelectedApplet(applet)}
                  style={{
                    height: '100%',
                    background: colors.cardBg,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: colors.cardShadow,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      background: isDark ? `rgba(255, 255, 255, 0.04)` : `${applet.color}10`,
                      border: `1px solid ${applet.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {applet.icon}
                    </div>
                    <Tag style={{ 
                      background: `${applet.color}15`, 
                      color: applet.color, 
                      borderColor: `${applet.color}35`,
                      fontSize: '11px',
                      fontWeight: 600,
                      margin: 0
                    }}>
                      {applet.tag}
                    </Tag>
                  </div>

                  <Title level={4} style={{ color: colors.textPrimary, margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
                    {applet.title}
                  </Title>

                  <Paragraph style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
                    {applet.description}
                  </Paragraph>

                  <div style={{ paddingTop: '12px', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: 600 }}>
                      {applet.endpoints}
                    </span>
                    <span style={{ fontSize: '13px', color: applet.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Ver Detalhes <ArrowRightOutlined style={{ fontSize: '11px' }} />
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* 5. EXECUTIVE BUSINESS & ARCHITECTURAL INNOVATION */}
        <section id="architecture" style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            background: colors.archBg,
            border: `1px solid ${colors.archBorder}`,
            borderRadius: '20px',
            padding: 'clamp(32px, 5vw, 64px)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isDark ? '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.08)' : '0 12px 36px rgba(0, 0, 0, 0.06)'
          }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={14}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#e0f2fe', border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd', marginBottom: '16px' }}>
                  <ThunderboltOutlined style={{ color: '#0284c7' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>INOVAÇÃO & ENGENHARIA DE SOFTWARE</span>
                </div>

                <Title level={2} style={{ color: colors.textPrimary, fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, margin: '0 0 20px', letterSpacing: '-0.5px', lineHeight: 1.25 }}>
                  Arquitetura Procedural Adaptativa: Plataforma Inteligente e Evolutiva
                </Title>

                <Paragraph style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
                  A suíte Selene foi concebida sob uma abordagem pioneira de <strong>engenharia procedural de dados e automação arquitetural</strong>. Em vez de depender de camadas intermediárias convencionais e lentas, toda a inteligência e governança de dados são orquestradas diretamente por um <strong>núcleo procedural de dados de altíssima performance</strong>.
                </Paragraph>

                <Paragraph style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
                  A interface visual da aplicação é gerada e sincronizada de forma reativa com base nos esquemas corporativos vivos do sistema. Ao aplicar rigorosamente princípios consolidados de <strong>resiliência de software como o princípio Aberto/Fechado (Open/Closed Principle)</strong>, novos applets, verticais e fluxos de negócio são incorporados dinamicamente ao ecossistema sem qualquer ruptura ou quebra de compatibilidade com os sistemas já em produção.
                </Paragraph>

                <Paragraph style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                  Atualmente, a plataforma já conecta <strong>mais de 670 endpoints especializados de negócios</strong>, evoluindo de forma contínua e escalável para uma meta projetada de <strong>mais de 3.000 endpoints integrados</strong> — oferecendo uma infraestrutura corporativa inteligente, hiper-adaptável e pronta para impulsionar qualquer segmento de mercado com velocidade e segurança institucional.
                </Paragraph>

                <Space size="middle" wrap>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<DashboardOutlined />}
                    onClick={onNavigateToAdmin}
                    hidden
                    style={{
                      display: 'none',
                      background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                      borderColor: 'transparent',
                      fontWeight: 600,
                      height: '46px',
                      padding: '0 28px'
                    }}
                  >
                    Acessar Demonstração do SaaS
                  </Button>
                </Space>
              </Col>

              {/* ARCHITECTURE CARD VISUAL */}
              <Col xs={24} lg={10}>
                <div style={{
                  background: colors.archInnerBg,
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: isDark ? '0 16px 32px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0' }}>
                    <Text strong style={{ color: colors.textPrimary, fontSize: '15px' }}>Estrutura Arquitetural</Text>
                    <Tag color="green">Zero Latency</Tag>
                  </div>

                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: isDark ? 'rgba(56, 189, 248, 0.08)' : '#e0f2fe', border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>1. Camada de Apresentação Reativa</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>Geração dinâmica de UI sincronizada com modelos de dados</div>
                    </div>

                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: isDark ? 'rgba(234, 179, 8, 0.08)' : '#fef3c7', border: isDark ? '1px solid rgba(234, 179, 8, 0.2)' : '1px solid #fde68a' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#d97706' }}>2. Gateway REST & Entitlements</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>Controle de cotas, planos modulares e RBAC em tempo real</div>
                    </div>

                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: isDark ? 'rgba(139, 92, 246, 0.08)' : '#f3e8ff', border: isDark ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid #e9d5ff' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed' }}>3. Núcleo Procedural de Dados</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>Processamento nativo transacional de altíssima velocidade</div>
                    </div>

                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: isDark ? 'rgba(16, 185, 129, 0.08)' : '#dcfce7', border: isDark ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>4. Isolamento Multi-Tenant Estrito</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>Segurança criptográfica de linha (RLS) mandatória</div>
                    </div>
                  </Space>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* 6. COSMIC SEC&DEV COMPANY SECTION */}
        <section id="cosmic-secdev" style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Tag color="cyan" style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px' }}>
              SOBRE A EMPRESA
            </Tag>
            <Title level={2} style={{ color: colors.textPrimary, fontSize: '34px', fontWeight: 800, margin: '12px 0 6px', letterSpacing: '-0.5px' }}>
              Cosmic Sec&Dev: Excelência em Engenharia & Cibersegurança
            </Title>
            <Paragraph style={{ color: colors.textSecondary, fontSize: '16px', maxWidth: '720px', margin: '0 auto' }}>
              Consultoria especializada em desenvolvimento de software crítico, arquiteturas resilientes e defesa cibernética avançada para ecossistemas corporativos.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card style={{
                height: '100%',
                background: colors.cardBg,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '12px',
                boxShadow: colors.cardShadow
              }}>
                <div style={{ fontSize: '28px', color: '#0284c7', marginBottom: '16px' }}>
                  <SafetyCertificateOutlined />
                </div>
                <Title level={4} style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                  Cybersecurity Consulting
                </Title>
                <Paragraph style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                  Auditoria de postura de segurança, testes de intrusão, modelagem de ameaças e implementação de políticas Zero-Trust para proteção de ativos digitais sensíveis.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card style={{
                height: '100%',
                background: colors.cardBg,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '12px',
                boxShadow: colors.cardShadow
              }}>
                <div style={{ fontSize: '28px', color: '#d97706', marginBottom: '16px' }}>
                  <LaptopOutlined />
                </div>
                <Title level={4} style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                  Software Development
                </Title>
                <Paragraph style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                  Construção de sistemas corporativos escaláveis, plataformas SaaS multi-tenant, microserviços e interfaces reativas de alto desempenho orientadas ao domínio.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card style={{
                height: '100%',
                background: colors.cardBg,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '12px',
                boxShadow: colors.cardShadow
              }}>
                <div style={{ fontSize: '28px', color: '#16a34a', marginBottom: '16px' }}>
                  <LockOutlined />
                </div>
                <Title level={4} style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                  DevSecOps & Resiliência
                </Title>
                <Paragraph style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                  Integração contínua com verificação automatizada de vulnerabilidades, conformidade transacional ACID estrita e pipelines de deploy contínuo em containers isolados.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

      </main>

      {/* 7. MODAL DETALHES DO APPLET */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {selectedApplet?.icon}
            <span style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 700 }}>
              {selectedApplet?.title}
            </span>
          </div>
        }
        open={!!selectedApplet}
        onCancel={() => setSelectedApplet(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedApplet(null)} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', borderColor: isDark ? 'transparent' : '#cbd5e1', color: colors.textPrimary }}>
            Fechar
          </Button>
        ]}
        width={560}
      >
        {selectedApplet && (
          <div style={{ paddingTop: '12px' }}>
            <Tag color="cyan" style={{ marginBottom: '14px', fontWeight: 600 }}>
              {selectedApplet.tag}
            </Tag>
            <Paragraph style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.6 }}>
              {selectedApplet.description}
            </Paragraph>
            <Divider style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0', margin: '16px 0' }} />
            <Text strong style={{ color: colors.textPrimary, display: 'block', marginBottom: '10px' }}>
              Principais Capacidades do Applet:
            </Text>
            <ul style={{ paddingLeft: '20px', color: colors.textSecondary, lineHeight: 1.8 }}>
              {selectedApplet.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: isDark ? 'rgba(56, 189, 248, 0.08)' : '#e0f2fe', border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #bae6fd' }}>
              <Text style={{ color: '#0284c7', fontSize: '13px', fontWeight: 600 }}>
                Escopo de Integração: {selectedApplet.endpoints} REST prontos para consumo.
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* 8. FOOTER */}
      <footer style={{
        background: colors.footerBg,
        borderTop: `1px solid ${colors.footerBorder}`,
        padding: '48px 32px 32px',
        transition: 'background 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          <Row gutter={[32, 32]} justify="space-between">
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 800
                }}>
                  SL
                </div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: colors.textPrimary }}>
                  SELENE SUITE
                </span>
              </div>
              <Paragraph style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: 1.6, maxWidth: '320px' }}>
                Ecossistema corporativo desenvolvido por <strong>Cosmic Sec&Dev</strong>. Software development and cybersecurity consulting.
              </Paragraph>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Text strong style={{ color: colors.textPrimary, display: 'block', marginBottom: '12px', fontSize: '14px' }}>Produtos</Text>
              <Space direction="vertical" size="small">
                <a href="https://cosmic-zip.github.io/NettravelerEX/" target="_blank" style={{ color: colors.textSecondary, fontSize: '13px', textDecoration: 'none' }}>NettravelerEX</a>
                <a href="#modules" style={{ color: colors.textSecondary, fontSize: '13px', textDecoration: 'none' }}>Selene</a>
                <a href="#modules" style={{ color: colors.textSecondary, fontSize: '13px', textDecoration: 'none' }}>Catálogo de Applets</a>
              </Space>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Text strong style={{ color: colors.textPrimary, display: 'block', marginBottom: '12px', fontSize: '14px' }}>Tecnologia</Text>
              <Space direction="vertical" size="small">
                <a href="#architecture" style={{ color: colors.textSecondary, fontSize: '13px', textDecoration: 'none' }}>Arquitetura Procedural</a>
                <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Isolamento RLS Multi-Tenant</span>
                <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Princípios SOLID Resilientes</span>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Text strong style={{ color: colors.textPrimary, display: 'block', marginBottom: '12px', fontSize: '14px' }}>Cosmic Sec&Dev</Text>
              <Paragraph style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: 1.6 }}>
                Consultoria em Desenvolvimento Seguro, Arquiteturas de Alta Concorrência e Defesa Cibernética.
              </Paragraph>
              <Tag color="blue" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.1)' }}>
                Software & Cyber Consulting
              </Tag>
            </Col>
          </Row>

          <Divider style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0', margin: 0 }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <Text style={{ color: colors.textMuted, fontSize: '12px' }}>
              © {new Date().getFullYear()} Selene Suite & Cosmic Sec&Dev. Todos os direitos reservados.
            </Text>
            <Space size="middle">
              <span style={{ color: colors.textMuted, fontSize: '12px' }}>Privacidade & Segurança</span>
              <span style={{ color: colors.textMuted, fontSize: '12px' }}>Termos de Uso</span>
              <span style={{ color: colors.textMuted, fontSize: '12px' }}>Status dos Sistemas</span>
            </Space>
          </div>
        </div>
      </footer>
    </div>
  );
};
