export const RESTAURANTS_SCHEMA = {
  applet: 'Restaurants',
  title: 'Gestão Gastronômica, Cardápio & Comandas',
  description: 'Cardápio digital, mesas e comandas em tempo real, controle de ingredientes/estoque de insumos e promoções.',
  tables: [
    'restaurant_tabs',
    'restaurant_tab_items',
    'restaurant_schedules',
    'restaurant_promotions',
    'restaurant_promotions_attachments',
    'restaurant_promotion_menus',
    'catalog_items',
    'catalog_categories',
    'catalog_bom_bill_of_materials'
  ]
};

export const TAB_STATUS_CONFIG = {
  open: { color: 'green', label: 'Aberta / Em Atendimento' },
  closed: { color: 'blue', label: 'Fechada / Paga' },
  cancelled: { color: 'red', label: 'Cancelada' }
};

export const UNIT_OF_MEASURE_OPTIONS = [
  { value: 'unit', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilo (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'portion', label: 'Porção' },
  { value: 'box', label: 'Caixa / Pacote' }
];
