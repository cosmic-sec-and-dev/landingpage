import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Input, Button, Space, Tag, Avatar, Badge, Tooltip } from 'antd';
import {
  SendOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  PaperClipOutlined,
  SmileOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../context/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: 'Olá! Sou o Assistente Virtual da Selene. Como posso ajudar na sua operação hoje?',
    time: 'Agora',
    isFaq: true
  },
  {
    id: 2,
    sender: 'bot',
    text: 'Você pode selecionar uma das dúvidas frequentes abaixo ou digitar sua pergunta diretamente na caixa de mensagem.',
    time: 'Agora'
  }
];

const FAQ_SUGGESTIONS = [
  'Como criar e organizar colunas no Kanban?',
  'Como funciona o isolamento multi-tenant (RLS)?',
  'Como trocar ou assinar um novo plano?',
  'Como emitir vendas e abrir caixa no Commerce Hub?',
  'Como cadastrar novos usuários e permissões RBAC?',
  'Como exportar relatórios e fichas em PDF?'
];

const FAQ_ANSWERS = {
  'kanban': 'No applet Kanban, selecione um Quadro ativo e clique em "Nova Coluna" ou "Adicionar Cartão". Você pode mover tarefas entre etapas usando os botões laterais de avanço.',
  'rls': 'O isolamento RLS (Row-Level Security) do PostgreSQL 18 assegura que cada Tenant só tenha acesso estrito aos seus próprios registros via auth.nt_current_tenant_id().',
  'plano': 'Acesse o menu "Plans & Subscriptions" para visualizar a tabela de planos disponíveis (nt_admin, master, enterprise) e gerenciar assinaturas ativas da sua empresa.',
  'commerce': 'O Unified Commerce Hub integra sessões de caixa PDV, liquidação multi-meio (split payments) e controle de estoque com livro-razão (Inventory Ledger).',
  'rbac': 'Acesse o applet "Users & RBAC" para cadastrar colaboradores, atribuir papéis (superadmin, manager, staff, viewer) e vincular ao seu Tenant.',
  'pdf': 'Em qualquer visualização de detalhes (ViewModal), clique no botão "Imprimir / PDF" no rodapé para gerar um relatório formatado e pronto para download.'
};

export const SupportChatPage = ({ onNavigate, initialQuery = '' }) => {
  const { isDark } = useAppTheme();
  const [messages, setMessages] = useState(() => {
    if (initialQuery && initialQuery.trim()) {
      return [
        ...INITIAL_MESSAGES,
        {
          id: 3,
          sender: 'user',
          text: initialQuery,
          time: 'Agora'
        },
        {
          id: 4,
          sender: 'bot',
          text: `Recebi sua dúvida sobre "${initialQuery}". Um atendente especialista da equipe Selene responderá em breve ou você pode consultar nossos artigos na Central de Ajuda.`,
          time: 'Agora'
        }
      ];
    }
    return INITIAL_MESSAGES;
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart bot response
    setTimeout(() => {
      let botResponse = 'Obrigado pelo contato! Sua solicitação foi registrada no protocolo #SL-2026-9482. Nossa inteligência artificial e suporte técnico estão à disposição.';
      
      const lower = query.toLowerCase();
      if (lower.includes('kanban') || lower.includes('cartao') || lower.includes('cartão') || lower.includes('coluna')) {
        botResponse = FAQ_ANSWERS['kanban'];
      } else if (lower.includes('rls') || lower.includes('segurança') || lower.includes('tenant') || lower.includes('isolamento')) {
        botResponse = FAQ_ANSWERS['rls'];
      } else if (lower.includes('plano') || lower.includes('assinatura') || lower.includes('subscription')) {
        botResponse = FAQ_ANSWERS['plano'];
      } else if (lower.includes('commerce') || lower.includes('caixa') || lower.includes('venda') || lower.includes('pdv')) {
        botResponse = FAQ_ANSWERS['commerce'];
      } else if (lower.includes('usuario') || lower.includes('usuário') || lower.includes('rbac') || lower.includes('permiss')) {
        botResponse = FAQ_ANSWERS['rbac'];
      } else if (lower.includes('pdf') || lower.includes('relatorio') || lower.includes('relatório') || lower.includes('imprimir')) {
        botResponse = FAQ_ANSWERS['pdf'];
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Card */}
      <Card
        style={{
          background: isDark ? 'rgba(26, 35, 56, 0.9)' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderRadius: '12px 12px 0 0',
          marginBottom: 0
        }}
        styles={{ body: { padding: '14px 20px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Space size="middle" align="center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => onNavigate?.('home')}
              type="text"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              Início
            </Button>
            <Badge dot status="success" offset={[-2, 28]}>
              <Avatar
                size={40}
                icon={<RobotOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.35)'
                }}
              />
            </Badge>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text strong style={{ fontSize: '15px', color: isDark ? '#f8fafc' : '#0f172a' }}>
                  Suporte & Assistente Virtual Selene
                </Text>
                <Tag color="green" style={{ margin: 0, fontSize: '10px', lineHeight: '14px', borderRadius: '4px' }}>
                  Online
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Protocolo: #SL-2026-9482 • FAQ Inteligente e Central de Atendimento
              </Text>
            </div>
          </Space>

          <Space>
            <Tooltip title="Limpar conversa">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                onClick={() => setMessages(INITIAL_MESSAGES)}
              >
                Reiniciar
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* Chat Messages Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: isDark ? 'rgba(8, 13, 26, 0.7)' : '#f8fafc',
          borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        className="custom-content-scroll"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {!isUser && (
                <Avatar
                  size={32}
                  icon={<RobotOutlined />}
                  style={{ background: '#0284c7', flexShrink: 0, marginTop: '2px' }}
                />
              )}
              <div style={{ maxWidth: '75%' }}>
                <div
                  style={{
                    background: isUser
                      ? 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)'
                      : isDark
                        ? 'rgba(26, 35, 56, 0.95)'
                        : '#ffffff',
                    color: isUser ? '#ffffff' : isDark ? '#f1f5f9' : '#0f172a',
                    border: isUser
                      ? 'none'
                      : isDark
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid #e2e8f0',
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: isDark ? '#64748b' : '#94a3b8',
                    marginTop: '4px',
                    textAlign: isUser ? 'right' : 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    gap: '4px'
                  }}
                >
                  <span>{msg.time}</span>
                  {isUser && <CheckOutlined style={{ fontSize: '10px', color: '#38bdf8' }} />}
                </div>
              </div>
              {isUser && (
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ background: '#2563eb', flexShrink: 0, marginTop: '2px' }}
                />
              )}
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar size={32} icon={<RobotOutlined />} style={{ background: '#0284c7' }} />
            <div
              style={{
                background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                padding: '10px 16px',
                borderRadius: '16px 16px 16px 2px',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '13px'
              }}
            >
              Digitando resposta...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Pills Strip */}
      <div
        style={{
          padding: '10px 16px',
          background: isDark ? 'rgba(26, 35, 56, 0.95)' : '#f1f5f9',
          borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          alignItems: 'center'
        }}
      >
        <Text type="secondary" style={{ fontSize: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <QuestionCircleOutlined /> Sugestões:
        </Text>
        {FAQ_SUGGESTIONS.map((faq, idx) => (
          <Button
            key={idx}
            size="small"
            type="dashed"
            onClick={() => handleSendMessage(faq)}
            style={{
              fontSize: '12px',
              borderRadius: '14px',
              flexShrink: 0,
              background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
              borderColor: isDark ? 'rgba(56,189,248,0.25)' : '#cbd5e1',
              color: isDark ? '#cbd5e1' : '#334155'
            }}
          >
            {faq}
          </Button>
        ))}
      </div>

      {/* Input Footer Card */}
      <Card
        style={{
          background: isDark ? 'rgba(26, 35, 56, 0.9)' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderRadius: '0 0 12px 12px',
          borderTop: 0
        }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Digite sua dúvida ou mensagem de suporte... (Enter para enviar)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              background: isDark ? 'rgba(8, 13, 26, 0.6)' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
              color: isDark ? '#f8fafc' : '#0f172a',
              borderRadius: '8px'
            }}
          />
          <Space size={6}>
            <Tooltip title="Anexar arquivo / print">
              <Button icon={<PaperClipOutlined />} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
            </Tooltip>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                border: 0,
                fontWeight: 600
              }}
            >
              Enviar
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};
