import React from 'react';
import { Breadcrumb, Tooltip, Button, Tag } from 'antd';
import { HomeOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const enrichedDescriptions = {
  'users_rbac': 'Gestão completa de identidades corporativas, controle de acesso baseado em papéis (RBAC), atribuição de permissões granulares por usuário e governança de credenciais com isolamento estrito multi-tenant.',
  'authentication': 'Módulo de autenticação segura, emissão e validação de tokens JWT, provisionamento inicial de contas e governança criptográfica de sessões de usuários.',
  'identity_profile': 'Central de perfil e credenciais do usuário autenticado. Permite visualizar e gerenciar dados de conta, preferências regionais, fuso horário, organização vinculada e chaves ativas.',
  'tenants': 'Orquestração multi-inquilino corporativo. Administra organizações isoladas, políticas de domínio, metadados corporativos e limites operacionais individuais por conta.',
  'plans_subscriptions': 'Gestão de planos comerciais e assinaturas ativas. Controla cotas de uso, limites de armazenamento, níveis de serviço contratados e ciclo de faturamento da empresa.',
  'audit_system_logs': 'Trilha de auditoria e telemetria operacional contínua. Registra requisições de API, eventos de segurança, alterações de estado, endereços IP e histórico de auditoria com retenção segura.',
  'clinics': 'Gestão em saúde e telemedicina: prontuários médicos eletrônicos, agendamento de consultas com controle de salas, cadastro de corpo clínico especializado e histórico clínico seguro.',
  'kanban': 'Gestão ágil e visual de fluxos de trabalho (Kanban). Permite orquestrar quadros, colunas personalizadas de status, prazos, prioridades e delegação colaborativa de tarefas.',
  'commerce_hub': 'Núcleo de Comércio Unificado & Frente de Caixa (POS). Centraliza catálogo unificado de produtos físicos e serviços, sessões de caixa PDV, split payments e livro-razão de estoque imutável.',
  'crm': 'Gestão de Relacionamento com Clientes (CRM). Pipelines visuais de negociação, funis de vendas, deals em tempo real, histórico de interações com clientes e prospecção ativa.',
  'ecommerce': 'Loja virtual e catálogo de varejo eletrônico: carrinho de compras em tempo real, regras de desconto e cupons, cálculo de frete, gateway de pagamentos e acompanhamento de pedidos.',
  'events': 'Plataforma para gestão de eventos presenciais e digitais: controle de lotes de ingressos (tiers), emissão de tickets digitais, agenda de palestras e credenciamento.',
  'helpdesk': 'Central de suporte multicanal e atendimento ao cliente: tickets com controle rígido de políticas de SLA por departamento, respostas rápidas parametrizadas e base de conhecimento.',
  'infrastructure': 'Painel de infraestrutura, telemetria e arquivos: monitoramento de saúde de servidores, widgets dinâmicos de operações, registros de sistema e repositório centralizado.',
  'json_box': 'Armazenamento schemaless para integração ultrarrápida de payloads JSON heterogêneos com indexação JSONB avançada no PostgreSQL.',
  'notifications': 'Central de mensageria corporativa multicanal: templates e fila de disparos de e-mails transacionais e notificações push em tempo real com rastreamento de entrega.',
  'payments': 'Controle financeiro e transacional: emissão de faturas (invoices), liquidação de recebimentos, histórico de transações e conciliação bancária multi-meios.',
  'real_estate': 'Plataforma imobiliária: portfólio completo de propriedades, agendamento de visitas com clientes, métricas de visualização e rede de corretores credenciados.',
  'restaurants': 'Gestão para gastronomia e food service: comandas digitais, cardápios interativos com ficha técnica de insumos, reservas de mesas e promoções programadas.',
  'social_media': 'Rede social corporativa interna: feeds de postagens, canais de discussão, perfis de colaboradores, reações, comentários e grupos de interesse.',
  'cms_advanced': 'Sistema de Gestão de Conteúdo (CMS): publicação de artigos, páginas institucionais com versionamento, templates dinâmicos e controle de anexos de mídia.'
};

export const AppletHeader = ({ tag, title, description, count, onNavigate }) => {
  const handleGoHome = (e) => {
    e?.preventDefault();
    if (typeof onNavigate === 'function') {
      onNavigate('home');
    } else {
      window.dispatchEvent(new CustomEvent('nt:navigate', { detail: 'home' }));
    }
  };

  const cleanKey = (tag || title || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const detailedExplanation = enrichedDescriptions[cleanKey] || description || 'Módulo operacional integrado à arquitetura corporativa Selene com governança de dados e isolamento estrito.';

  const tooltipContent = (
    <div style={{ maxWidth: '360px', padding: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{title || tag}</strong>
        {tag && (
          <Tag color="cyan" style={{ margin: 0, fontSize: '10px', lineHeight: '14px' }}>
            {tag}
          </Tag>
        )}
      </div>

      <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#cbd5e1', margin: '0 0 10px 0' }}>
        {detailedExplanation}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '8px', flexWrap: 'wrap' }}>
        <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>RLS Ativo</Tag>
        {count !== undefined && (
          <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>{count} Registros</Tag>
        )}
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Multi-Tenant Seguro</span>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
      <Breadcrumb
        style={{ margin: 0 }}
        items={[
          {
            title: (
              <span
                onClick={handleGoHome}
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  color: '#38bdf8',
                  transition: 'opacity 0.2s'
                }}
                title="Voltar para Menu Iniciar"
              >
                <HomeOutlined /> Menu Iniciar
              </span>
            )
          },
          ...(tag ? [{ title: tag }] : []),
          {
            title: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span>{title}</span>
                <Tooltip
                  title={tooltipContent}
                  placement="bottomLeft"
                  styles={{ root: { maxWidth: 380 } }}
                >
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<QuestionCircleOutlined style={{ fontSize: '13px', color: '#38bdf8' }} />}
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      padding: 0,
                      cursor: 'help'
                    }}
                  />
                </Tooltip>
              </span>
            )
          }
        ]}
      />
    </div>
  );
};

export const ModuleHeader = AppletHeader;
