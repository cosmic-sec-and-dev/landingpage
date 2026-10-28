import React, { useState } from 'react';
import { Layout, Menu, Typography, Tooltip, Button } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  BankOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  AppstoreOutlined,
  BookOutlined,
  NotificationOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  CloudServerOutlined,
  CodeOutlined,
  ProjectOutlined,
  DollarOutlined,
  HomeOutlined,
  ShareAltOutlined,
  FireOutlined,
  DatabaseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CoffeeOutlined,
  FundProjectionScreenOutlined
} from '@ant-design/icons';
import { usePlan } from '../../context/PlanContext';
import { useAppTheme } from '../../context/ThemeContext';

const { Sider } = Layout;
const { Text } = Typography;

// Color schemes and icons matching HomePage.jsx
const appletColorSchemes = {
  'Kanban': { bg: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)', color: '#38bdf8', icon: <ProjectOutlined /> },
  'Clinics': { bg: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', color: '#10b981', icon: <MedicineBoxOutlined /> },
  'Commerce Hub': { bg: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)', color: '#14b8a6', icon: <ShoppingCartOutlined /> },
  'Crm': { bg: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)', color: '#ec4899', icon: <FundProjectionScreenOutlined /> },
  'Ecommerce': { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', color: '#06b6d4', icon: <ShoppingOutlined /> },
  'Collaboration': { bg: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', color: '#8b5cf6', icon: <TeamOutlined /> },
  'Events': { bg: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)', color: '#f59e0b', icon: <CalendarOutlined /> },
  'Helpdesk': { bg: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)', color: '#6366f1', icon: <CustomerServiceOutlined /> },
  'Infrastructure': { bg: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', color: '#14b8a6', icon: <CloudServerOutlined /> },
  'Json Box': { bg: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)', color: '#a855f7', icon: <CodeOutlined /> },
  'Notifications': { bg: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)', color: '#f97316', icon: <NotificationOutlined /> },
  'Payments': { bg: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)', color: '#22c55e', icon: <DollarOutlined /> },
  'Real Estate': { bg: 'linear-gradient(135deg, #0284c7 0%, #7dd3fc 100%)', color: '#0ea5e9', icon: <HomeOutlined /> },
  'Restaurants': { bg: 'linear-gradient(135deg, #d97706 0%, #fcd34d 100%)', color: '#f59e0b', icon: <CoffeeOutlined /> },
  'Social Media': { bg: 'linear-gradient(135deg, #c026d3 0%, #f0abfc 100%)', color: '#d946ef', icon: <ShareAltOutlined /> },
  'Users & RBAC': { bg: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)', color: '#3b82f6', icon: <UserOutlined /> },
  'Identity & Profile': { bg: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)', color: '#06b6d4', icon: <UserOutlined /> },
  'Tenants': { bg: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)', color: '#64748b', icon: <BankOutlined /> },
  'Plans & Subscriptions': { bg: 'linear-gradient(135deg, #9333ea 0%, #e879f9 100%)', color: '#a855f7', icon: <CreditCardOutlined /> },
  'Audit & System Logs': { bg: 'linear-gradient(135deg, #334155 0%, #64748b 100%)', color: '#94a3b8', icon: <FileTextOutlined /> },
  'CMS Advanced': { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', color: '#0284c7', icon: <BookOutlined /> },
  'Blogger': { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', color: '#0284c7', icon: <BookOutlined /> },
  'Campaigns': { bg: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)', color: '#ef4444', icon: <FireOutlined /> },
  'Authentication': { bg: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)', color: '#6366f1', icon: <LockOutlined /> },
  'Home': { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', color: '#38bdf8', icon: <HomeOutlined /> },
  'Support': { bg: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', color: '#10b981', icon: <CustomerServiceOutlined /> }
};

const normalizeKey = (key = '') =>
  key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const getScheme = (tag) => {
  if (!tag) return { bg: 'linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)', color: '#3b82f6', icon: <AppstoreOutlined /> };
  if (appletColorSchemes[tag]) return appletColorSchemes[tag];
  const norm = normalizeKey(tag);
  for (const [k, v] of Object.entries(appletColorSchemes)) {
    if (normalizeKey(k) === norm) return v;
  }
  return { bg: 'linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)', color: '#3b82f6', icon: <AppstoreOutlined /> };
};

// Render round icon with exactly 36px size
const renderRoundIcon = (scheme, size = 36) => (
  <span
    style={{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      borderRadius: '50%',
      background: scheme.bg,
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 2px 8px ${scheme.color}45`,
      fontSize: `${Math.max(13, Math.round(size * 0.44))}px`,
      flexShrink: 0,
      transition: 'all 0.2s ease',
      verticalAlign: 'middle'
    }}
  >
    {scheme.icon}
  </span>
);

export const Sidebar = ({ applets = {}, modules = {}, currentRoute, onNavigate }) => {
  const { hasAccess, currentUser, authorizedApplets } = usePlan();
  const { isDark } = useAppTheme();
  const [collapsed, setCollapsed] = useState(false);

  const rawRole = (currentUser?.role || currentUser?.user_role || 'admin').toLowerCase();
  const isAdmin = rawRole === 'superadmin' || rawRole === 'admin' || rawRole === 'authenticated';

  const effectiveApplets = (authorizedApplets && Object.keys(authorizedApplets).length > 0)
    ? authorizedApplets
    : (Object.keys(applets).length > 0 ? applets : modules);

  const appletsList = effectiveApplets;

  // Group 1 priority order as requested:
  // Authentication, Identity & Profile, Users & RBAC, Tenants, Plans & Subscriptions, Notifications, Infrastructure
  const g1Priority = [
    'Authentication',
    'Identity & Profile',
    'Users & RBAC',
    'Tenants',
    'Plans & Subscriptions',
    'Notifications',
    'Infrastructure'
  ];

  const isG1Match = (tag, target) => {
    const nTag = normalizeKey(tag);
    const nTarget = normalizeKey(target);
    if (nTag === nTarget) return true;
    if (nTarget === 'notifications' && (nTag === 'notificacoes' || nTag === 'notificacao')) return true;
    if (nTarget === 'infrastructure' && (nTag === 'infraestrutura' || nTag === 'infra')) return true;
    return false;
  };

  const group1Entries = [];
  const group2Entries = [];
  const entriesMap = new Map(Object.entries(appletsList));

  g1Priority.forEach(targetName => {
    for (const [tag, endpoints] of entriesMap.entries()) {
      if (isG1Match(tag, targetName)) {
        group1Entries.push([tag, endpoints]);
        entriesMap.delete(tag);
        break;
      }
    }
  });

  for (const [tag, endpoints] of entriesMap.entries()) {
    group2Entries.push([tag, endpoints]);
  }

  // --- EXPANDED MODE: Round colorful icons (36px) with clean labels ---
  const createExpandedMenuItem = (tag, endpoints) => {
    const isAppletAllowed = hasAccess(tag);
    if (!isAppletAllowed) return null;

    const cleanAppKey = tag.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const scheme = getScheme(tag);

    const appletChildren = [
      {
        key: cleanAppKey === 'kanban' ? 'kanban' : `${cleanAppKey}_main`,
        label: tag,
        icon: renderRoundIcon(scheme, 22),
      }
    ];

    if (isAdmin && endpoints && endpoints.length > 0) {
      const dataExplorerChildren = endpoints.map(ep => ({
        key: ep.endpoint_key,
        label: ep.path,
      }));

      appletChildren.push({
        key: `${cleanAppKey}_data_explorer`,
        label: 'Data Explorer',
        icon: <DatabaseOutlined style={{ color: scheme.color }} />,
        children: dataExplorerChildren
      });
    }

    return {
      key: tag,
      icon: renderRoundIcon(scheme, 36),
      label: tag,
      children: appletChildren
    };
  };

  const expandedBaseItems = [
    {
      key: 'home',
      icon: renderRoundIcon(getScheme('Home'), 36),
      label: 'Menu Iniciar'
    },
    {
      key: 'support_chat',
      icon: renderRoundIcon(getScheme('Support'), 36),
      label: 'Suporte & Bot FAQ'
    }
  ];

  const visibleG1 = group1Entries.map(([tag, endpoints]) => createExpandedMenuItem(tag, endpoints)).filter(Boolean);
  const visibleG2 = group2Entries.map(([tag, endpoints]) => createExpandedMenuItem(tag, endpoints)).filter(Boolean);

  const expandedMenuItems = [
    ...expandedBaseItems,
    ...(visibleG1.length > 0 ? [{
      type: 'divider',
      key: 'divider-base-g1',
      style: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        margin: '12px 0'
      }
    }] : []),
    ...visibleG1,
    ...(visibleG2.length > 0 ? [{
      type: 'divider',
      key: 'divider-g1-g2',
      style: {
        borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0, 0, 0, 0.08)',
        margin: '16px 0'
      }
    }] : []),
    ...visibleG2
  ];

  // --- COMPACT MODE: Round, colorful icons (36px) with clean tooltips ---
  const renderCompactIcon = (scheme, title, routeKey, isAllowed) => {
    const isSelected = currentRoute === routeKey || currentRoute?.startsWith(routeKey);
    return (
      <Tooltip key={routeKey} title={title} placement="right">
        <div
          onClick={() => {
            if (isAllowed) {
              onNavigate?.(routeKey);
            }
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: scheme.bg,
            boxShadow: isSelected
              ? `0 0 0 2.5px ${isDark ? '#38bdf8' : '#0284c7'}, 0 4px 12px ${scheme.color}60`
              : `0 2px 8px ${scheme.color}35`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '16px',
            cursor: isAllowed ? 'pointer' : 'not-allowed',
            opacity: isAllowed ? 1 : 0.4,
            margin: '6px auto',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (isAllowed) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = `0 4px 14px ${scheme.color}60`;
            }
          }}
          onMouseLeave={(e) => {
            if (isAllowed) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = isSelected
                ? `0 0 0 2.5px ${isDark ? '#38bdf8' : '#0284c7'}, 0 4px 12px ${scheme.color}60`
                : `0 2px 8px ${scheme.color}35`;
            }
          }}
        >
          {scheme.icon}
        </div>
      </Tooltip>
    );
  };

  return (
    <Sider
      width={280}
      collapsedWidth={76}
      collapsed={collapsed}
      trigger={null}
      theme={isDark ? 'dark' : 'light'}
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        overflow: 'hidden',
        background: 'transparent',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '16px 8px' : '16px 0 16px 16px',
        zIndex: 100,
        transition: 'all 0.25s ease'
      }}
    >
      <style>{`
        @keyframes seleneFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .selene-title-fadein {
          display: inline-block !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          animation: seleneFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.22s both !important;
        }
      `}</style>
      {/* 60px Fixed Sidebar Header: Clean, Expand/Collapse button and clickable header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          height: '60px',
          maxHeight: '60px',
          padding: collapsed ? '0' : '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderRadius: '12px',
          background: isDark ? 'rgba(17, 34, 68, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(0, 0, 0, 0.08)',
          marginBottom: '14px',
          marginRight: collapsed ? '0' : '12px',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          userSelect: 'none'
        }}
        title={collapsed ? "Clique para expandir o menu" : "Clique para recolher o menu"}
      >
        {!collapsed ? (
          <>
            <span
              className="selene-title-fadein"
              style={{
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '0.5px'
              }}
            >
              Selene
            </span>
            <Tooltip title="Recolher Menu">
              <Button
                type="text"
                shape="circle"
                icon={<MenuFoldOutlined style={{ fontSize: '16px', color: isDark ? '#94a3b8' : '#64748b' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                }}
              />
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Expandir Menu" placement="right">
            <Button
              type="text"
              shape="circle"
              icon={<MenuUnfoldOutlined style={{ fontSize: '18px', color: '#38bdf8' }} />}
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)'
              }}
            />
          </Tooltip>
        )}
      </div>

      {/* Sidebar Content */}
      <div
        style={{
          height: 'calc(100vh - 92px)',
          maxHeight: 'calc(100vh - 92px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: collapsed ? '0' : '12px'
        }}
        className="custom-sidebar-scroll"
      >
        {!collapsed ? (
          /* EXPANDED MODE: Round 36px colorful icons + Labels */
          <Menu
            mode="inline"
            selectedKeys={[currentRoute]}
            onClick={({ key }) => onNavigate(key)}
            items={expandedMenuItems}
            style={{
              background: 'transparent',
              borderRight: 0
            }}
            className="custom-ghost-menu"
          />
        ) : (
          /* COMPACT MODE: Round 36px colorful icons only */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Base items */}
            {renderCompactIcon(getScheme('Home'), 'Menu Iniciar', 'home', true)}
            {renderCompactIcon(getScheme('Support'), 'Suporte & Bot FAQ', 'support_chat', true)}

            {/* Divider between Base and Group 1 */}
            <div style={{
              width: '28px',
              height: '1px',
              background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              margin: '8px auto'
            }} />

            {/* Group 1: Authentication, Identity, Users, Tenants, Plans, Notifications, Infrastructure */}
            {group1Entries.filter(([tag]) => hasAccess(tag)).map(([tag]) => {
              const cleanAppKey = tag.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
              const primaryRoute = cleanAppKey === 'kanban' ? 'kanban' : `${cleanAppKey}_main`;
              return renderCompactIcon(getScheme(tag), tag, primaryRoute, true);
            })}

            {/* Divider between Group 1 and Group 2 */}
            {group2Entries.some(([tag]) => hasAccess(tag)) && (
              <div style={{
                width: '28px',
                height: '1px',
                background: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0, 0, 0, 0.12)',
                margin: '10px auto'
              }} />
            )}

            {/* Group 2: All remaining applets */}
            {group2Entries.filter(([tag]) => hasAccess(tag)).map(([tag]) => {
              const cleanAppKey = tag.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
              const primaryRoute = cleanAppKey === 'kanban' ? 'kanban' : `${cleanAppKey}_main`;
              return renderCompactIcon(getScheme(tag), tag, primaryRoute, true);
            })}
          </div>
        )}
      </div>
    </Sider>
  );
};
