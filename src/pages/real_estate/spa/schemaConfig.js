export const REAL_ESTATE_SCHEMA = {
  applet: 'RealEstate',
  title: 'Gestão Imobiliária, Imóveis & Visitas',
  description: 'Portfólio de imóveis para venda e locação, controle de corretores (CRECI), carteira de clientes interessados e agendamento de visitas.',
  tables: [
    'properties',
    'agents',
    'clients',
    'visits',
    'property_views'
  ]
};

export const PROPERTY_STATUS_CONFIG = {
  available: { color: 'green', label: 'Disponível' },
  reserved: { color: 'orange', label: 'Reservado' },
  sold: { color: 'blue', label: 'Vendido' },
  rented: { color: 'purple', label: 'Alugado' }
};

export const LISTING_TYPE_CONFIG = {
  sale: { color: 'blue', label: 'Venda' },
  rent: { color: 'cyan', label: 'Locação' }
};

export const PROPERTY_TYPE_CONFIG = {
  apartment: { label: 'Apartamento', icon: '🏢' },
  house: { label: 'Casa', icon: '🏡' },
  commercial: { label: 'Comercial', icon: '🏬' },
  land: { label: 'Terreno / Lote', icon: '📐' },
  penthouse: { label: 'Cobertura', icon: '🌇' }
};

export const VISIT_STATUS_CONFIG = {
  scheduled: { color: 'orange', label: 'Agendada' },
  completed: { color: 'green', label: 'Realizada' },
  cancelled: { color: 'red', label: 'Cancelada' },
  no_show: { color: 'default', label: 'Não compareceu' }
};
