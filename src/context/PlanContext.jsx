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

// Mapping of plans to their corresponding Applet tags
export const PLAN_TO_APPLETS_MAP = {
  'plan_kanban': ['Kanban'],
  'plan_clinics': ['Clinics'],
  'plan_catalog': ['Commerce Hub'],
  'plan_pos': ['Commerce Hub', 'Payments'],
  'plan_inventory': ['Commerce Hub'],
  'plan_crm': ['Crm'],
  'plan_ecommerce': ['Ecommerce'],
  'plan_collaboration': ['Collaboration'],
  'plan_events': ['Events'],
  'plan_helpdesk': ['Helpdesk'],
  'plan_infrastructure': ['Infrastructure'],
  'plan_json_box': ['Json Box'],
  'plan_notekeep': ['Notekeep'],
  'plan_notifications': ['Notifications'],
  'plan_payments': ['Payments'],
  'plan_real_estate': ['Real Estate'],
  'plan_restaurants': ['Restaurants'],
  'plan_social_media': ['Social Media'],
  'plan_blogger': ['Cms Advanced'],
  'plan_campaigns': ['Campaigns']
};

export const CORE_APPLETS = [
  'Authentication',
  'Identity & Profile',
  'Users & RBAC',
  'Audit & System Logs'
];

export const SUPERADMIN_ONLY_APPLETS = [
  'Tenants',
  'Plans & Subscriptions'
];

window.__NT_GLOBAL_PLAN_TABLES__ = window.__NT_GLOBAL_PLAN_TABLES__ || null;
window.__NT_GLOBAL_IS_SUPERADMIN__ = window.__NT_GLOBAL_IS_SUPERADMIN__ || false;

const PlanContext = createContext(null);

export const PlanProvider = ({ children, appletsConfig = {} }) => {
  const [currentUser, setCurrentUser] = useState(getInitialUser());
  const [planTables, setPlanTables] = useState(window.__NT_GLOBAL_PLAN_TABLES__ || null);
  const [isSuperadmin, setIsSuperadmin] = useState(window.__NT_GLOBAL_IS_SUPERADMIN__ || true);
  const [authorizedApplets, setAuthorizedApplets] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Enterprise');

  const fetchProfileAndPlan = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      const defUser = getInitialUser();
      setCurrentUser(defUser);
      setIsSuperadmin(true);
      window.__NT_GLOBAL_IS_SUPERADMIN__ = true;
      window.__NT_GLOBAL_PLAN_TABLES__ = ['*'];
      setPlanTables(['*']);
      setAuthorizedApplets(appletsConfig || {});
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

      const userRole = (userObj?.role || userObj?.user_role || 'user').toLowerCase();
      const isSuper = userRole === 'superadmin';
      
      setCurrentUser(userObj);
      setIsSuperadmin(isSuper);
      window.__NT_GLOBAL_IS_SUPERADMIN__ = isSuper;

      // 2. Assinaturas ativas do tenant (BFF Entitlements Resolution)
      let activePlans = [];
      let isMasterPlan = false;
      let activePlanName = 'Enterprise';
      try {
        const subRes = await apiRequest('/subscriptions');
        if (subRes.ok && Array.isArray(subRes.data) && subRes.data.length > 0) {
          const activeSubs = subRes.data.filter(s => s.is_active !== false);
          activePlans = activeSubs.map(s => s.plan_name || s.name).filter(Boolean);
          isMasterPlan = activePlans.includes('nt_admin');
          if (activeSubs[0]?.plan_name) {
            activePlanName = activeSubs[0].plan_name;
            setCurrentPlan(activePlanName);
          }
        }
      } catch (e) {}

      // 3. BFF Navigation Filtering: Determinar com rigor quais módulos o tenant possui no plano
      const allAvailableApplets = appletsConfig || {};
      const allTags = Object.keys(allAvailableApplets);
      let allowedTagsSet = new Set();

      if (isSuper) {
        // Superadmin possui todos os módulos (incluindo Tenants e Plans)
        allTags.forEach(t => allowedTagsSet.add(t));
      } else if (isMasterPlan) {
        // Plano Master nt_admin tem todos os módulos exceto os exclusivos de superadmin
        allTags.forEach(t => {
          if (!SUPERADMIN_ONLY_APPLETS.includes(t)) {
            allowedTagsSet.add(t);
          }
        });
      } else {
        // Tenant modular: apenas módulos essenciais/core + módulos dos planos subscritos
        CORE_APPLETS.forEach(t => allowedTagsSet.add(t));
        activePlans.forEach(plan => {
          const mapped = PLAN_TO_APPLETS_MAP[plan];
          if (Array.isArray(mapped)) {
            mapped.forEach(t => allowedTagsSet.add(t));
          }
        });
      }

      // Filtrar appletsConfig no BFF: nada fora do plano passa para o cliente
      const filtered = {};
      allowedTagsSet.forEach(tag => {
        if (allAvailableApplets[tag]) {
          filtered[tag] = allAvailableApplets[tag];
        }
      });
      setAuthorizedApplets(filtered);

      // 4. Tabelas autorizadas no plano
      if (isMasterPlan || isSuper) {
        window.__NT_GLOBAL_PLAN_TABLES__ = ['*'];
        setPlanTables(['*']);
      } else {
        try {
          const { data, ok } = await apiRequest('/nt_plan_tables');
          let allowed = [];
          if (ok && Array.isArray(data) && data.length > 0) {
            allowed = data.filter(item => item.is_allowed !== false).map(item => item.table_name || item.name);
          }
          window.__NT_GLOBAL_PLAN_TABLES__ = allowed;
          setPlanTables(allowed);
        } catch (e) {
          window.__NT_GLOBAL_PLAN_TABLES__ = [];
          setPlanTables([]);
        }
      }
    } catch (err) {
      setAuthorizedApplets(appletsConfig || {});
    } finally {
      setLoading(false);
    }
  }, [appletsConfig]);

  useEffect(() => {
    fetchProfileAndPlan();
  }, [fetchProfileAndPlan]);

  const hasAccess = (resourceKey) => {
    if (!resourceKey) return true;
    const key = resourceKey.trim();
    const lowerKey = key.toLowerCase();
    const snakeKey = lowerKey.replace(/[\s&]+/g, '_');

    // Módulos restritos a Superadmin
    if (SUPERADMIN_ONLY_APPLETS.some(t => t.toLowerCase() === lowerKey || t.toLowerCase().replace(/[\s&]+/g, '_') === snakeKey)) {
      return !!isSuperadmin;
    }

    if (isSuperadmin) return true;

    // Verificar no conjunto de applets autorizados pelo BFF
    if (authorizedApplets && Object.keys(authorizedApplets).length > 0) {
      const match = Object.keys(authorizedApplets).some(tag => {
        const normTag = tag.toLowerCase();
        return normTag === lowerKey || normTag.replace(/[\s&]+/g, '_') === snakeKey;
      });
      if (match) return true;

      // Verificar se corresponde a um endpoint dos applets autorizados
      for (const endpoints of Object.values(authorizedApplets)) {
        if (Array.isArray(endpoints)) {
          const epMatch = endpoints.some(ep => {
            const epPath = (ep.path || '').replace(/^\//, '').toLowerCase();
            const epKey = (ep.endpoint_key || '').toLowerCase();
            return epPath === lowerKey || epKey === lowerKey || epPath === snakeKey || epKey === snakeKey;
          });
          if (epMatch) return true;
        }
      }
      return false;
    }

    // Fallback: core modules
    if (CORE_APPLETS.some(t => t.toLowerCase() === lowerKey || t.toLowerCase().replace(/[\s&]+/g, '_') === snakeKey)) {
      return true;
    }

    const globalAllowed = window.__NT_GLOBAL_PLAN_TABLES__ || planTables;
    if (!globalAllowed) return false;
    if (globalAllowed.includes('*')) return true;

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
      authorizedApplets,
      loading,
      refetchProfile: fetchProfileAndPlan
    }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);
