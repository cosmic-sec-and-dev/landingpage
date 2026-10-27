export const COMMERCE_HUB_SCHEMA = {
  applet: 'Commerce Hub',
  title: 'Commerce Hub & Catálogo Universal',
  description: 'Gestão unificada do catálogo mestre de itens (físicos, digitais, serviços e receitas), controle de estoque e vendas multicanal.',
  tables: [
    'catalog_items',
    'catalog_categories',
    'catalog_bom_bill_of_materials',
    'commerce_orders',
    'commerce_order_items',
    'commerce_order_payments',
    'commerce_pos_cash_sessions',
    'commerce_payment_gateways',
    'commerce_payment_methods',
    'commerce_payment_transactions',
    'commerce_payment_refunds',
    'master_inventory_ledger_movements'
  ]
};

export const ITEM_TYPE_CONFIG = {
  physical: { color: 'blue', label: '📦 Produto Físico', icon: 'Box' },
  digital: { color: 'purple', label: '💾 Digital / E-book / Key', icon: 'Cloud' },
  service: { color: 'cyan', label: '🩺 Serviço / Mão de Obra', icon: 'Tool' },
  manufactured: { color: 'gold', label: '🍳 Fabricado / Receita BOM', icon: 'Build' },
  raw_material: { color: 'orange', label: '🌾 Matéria-Prima / Insumo', icon: 'Layers' },
  ticket: { color: 'green', label: '🎟️ Ingresso / Voucher', icon: 'Tag' }
};

export const STOCK_MOVEMENT_TYPES = [
  { value: 'purchase_receipt', label: '📥 Entrada por Compra / Fornecedor', color: 'green' },
  { value: 'sale_deduction', label: '📤 Saída por Venda PDV / Online', color: 'blue' },
  { value: 'recipe_bom_deduction', label: '🍳 Consumo em Receita BOM', color: 'gold' },
  { value: 'loss_wastage', label: '⚠️ Perda / Quebra / Avaria', color: 'red' },
  { value: 'manual_adjustment', label: '⚙️ Ajuste Manual de Balanço', color: 'purple' },
  { value: 'return_restock', label: '↩️ Devolução / Retorno ao Estoque', color: 'cyan' },
  { value: 'transfer', label: '🔄 Transferência entre Filiais / Depósitos', color: 'indigo' }
];
