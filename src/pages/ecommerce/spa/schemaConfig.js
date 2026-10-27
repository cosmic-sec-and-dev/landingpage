export const ECOMMERCE_SCHEMA = {
  applet: 'Ecommerce',
  title: 'Loja Virtual & E-commerce',
  description: 'Gestão da vitrine de produtos online, pedidos de clientes, cupons promocionais, avaliações e configurações de entrega.',
  tables: [
    'catalog_items',
    'catalog_categories',
    'commerce_orders',
    'commerce_order_items',
    'coupons',
    'ratings',
    'ratings_attachments',
    'ecommerce_carts',
    'ecommerce_cart_items',
    'ecommerce_payment_settings',
    'shipping_settings'
  ]
};

export const ORDER_STATUS_CONFIG = {
  pending: { color: 'orange', label: 'Pendente', bg: 'rgba(249, 115, 22, 0.1)' },
  processing: { color: 'blue', label: 'Em Separação', bg: 'rgba(59, 130, 246, 0.1)' },
  shipped: { color: 'purple', label: 'Enviado / Em Trânsito', bg: 'rgba(168, 85, 247, 0.1)' },
  delivered: { color: 'green', label: 'Entregue', bg: 'rgba(34, 197, 94, 0.1)' },
  cancelled: { color: 'red', label: 'Cancelado', bg: 'rgba(239, 68, 68, 0.1)' }
};
