import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const RestaurantsSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Restaurants') && !hasAccess('restaurant_menus') && !hasAccess('restaurants')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Restaurante & Gastronomia."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    menus: [],
    categories: [],
    tabs: [],
    tabItems: [],
    inventoryItems: [],
    users: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllRestaurantData = async () => {
    setLoading(true);
    try {
      const [
        menusRes,
        catRes,
        tabsRes,
        tabItmRes,
        invRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest('/catalog_items?available_in_restaurant=eq.true&order=created_at.desc'),
        apiRequest('/catalog_categories?order=display_order.asc'),
        apiRequest('/restaurant_tabs?order=opened_at.desc'),
        apiRequest('/restaurant_tab_items'),
        apiRequest('/catalog_items?item_type=eq.raw_material&order=name.asc'),
        apiRequest('/users'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        menus: menusRes.ok && Array.isArray(menusRes.data) ? menusRes.data : [],
        categories: catRes.ok && Array.isArray(catRes.data) ? catRes.data : [],
        tabs: tabsRes.ok && Array.isArray(tabsRes.data) ? tabsRes.data : [],
        tabItems: tabItmRes.ok && Array.isArray(tabItmRes.data) ? tabItmRes.data : [],
        inventoryItems: invRes.ok && Array.isArray(invRes.data) ? invRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do Restaurante');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRestaurantData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="Restaurants"
          title="Gestão Gastronômica, Cardápio & Comandas"
          description="Cardápio digital de pratos e bebidas, mesas e comandas em tempo real, estoque de insumos e fechamento de contas."
          count={moduleData.menus.length}
        />
      </div>

      {loading && moduleData.menus.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          menus={moduleData.menus}
          categories={moduleData.categories}
          tabs={moduleData.tabs}
          tabItems={moduleData.tabItems}
          inventoryItems={moduleData.inventoryItems}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllRestaurantData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default RestaurantsSpaPage;
