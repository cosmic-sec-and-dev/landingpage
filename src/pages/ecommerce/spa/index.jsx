import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const EcommerceSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Ecommerce') && !hasAccess('products') && !hasAccess('orders') && !hasAccess('ecommerce')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Loja Virtual & E-commerce."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    products: [],
    categories: [],
    orders: [],
    orderItems: [],
    coupons: [],
    ratings: [],
    users: [],
    currentUser: null
  });
  const [kpis, setKpis] = useState({
    total_products: 0,
    total_sales_revenue: 0,
    pending_orders_count: 0,
    active_coupons_count: 0
  });
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchEcommerceKpis = async () => {
    try {
      const res = await apiRequest('/rpc/get_ecommerce_kpis');
      if (res.ok && res.data) {
        const d = Array.isArray(res.data) ? res.data[0] : res.data;
        setKpis(d);
        if (d.total_products !== undefined) {
          setProductTotal(Number(d.total_products));
        }
      }
    } catch {
      // fallback silencioso
    }
  };

  const fetchAllEcommerceData = async (page = productPage) => {
    setLoading(true);
    try {
      const offset = (page - 1) * 50;
      const [
        productsRes,
        catRes,
        ordersRes,
        orderItmRes,
        couponsRes,
        ratingsRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest(`/catalog_items?available_in_ecommerce=eq.true&order=is_active.desc,created_at.desc&limit=50&offset=${offset}`),
        apiRequest('/catalog_categories?order=display_order.asc'),
        apiRequest('/commerce_orders?origin_channel=eq.ecommerce_web&order=created_at.desc&limit=50'),
        apiRequest('/commerce_order_items?limit=100'),
        apiRequest('/coupons?order=created_at.desc&limit=50'),
        apiRequest('/ratings?order=created_at.desc&limit=50'),
        apiRequest('/users?limit=50'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      if (productsRes.total !== undefined && productsRes.total !== null) {
        setProductTotal(productsRes.total);
      }

      setModuleData({
        products: productsRes.ok && Array.isArray(productsRes.data) ? productsRes.data : [],
        categories: catRes.ok && Array.isArray(catRes.data) ? catRes.data : [],
        orders: ordersRes.ok && Array.isArray(ordersRes.data) ? ordersRes.data : [],
        orderItems: orderItmRes.ok && Array.isArray(orderItmRes.data) ? orderItmRes.data : [],
        coupons: couponsRes.ok && Array.isArray(couponsRes.data) ? couponsRes.data : [],
        ratings: ratingsRes.ok && Array.isArray(ratingsRes.data) ? ratingsRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados da Loja Virtual');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcommerceKpis();
    fetchAllEcommerceData(productPage);
  }, [productPage]);

  const handleRefresh = () => {
    fetchEcommerceKpis();
    fetchAllEcommerceData(productPage);
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="E-commerce"
          title="Loja Virtual & Catálogo Online"
          description="Gestão de vitrine digital, pedidos de clientes, cupons de desconto, avaliações de produtos e logística."
          count={kpis.total_products || productTotal}
        />
      </div>

      {loading && moduleData.products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          products={moduleData.products}
          categories={moduleData.categories}
          orders={moduleData.orders}
          orderItems={moduleData.orderItems}
          coupons={moduleData.coupons}
          ratings={moduleData.ratings}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          kpis={kpis}
          productPage={productPage}
          onProductPageChange={(p) => setProductPage(p)}
          productTotal={productTotal}
          onRefresh={handleRefresh}
          loading={loading}
        />
      )}
    </div>
  );
};
export default EcommerceSpaPage;

