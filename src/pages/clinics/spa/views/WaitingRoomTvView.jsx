import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Button,
  Badge,
  Tooltip
} from 'antd';
import {
  SoundOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  AudioMutedOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';
import { TICKET_PRIORITY_CONFIG } from '../schemaConfig';

const { Title, Text } = Typography;

export const WaitingRoomTvView = ({
  rooms = [],
  users = [],
  onRefresh
}) => {
  const { isDark } = useAppTheme();
  const [routings, setRoutings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm:ss'));
  const [currentDate, setCurrentDate] = useState(dayjs().format('dddd, DD [de] MMMM [de] YYYY'));
  const [isFlashing, setIsFlashing] = useState(false);
  const lastCallIdRef = useRef(null);

  // Play synthetic chime via Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Note 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Note 2: A5 (880.00 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio playback restrictions fallback
    }
  };

  const fetchCalls = async () => {
    try {
      const [routingsRes, ticketsRes] = await Promise.all([
        apiRequest('/clinic_ticket_routings?order=routed_at.desc&limit=10'),
        apiRequest('/clinic_queue_tickets?order=issued_at.desc&limit=50')
      ]);

      const routData = routingsRes.ok && Array.isArray(routingsRes.data) ? routingsRes.data : [];
      const tickData = ticketsRes.ok && Array.isArray(ticketsRes.data) ? ticketsRes.data : [];

      setRoutings(routData);
      setTickets(tickData);

      // Check if newest call changed
      if (routData.length > 0) {
        const newest = routData[0];
        if (lastCallIdRef.current && lastCallIdRef.current !== newest.id) {
          playChime();
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 3000);
        }
        lastCallIdRef.current = newest.id;
      }
    } catch {
      // Ignore polling errors
    }
  };

  // Clock interval
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(dayjs().format('HH:mm:ss'));
      setCurrentDate(dayjs().format('DD/MM/YYYY'));
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Polling interval (every 4 seconds)
  useEffect(() => {
    fetchCalls();
    const pollTimer = setInterval(fetchCalls, 4000);
    return () => clearInterval(pollTimer);
  }, [soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const latestCall = routings[0] || null;
  const latestTicket = latestCall ? tickets.find(t => t.id === latestCall.ticket_id) : null;
  const latestRoom = latestCall ? rooms.find(r => r.id === latestCall.to_room_id) : null;
  const latestOperator = latestCall ? users.find(u => u.id === latestCall.operator_user_id) : null;

  const pastCalls = routings.slice(1, 6);

  return (
    <div style={{
      maxWidth: isFullscreen ? '100vw' : 1300,
      margin: '0 auto',
      minHeight: isFullscreen ? '100vh' : 'auto',
      background: isDark ? '#0b1120' : '#f8fafc',
      borderRadius: isFullscreen ? 0 : 20,
      padding: isFullscreen ? 32 : 16,
      transition: 'all 0.3s ease'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
        borderRadius: 16,
        marginBottom: 24,
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 22
          }}>
            🏥
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Painel Eletrônico de Atendimento
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Selene Medical Care • Chamada em Tempo Real
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
              {currentTime}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {currentDate}
            </Text>
          </div>

          <Space>
            <Tooltip title={soundEnabled ? 'Silenciar Alerta Sonoro' : 'Ativar Sinal Sonoro'}>
              <Button
                icon={soundEnabled ? <SoundOutlined /> : <AudioMutedOutlined />}
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playChime();
                }}
                type={soundEnabled ? 'primary' : 'default'}
              />
            </Tooltip>

            <Tooltip title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo TV Tela Cheia'}>
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* Main Display Grid */}
      <Row gutter={[24, 24]}>
        {/* Left Column: Big Current Call */}
        <Col xs={24} lg={16}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 24,
              background: isFlashing
                ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
                : (isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'),
              border: isFlashing ? '3px solid #60a5fa' : (isDark ? '2px solid #334155' : '2px solid #bae6fd'),
              boxShadow: isFlashing ? '0 0 30px rgba(96, 165, 250, 0.4)' : '0 12px 36px rgba(0,0,0,0.06)',
              textAlign: 'center',
              padding: '24px 16px',
              transition: 'all 0.5s ease',
              minHeight: 460,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {latestCall ? (
              <div>
                <Tag
                  color={isFlashing ? 'processing' : 'blue'}
                  style={{
                    fontSize: 16,
                    padding: '6px 20px',
                    borderRadius: 30,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginBottom: 16
                  }}
                >
                  <NotificationOutlined style={{ marginRight: 8 }} />
                  SENHA CHAMADA
                </Tag>

                {/* Big Ticket Number */}
                <div style={{
                  fontSize: isFullscreen ? 130 : 96,
                  fontWeight: 900,
                  color: isFlashing ? '#ffffff' : (TICKET_PRIORITY_CONFIG[latestTicket?.priority_category]?.color || '#0284c7'),
                  letterSpacing: 4,
                  lineHeight: 1,
                  margin: '12px 0 20px',
                  textShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}>
                  {latestTicket?.ticket_number || '---'}
                </div>

                {latestTicket?.priority_category && (
                  <div style={{ marginBottom: 24 }}>
                    <Tag
                      color={TICKET_PRIORITY_CONFIG[latestTicket.priority_category]?.color}
                      style={{ fontSize: 16, padding: '4px 16px', borderRadius: 8, fontWeight: 700 }}
                    >
                      {TICKET_PRIORITY_CONFIG[latestTicket.priority_category]?.label}
                    </Tag>
                  </div>
                )}

                {/* Room / Destination Banner */}
                <div style={{
                  maxWidth: 600,
                  margin: '0 auto',
                  padding: '20px 24px',
                  borderRadius: 18,
                  background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                }}>
                  <Text type="secondary" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 4 }}>
                    Favor Dirigir-se Para:
                  </Text>
                  <div style={{
                    fontSize: 34,
                    fontWeight: 800,
                    color: isDark ? '#38bdf8' : '#0369a1'
                  }}>
                    {latestRoom ? latestRoom.name : 'Aguardando Direcionamento'}
                  </div>

                  {latestOperator && (
                    <Text style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', marginTop: 8, display: 'block' }}>
                      Atendente: {latestOperator.full_name || latestOperator.email}
                    </Text>
                  )}
                </div>

                <div style={{ marginTop: 24 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Chamado às {dayjs(latestCall.routed_at).format('HH:mm:ss')} • Rota Auditável #{latestCall.id?.substring(0, 8)}
                  </Text>
                </div>
              </div>
            ) : (
              <div style={{ padding: '60px 0' }}>
                <NotificationOutlined style={{ fontSize: 64, color: '#94a3b8', marginBottom: 16 }} />
                <Title level={3} style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  Aguardando Novas Chamadas
                </Title>
                <Text type="secondary">O painel atualizará automaticamente quando um guichê ou consultório acionar a próxima senha.</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column: Historical Ticker of Previous Calls */}
        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#0284c7' }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>Últimas Senhas Chamadas</span>
              </div>
            }
            style={{
              borderRadius: 24,
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              minHeight: 460
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            {pastCalls.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                Nenhuma chamada anterior recente.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pastCalls.map((call, idx) => {
                  const t = tickets.find(tk => tk.id === call.ticket_id);
                  const r = rooms.find(rm => rm.id === call.to_room_id);
                  const priorityCfg = t ? TICKET_PRIORITY_CONFIG[t.priority_category] : null;

                  return (
                    <div
                      key={call.id || idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 14,
                        background: isDark ? '#0f172a' : '#f8fafc',
                        border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: priorityCfg?.color || '#0284c7',
                            fontFamily: 'monospace'
                          }}>
                            {t?.ticket_number || '---'}
                          </span>
                          {priorityCfg && (
                            <Tag color={priorityCfg.color} style={{ borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              {priorityCfg.prefix}
                            </Tag>
                          )}
                        </div>
                        <Text style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }}>
                          {r?.name || 'Guichê'}
                        </Text>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <Tag color="default" style={{ borderRadius: 6, fontSize: 11 }}>
                          {dayjs(call.routed_at).format('HH:mm')}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                          {call.action_type === 'counter_call' ? 'Guichê' : (call.action_type === 'doctor_call' ? 'Médico' : 'Triagem')}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default WaitingRoomTvView;
