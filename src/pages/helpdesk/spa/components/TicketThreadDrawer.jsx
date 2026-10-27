import React, { useState } from 'react';
import {
  Drawer,
  Tag,
  Typography,
  Space,
  Button,
  Input,
  Checkbox,
  Select,
  Divider,
  Card,
  Avatar,
  message
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  LockOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { TICKET_STATUS_CONFIG, TICKET_PRIORITIES } from '../schemaConfig';
import { apiRequest } from '../../../../services/api';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

export const TicketThreadDrawer = ({
  open,
  ticket,
  messages = [],
  cannedResponses = [],
  users = [],
  departments = [],
  currentUser,
  onClose,
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);

  if (!ticket) return null;

  const ticketMessages = messages.filter(m => m.ticket_id === ticket.id).sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  const requester = users.find(u => u.id === ticket.requester_user_id);
  const agent = users.find(u => u.id === ticket.assigned_agent_id);
  const dept = departments.find(d => d.id === ticket.department_id);

  const statusConfig = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.open;
  const priorityConfig = TICKET_PRIORITIES[ticket.priority] || TICKET_PRIORITIES.medium;

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      let authorId = currentUser?.id;
      if (!authorId) {
        const meRes = await apiRequest('/me');
        const meData = meRes.ok && meRes.data ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data) : null;
        authorId = meData?.id;
      }

      const res = await apiRequest('/helpdesk_ticket_messages', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ticket_id: ticket.id,
          author_user_id: authorId,
          is_internal_note: isInternalNote,
          message_body: replyText.trim(),
          message_json: {}
        })
      });

      if (res.ok) {
        message.success(isInternalNote ? 'Nota interna adicionada!' : 'Resposta enviada!');
        setReplyText('');
        setIsInternalNote(false);
        onRefresh();
      } else {
        message.error('Erro ao enviar mensagem');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setSending(false);
    }
  };

  const handleResolveTicket = async () => {
    try {
      const res = await apiRequest(`/helpdesk_tickets?id=eq.${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
      });
      if (res.ok) {
        message.success('Chamado resolvido com sucesso!');
        onRefresh();
      }
    } catch {
      message.error('Erro ao resolver chamado');
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 24 }}>
          <div>
            <Tag color="geekblue" style={{ borderRadius: 6, fontWeight: 700 }}>{ticket.ticket_number}</Tag>
            <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 8 }}>{ticket.subject}</span>
          </div>
          <Space>
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            <Tag color={priorityConfig.color}>{priorityConfig.label}</Tag>
          </Space>
        </div>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      extra={
        ticket.status !== 'resolved' && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ background: '#10b981', borderColor: '#10b981' }}
            onClick={handleResolveTicket}
          >
            Marcar Resolvido
          </Button>
        )
      }
    >
      {/* Header Info Block */}
      <div style={{
        padding: '12px 16px',
        background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#f8fafc',
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 13
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <p style={{ margin: '3px 0' }}>👤 <strong>Solicitante:</strong> {requester ? (requester.full_name || requester.email) : 'Não identificado'}</p>
            <p style={{ margin: '3px 0' }}>🎧 <strong>Atendente:</strong> {agent ? (agent.full_name || agent.email) : 'Não atribuído'}</p>
          </Col>
          <Col span={12}>
            <p style={{ margin: '3px 0' }}>🏢 <strong>Departamento:</strong> {dept?.name || 'Geral'}</p>
            <p style={{ margin: '3px 0' }}>📅 <strong>Aberto em:</strong> {dayjs(ticket.created_at).format('DD/MM/YYYY HH:mm')}</p>
          </Col>
        </Row>
      </div>

      {/* Initial Ticket Description */}
      <Card
        style={{
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: 12,
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          marginBottom: 16
        }}
        styles={{ body: {padding: 16} }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0284c7' }} />
          <div>
            <Text strong>{requester ? (requester.full_name || requester.email) : 'Solicitante'}</Text>
            <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', display: 'block' }}>
              Descrição Inicial • {dayjs(ticket.created_at).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
        </div>
        <Paragraph style={{ whiteSpace: 'pre-wrap', color: isDark ? '#e2e8f0' : 'rgba(26, 35, 56, 0.85)', margin: 0 }}>
          {ticket.description}
        </Paragraph>
      </Card>

      <Divider style={{ margin: '20px 0' }}>Histórico de Mensagens & Respostas</Divider>

      {/* Messages Thread */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {ticketMessages.map(msg => {
          const author = users.find(u => u.id === msg.author_user_id);
          const isNote = msg.is_internal_note;

          return (
            <div
              key={msg.id}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: isNote
                  ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7')
                  : (isDark ? 'rgba(26, 35, 56, 0.85)' : '#f1f5f9'),
                border: isNote
                  ? '1px dashed #f59e0b'
                  : (isDark ? '1px solid #334155' : '1px solid #e2e8f0')
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isNote && <LockOutlined style={{ color: '#f59e0b' }} />}
                  <Text strong style={{ fontSize: 13, color: isNote ? '#f59e0b' : (isDark ? '#f8fafc' : '#0f172a') }}>
                    {author ? (author.full_name || author.email) : 'Usuário'}
                    {isNote && ' (Nota Interna - Visível apenas para a equipe)'}
                  </Text>
                </div>
                <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>
                  {dayjs(msg.created_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>

              <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 13, color: isDark ? '#cbd5e1' : '#334155' }}>
                {msg.message_body}
              </Paragraph>
            </div>
          );
        })}

        {ticketMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: isDark ? '#64748b' : '#94a3b8', fontSize: 13 }}>
            Nenhuma resposta adicional enviada até o momento.
          </div>
        )}
      </div>

      {/* Reply Composer */}
      <div style={{
        marginTop: 'auto',
        padding: 16,
        background: isDark ? '#0f172a' : '#f8fafc',
        borderRadius: 12,
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
      }}>
        {/* Canned responses select */}
        {cannedResponses.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <Select
              placeholder="⚡ Inserir Resposta Rápida (Template)..."
              style={{ width: '100%' }}
              allowClear
              options={cannedResponses.map(c => ({
                value: c.body_content,
                label: `⚡ ${c.title} (${c.shortcut_code || 'snippet'})`
              }))}
              onChange={(val) => {
                if (val) setReplyText(val);
              }}
            />
          </div>
        )}

        <TextArea
          rows={3}
          placeholder={isInternalNote ? 'Escreva uma nota interna confidencial...' : 'Escreva a resposta para o solicitante...'}
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Checkbox
            checked={isInternalNote}
            onChange={e => setIsInternalNote(e.target.checked)}
          >
            <span style={{ fontSize: 13, color: isInternalNote ? '#f59e0b' : (isDark ? '#94a3b8' : '#64748b') }}>
              🔒 Nota Interna
            </span>
          </Checkbox>

          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={sending}
            onClick={handleSendReply}
            disabled={!replyText.trim()}
          >
            {isInternalNote ? 'Salvar Nota' : 'Enviar Resposta'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
