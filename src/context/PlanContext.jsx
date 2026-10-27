import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, getAuthToken } from '../services/api';

// Decode helper for JWT payload
const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const getInitialUser = () => {
  const token = getAuthToken();
  if (token) {
    const claims = decodeJwt(token);
    if (claims) {
      return {
        id: claims.sub || claims.user_id,
        role: claims.role === 'authenticated' ? (claims.user_role || 'admin') : (claims.role || 'admin'),
        tenant_id: claims.tenant_id,
        email: claims.email || 'admin@cosmic.com',
        full_name: claims.full_name || 'Cosmic Admin',
        avatar_url: claims.avatar_url || claims.picture || null
      };
    }
  }
  // Default fallback for development/demo environment
  return {
    id: '00000000-0000-0000-0000-000000000001',
    role: 'superadmin',
    full_name: 'Cosmic Admin',
    email: 'admin@cosmic.com',
    tenant_name: 'Cosmic Enterprises',
    avatar_url: '/files/a1a8cb903872bc2824533a1f0512489c'
  };
};

window.__NT_GLOBAL_PLAN_TABLES__ = window.__NT_GLOBAL_PLAN_TABLES__ || null;
window.__NT_GLOBAL_IS_SUPERADMIN__ = window.__NT_GLOBAL_IS_SUPERADMIN__ || false;

const PlanContext = createContext(null);

export const PlanProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getInitialUser());
  const [planTables, setPlanTables] = useState(window.__NT_GLOBAL_PLAN_TABLES__ || null);
  const [isSuperadmin, setIsSuperadmin] = useState(window.__NT_GLOBAL_IS_SUPERADMIN__ || true);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Enterprise');

  const fetchProfileAndPlan = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      // Keep default admin user for local / test navigation
      const defUser = getInitialUser();
      setCurrentUser(defUser);
      setIsSuperadmin(true);
      window.__NT_GLOBAL_PLAN_TABLES__ = ['*'];
      setPlanTables(['*']);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Perfil /me
      let userObj = getInitialUser();
      try {
        const meRes = await apiRequest('/me');
        if (meRes.ok && meRes.data) {
          const meData = Array.isArray(meRes.data) ? meRes.data[0] : meRes.data;
          if (meData && (meData.id || meData.role || meData.email)) {
            userObj = meData;
          }
        }
      } catch (e) {}

      const userRole = (userObj?.role || 'admin').toLowerCase();
      const isSuper = userRole === 'superadmin' || userRole === 'admin';
      
      setCurrentUser(userObj);
      setIsSuperadmin(isSuper);
      window.__NT_GLOBAL_IS_SUPERADMIN__ = isSuper;

      // 2. Assinatura ativa do tenant
      let activePlanName = 'Enterprise';
      try {
        const subRes = await apiRequest('/subscriptions');
        if (subRes.ok && Array.isArray(subRes.data) && subRes.data.length > 0) {
          const activeSub = subRes.data.find(s => s.is_active) || subRes.data[0];
          if (activeSub?.plan_name) {
            activePlanName = activeSub.plan_name;
            setCurrentPlan(activePlanName);
          }
        }
      } catch (e) {}

      if (activePlanName === 'nt_admin' || isSuper) {
        window.__NT_GLOBAL_PLAN_TABLES__ = ['*'];
        setPlanTables(['*']);
        setLoading(false);
        return;
      }

      // 3. Tabelas autorizadas no plano
      const { data, ok } = await apiRequest('/nt_plan_tables');
      let allowed = ['*'];
      if (ok && Array.isArray(data) && data.length > 0) {
        allowed = data.filter(item => item.is_allowed !== false).map(item => item.table_name || item.name);
      }
      window.__NT_GLOBAL_PLAN_TABLES__ = allowed;
      setPlanTables(allowed);
    } catch (err) {
      window.__NT_GLOBAL_PLAN_TABLES__ = ['*'];
      setPlanTables(['*']);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndPlan();
  }, [fetchProfileAndPlan]);

  const hasAccess = (resourceKey) => {
    if (!resourceKey) return true;
    const key = resourceKey.trim();
    const lowerKey = key.toLowerCase();
    const snakeKey = lowerKey.replace(/[\s&]+/g, '_');

    const superadminOnlyModules = [
      'tenants', 'tenant', 'plans & subscriptions', 'plans_subscriptions',
      'plans', 'subscriptions', 'nt_plan_tables', 'plan_tables'
    ];
    if (superadminOnlyModules.includes(lowerKey) || superadminOnlyModules.includes(snakeKey)) {
      const superFlag = window.__NT_GLOBAL_IS_SUPERADMIN__ !== undefined ? window.__NT_GLOBAL_IS_SUPERADMIN__ : isSuperadmin;
      return !!superFlag;
    }

    const globalAllowed = window.__NT_GLOBAL_PLAN_TABLES__ || planTables;
    if (!globalAllowed) return true;
    if (globalAllowed.includes('*')) return true;

    const coreModules = [
      'authentication', 'identity & profile', 'identity_profile',
      'users & rbac', 'users_rbac', 'users', 'me',
      'audit & system logs', 'audit_system_logs', 'nt_system_logs', 'anttest'
    ];
    if (coreModules.includes(lowerKey) || coreModules.includes(snakeKey)) {
      return true;
    }

    return (
      globalAllowed.includes(key) ||
      globalAllowed.includes(lowerKey) ||
      globalAllowed.includes(snakeKey) ||
      globalAllowed.some(item => {
        const norm = item.toLowerCase();
        return norm === lowerKey || norm === snakeKey || norm.startsWith(snakeKey) || snakeKey.startsWith(norm);
      })
    );
  };

  return (
    <PlanContext.Provider value={{
      currentUser,
      setCurrentUser,
      planTables,
      currentPlan,
      hasAccess,
      isSuperadmin,
      loading,
      refetchProfile: fetchProfileAndPlan
    }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);
