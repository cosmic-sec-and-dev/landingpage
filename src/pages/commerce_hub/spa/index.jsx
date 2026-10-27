import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const CommerceHubSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Commerce Hub') && !hasAccess('catalog_items') && !hasAccess('commerce_hub') && !hasAccess('core_sales')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Commerce Hub."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    items: [],
    categories: [],
    sales: [],
    saleItems: [],
    stockMovements: [],
    gateways: [],
    transactions: [],
    itemAttachments: [],
    categoryAttachments: [],
    digitalDeliverables: [],
    users: [],
    currentUser: null
  });
  const [kpis, setKpis] = useState({
    total_catalog_items: 0,
    total_stock_value: 0,
    total_sales_revenue: 0,
    low_stock_count: 0
  });
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCommerceKpis = async () => {
    try {
      const res = await apiRequest('/rpc/get_commerce_hub_kpis');
      if (res.ok && res.data) {
        const d = Array.isArray(res.data) ? res.data[0] : res.data;
        setKpis(d);
        if (d.total_catalog_items !== undefined) {
          setCatalogTotal(Number(d.total_catalog_items));
        }
      }
    } catch {
      // fallback silencioso
    }
  };

  const fetchAllCommerceData = async (page = catalogPage) => {
    setLoading(true);
    try {
      const offset = (page - 1) * 50;
      const [
        itemsRes,
        catRes,
        salesRes,
        saleItmRes,
        stockRes,
        gatewaysRes,
        txRes,
        itemAttRes,
        catAttRes,
        digitalRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest(`/catalog_items?order=is_active.desc,created_at.desc&limit=50&offset=${offset}`),
        apiRequest('/catalog_categories?order=display_order.asc'),
        apiRequest('/pos_sales?order=created_at.desc&limit=50'),
        apiRequest('/commerce_orders?order=created_at.desc&limit=50'),
        apiRequest('/master_inventory_ledger_movements?order=created_at.desc&limit=50'),
        apiRequest('/commerce_payment_gateways?order=created_at.desc&limit=50'),
        apiRequest('/commerce_payment_transactions?order=created_at.desc&limit=50'),
        apiRequest('/catalog_items_attachments?is_deleted=eq.false&order=display_order.asc&limit=50'),
        apiRequest('/catalog_categories_attachments?is_deleted=eq.false&order=display_order.asc&limit=50'),
        apiRequest('/digital_item_deliverables?is_active=eq.true&limit=50'),
        apiRequest('/users?limit=50'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      if (itemsRes.total !== undefined && itemsRes.total !== null) {
        setCatalogTotal(itemsRes.total);
      }

      setModuleData({
        items: itemsRes.ok && Array.isArray(itemsRes.data) ? itemsRes.data : [],
        categories: catRes.ok && Array.isArray(catRes.data) ? catRes.data : [],
        sales: salesRes.ok && Array.isArray(salesRes.data) ? salesRes.data : [],
        saleItems: saleItmRes.ok && Array.isArray(saleItmRes.data) ? saleItmRes.data : [],
        stockMovements: stockRes.ok && Array.isArray(stockRes.data) ? stockRes.data : [],
        gateways: gatewaysRes.ok && Array.isArray(gatewaysRes.data) ? gatewaysRes.data : [],
        transactions: txRes.ok && Array.isArray(txRes.data) ? txRes.data : [],
        itemAttachments: itemAttRes.ok && Array.isArray(itemAttRes.data) ? itemAttRes.data : [],
        categoryAttachments: catAttRes.ok && Array.isArray(catAttRes.data) ? catAttRes.data : [],
        digitalDeliverables: digitalRes.ok && Array.isArray(digitalRes.data) ? digitalRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do Commerce Hub');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommerceKpis();
    fetchAllCommerceData(catalogPage);
  }, [catalogPage]);

  const handleRefresh = () => {
    fetchCommerceKpis();
    fetchAllCommerceData(catalogPage);
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="Commerce Hub"
          title="Catálogo Universal, Estoque & Motor de Pagamentos"
          description="Gestão integrada de catálogo universal, livro-razão de estoque, vendas multicanal e gateways de pagamento."
          count={kpis.total_catalog_items || catalogTotal}
        />
      </div>

      {loading && moduleData.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          items={moduleData.items}
          categories={moduleData.categories}
          sales={moduleData.sales}
          saleItems={moduleData.saleItems}
          stockMovements={moduleData.stockMovements}
          gateways={moduleData.gateways}
          transactions={moduleData.transactions}
          itemAttachments={moduleData.itemAttachments}
          categoryAttachments={moduleData.categoryAttachments}
          digitalDeliverables={moduleData.digitalDeliverables}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          kpis={kpis}
          catalogPage={catalogPage}
          onCatalogPageChange={(p) => setCatalogPage(p)}
          catalogTotal={catalogTotal}
          onRefresh={handleRefresh}
          loading={loading}
        />
      )}
    </div>
  );
};
export default CommerceHubSpaPage;
