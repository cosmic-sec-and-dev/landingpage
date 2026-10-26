import React, { useState, useEffect, useRef } from 'react';
import { Typography, Tag, Tooltip } from 'antd';
import { 
  MinusOutlined, 
  BorderOutlined, 
  CloseOutlined, 
  SoundOutlined, 
  SafetyOutlined, 
  WifiOutlined,
  PoweroffOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export function WindowsXPDesktop() {
  const [windowState, setWindowState] = useState('open'); // 'open' | 'minimized' | 'closed'
  const [isMaximized, setIsMaximized] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState('platformer'); // 'platformer' | 'arcade'
  const [currentTime, setCurrentTime] = useState(new Date());
  const desktopRef = useRef(null);

  // Relógio do Sistema (Data e Hora em tempo real)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fechar Menu Iniciar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (isStartOpen && !event.target.closest('#xp-start-menu') && !event.target.closest('#xp-start-button')) {
        setIsStartOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStartOpen]);

  const timeString = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const shortDateString = currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const gameTitles = {
    platformer: '2D Platformer Demo (Godot 4)',
    arcade: 'Cosmic Retro Arcade (Space Defender & Campo Minado)'
  };

  const gameSources = {
    platformer: '/minigame/index.html',
    arcade: '/game/index.html'
  };

  const handleTaskbarTabClick = () => {
    if (windowState === 'open') {
      setWindowState('minimized');
    } else {
      setWindowState('open');
    }
  };

  const openGame = (gameKey) => {
    setCurrentGame(gameKey);
    setWindowState('open');
    setIsStartOpen(false);
  };

  return (
    <div id="xp-arcade-section" style={{ width: '100%', margin: '0 auto' }}>
      {/* CARD ESTILO WINDOWS XP DESKTOP */}
      <div 
        ref={desktopRef}
        style={{
          width: '100%',
          height: '660px',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          background: '#0a246a'
        }}
      >
        {/* ÁREA DE TRABALHO COM PAPEL DE PAREDE BLISS */}
        <div 
          style={{
            flex: 1,
            position: 'relative',
            backgroundImage: `url('/images/bliss.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            overflow: 'hidden',
            padding: '20px'
          }}
          onClick={() => {
            if (isStartOpen) setIsStartOpen(false);
          }}
        >
          {/* ÍCONES NA ÁREA DE TRABALHO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '96px', zIndex: 1, position: 'relative' }}>
            {/* Ícone: 2D Platformer Game */}
            <div 
              onClick={() => openGame('platformer')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '6px 4px',
                borderRadius: '4px',
                transition: 'background 0.2s',
                background: windowState === 'open' && currentGame === 'platformer' ? 'rgba(49, 106, 197, 0.5)' : 'transparent',
                border: windowState === 'open' && currentGame === 'platformer' ? '1px dotted #ffffff' : '1px solid transparent'
              }}
            >
              <div style={{ fontSize: '34px', filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.8))' }}>
                🎮
              </div>
              <span style={{
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                marginTop: '4px',
                textShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000',
                lineHeight: 1.2
              }}>
                2D Platformer
              </span>
            </div>

            {/* Ícone: Cosmic Retro Arcade */}
            <div 
              onClick={() => openGame('arcade')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '6px 4px',
                borderRadius: '4px',
                transition: 'background 0.2s',
                background: windowState === 'open' && currentGame === 'arcade' ? 'rgba(49, 106, 197, 0.5)' : 'transparent',
                border: windowState === 'open' && currentGame === 'arcade' ? '1px dotted #ffffff' : '1px solid transparent'
              }}
            >
              <div style={{ fontSize: '34px', filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.8))' }}>
                🕹️
              </div>
              <span style={{
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                marginTop: '4px',
                textShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000',
                lineHeight: 1.2
              }}>
                Retro Arcade
              </span>
            </div>

            {/* Ícone: Meu Computador */}
            <div 
              onClick={() => openGame('platformer')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '6px 4px',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontSize: '34px', filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.8))' }}>
                💻
              </div>
              <span style={{
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                marginTop: '4px',
                textShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000',
                lineHeight: 1.2
              }}>
                Meu Computador
              </span>
            </div>

            {/* Ícone: Lixeira */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '6px 4px',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontSize: '34px', filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.8))' }}>
                🗑️
              </div>
              <span style={{
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                marginTop: '4px',
                textShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000',
                lineHeight: 1.2
              }}>
                Lixeira
              </span>
            </div>
          </div>

          {/* JANELA DO WINDOWS XP COM O JOGO EM IFRAME */}
          {windowState !== 'closed' && (
            <div 
              style={{
                position: 'absolute',
                top: isMaximized ? '0' : '10px',
                left: isMaximized ? '0' : '110px',
                right: isMaximized ? '0' : '12px',
                bottom: isMaximized ? '0' : '12px',
                maxWidth: isMaximized ? '100%' : '920px',
                maxHeight: isMaximized ? '100%' : '580px',
                margin: isMaximized ? '0' : 'auto',
                display: windowState === 'minimized' ? 'none' : 'flex',
                flexDirection: 'column',
                background: '#ece9d8',
                borderRadius: isMaximized ? '0' : '8px 8px 0 0',
                boxShadow: isMaximized ? 'none' : '0 16px 40px rgba(0,0,0,0.7), 0 0 0 3px #0055ea',
                border: '3px solid #0055ea',
                zIndex: 10,
                transition: 'all 0.15s ease-out'
              }}
            >
              {/* BARRA DE TÍTULO LUNA BLUE */}
              <div 
                style={{
                  height: '32px',
                  background: 'linear-gradient(180deg, #0058ee 0%, #3593ff 8%, #288eff 18%, #0060ff 35%, #0055ea 70%, #0045cb 100%)',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: isMaximized ? '0' : '5px 5px 0 0',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  cursor: 'default'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{currentGame === 'platformer' ? '🎮' : '🕹️'}</span>
                  <span>{gameTitles[currentGame]}</span>
                </div>

                {/* BOTÕES DE CONTROLE DA JANELA */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {/* Minimizar */}
                  <button 
                    onClick={() => setWindowState('minimized')}
                    style={{
                      width: '22px',
                      height: '22px',
                      background: 'linear-gradient(180deg, #3c82f6 0%, #1e40af 100%)',
                      border: '1px solid #ffffff',
                      borderRadius: '3px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                      padding: 0
                    }}
                    title="Minimizar"
                  >
                    <MinusOutlined style={{ fontSize: '10px' }} />
                  </button>

                  {/* Maximizar / Restaurar */}
                  <button 
                    onClick={() => setIsMaximized(!isMaximized)}
                    style={{
                      width: '22px',
                      height: '22px',
                      background: 'linear-gradient(180deg, #3c82f6 0%, #1e40af 100%)',
                      border: '1px solid #ffffff',
                      borderRadius: '3px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                      padding: 0
                    }}
                    title={isMaximized ? "Restaurar" : "Maximizar"}
                  >
                    {isMaximized ? <FullscreenExitOutlined style={{ fontSize: '11px' }} /> : <BorderOutlined style={{ fontSize: '10px' }} />}
                  </button>

                  {/* Fechar */}
                  <button 
                    onClick={() => setWindowState('closed')}
                    style={{
                      width: '22px',
                      height: '22px',
                      background: 'linear-gradient(180deg, #f87171 0%, #dc2626 40%, #991b1b 100%)',
                      border: '1px solid #ffffff',
                      borderRadius: '3px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                      padding: 0
                    }}
                    title="Fechar"
                  >
                    <CloseOutlined style={{ fontSize: '11px', fontWeight: 900 }} />
                  </button>
                </div>
              </div>

              {/* MENU SUPERIOR DA JANELA (XP Style com Seletor de Jogo) */}
              <div 
                style={{
                  height: '26px',
                  background: '#ece9d8',
                  borderBottom: '1px solid #d8d2bd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 8px',
                  fontSize: '11px',
                  color: '#000000'
                }}
              >
                <div style={{ display: 'flex', gap: '14px' }}>
                  <span style={{ cursor: 'pointer' }}><u>J</u>ogo</span>
                  <span style={{ cursor: 'pointer' }}><u>O</u>pções</span>
                  <span style={{ cursor: 'pointer' }}><u>A</u>juda</span>
                </div>

                {/* Alternador Rápido de Jogos */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setCurrentGame('platformer')}
                    style={{
                      fontSize: '11px',
                      padding: '1px 8px',
                      background: currentGame === 'platformer' ? '#0055ea' : '#ece9d8',
                      color: currentGame === 'platformer' ? '#ffffff' : '#000000',
                      border: '1px solid #7f9db9',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontWeight: currentGame === 'platformer' ? 'bold' : 'normal'
                    }}
                  >
                    🎮 2D Platformer (Godot)
                  </button>
                  <button
                    onClick={() => setCurrentGame('arcade')}
                    style={{
                      fontSize: '11px',
                      padding: '1px 8px',
                      background: currentGame === 'arcade' ? '#0055ea' : '#ece9d8',
                      color: currentGame === 'arcade' ? '#ffffff' : '#000000',
                      border: '1px solid #7f9db9',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontWeight: currentGame === 'arcade' ? 'bold' : 'normal'
                    }}
                  >
                    🕹️ Retro Arcade XP
                  </button>
                </div>
              </div>

              {/* CORPO DA JANELA: O IFRAME DO JOGO */}
              <div style={{ flex: 1, position: 'relative', background: '#000000', overflow: 'hidden' }}>
                <iframe 
                  key={currentGame}
                  src={gameSources[currentGame]}
                  title={gameTitles[currentGame]}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                  allow="fullscreen; cross-origin-isolated; gamepad"
                />
              </div>

              {/* STATUS BAR INFERIOR */}
              <div 
                style={{
                  height: '22px',
                  background: '#ece9d8',
                  borderTop: '1px solid #7f9db9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 8px',
                  fontSize: '11px',
                  color: '#475569'
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span>Status: <strong>Pronto</strong></span>
                  <span>Execução: <strong>WebAssembly &amp; Canvas</strong></span>
                </div>
                <span>Cosmic Sec&amp;Dev • Windows XP Edition</span>
              </div>
            </div>
          )}

          {/* MENU INICIAR (START MENU POPUP) */}
          {isStartOpen && (
            <div 
              id="xp-start-menu"
              style={{
                position: 'absolute',
                bottom: '36px',
                left: '0',
                width: '390px',
                height: '420px',
                background: '#ffffff',
                borderRadius: '8px 8px 0 0',
                border: '2px solid #0055ea',
                boxShadow: '4px -4px 25px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              {/* Cabeçalho do Menu Iniciar */}
              <div 
                style={{
                  height: '56px',
                  background: 'linear-gradient(180deg, #0058ee 0%, #0055ea 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  gap: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '4px',
                  border: '2px solid #ffffff',
                  background: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  👨‍💻
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    Cosmic User
                  </div>
                  <div style={{ color: '#bae6fd', fontSize: '11px' }}>
                    Sec&amp;Dev Administrator
                  </div>
                </div>
              </div>

              {/* Duas Colunas do Menu Iniciar */}
              <div style={{ flex: 1, display: 'flex' }}>
                {/* Coluna Esquerda (Programas) */}
                <div style={{ width: '52%', background: '#ffffff', borderRight: '1px solid #d8d2bd', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div 
                    onClick={() => openGame('platformer')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', cursor: 'pointer', borderRadius: '4px', background: currentGame === 'platformer' ? '#e0f2fe' : 'transparent' }}
                  >
                    <span style={{ fontSize: '22px' }}>🎮</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#000' }}>2D Platformer</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Godot 4 Web Demo</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => openGame('arcade')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', cursor: 'pointer', borderRadius: '4px', background: currentGame === 'arcade' ? '#e0f2fe' : 'transparent' }}
                  >
                    <span style={{ fontSize: '22px' }}>🕹️</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#000' }}>Retro Arcade</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Space &amp; Campo Minado</div>
                    </div>
                  </div>

                  <a 
                    href="https://cosmic-zip.github.io/NettravelerEX/" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', cursor: 'pointer', textDecoration: 'none' }}
                  >
                    <span style={{ fontSize: '22px' }}>🚀</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#000' }}>NettravelerEX</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Purple Team OPSEC</div>
                    </div>
                  </a>

                  <a 
                    href="#suite"
                    onClick={() => setIsStartOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', cursor: 'pointer', textDecoration: 'none' }}
                  >
                    <span style={{ fontSize: '22px' }}>🌘</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#000' }}>Selene Suite</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Plataforma SaaS</div>
                    </div>
                  </a>
                </div>

                {/* Coluna Direita (Atalhos Luna) */}
                <div style={{ width: '48%', background: '#d3e5fa', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#0c3298', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span>📁</span> <span>Meus Documentos</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span>🖼️</span> <span>Minhas Imagens</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span>💻</span> <span>Meu Computador</span>
                  </div>
                  <div style={{ borderTop: '1px solid #b2c9e6', margin: '4px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span>⚙️</span> <span>Painel de Controle</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span>❓</span> <span>Ajuda e Suporte</span>
                  </div>
                </div>
              </div>

              {/* Rodapé do Menu Iniciar */}
              <div 
                style={{
                  height: '42px',
                  background: 'linear-gradient(180deg, #0058ee 0%, #0055ea 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '0 12px',
                  gap: '12px'
                }}
              >
                <button 
                  onClick={() => setIsStartOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <PoweroffOutlined style={{ color: '#ef4444' }} /> Desligar o computador
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BARRA DE TAREFAS CLÁSSICA LUNA */}
        <div 
          style={{
            height: '34px',
            background: 'linear-gradient(180deg, #1f2f86 0%, #3165c4 3%, #3982e5 6%, #316ac5 10%, #245edb 12%, #1952d5 90%, #1040b8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 50,
            borderTop: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 -2px 6px rgba(0,0,0,0.3)'
          }}
        >
          {/* LADO ESQUERDO: BOTÃO INICIAR + JANELA ATIVA */}
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {/* BOTÃO INICIAR VERDE ICÔNICO DO WINDOWS XP */}
            <button
              id="xp-start-button"
              onClick={() => setIsStartOpen(!isStartOpen)}
              style={{
                height: '100%',
                padding: '0 16px 0 10px',
                background: isStartOpen
                  ? 'linear-gradient(180deg, #2b7027 0%, #368a32 50%, #1c521a 100%)'
                  : 'linear-gradient(180deg, #388e3c 0%, #4caf50 30%, #388e3c 60%, #2e7d32 100%)',
                border: 'none',
                borderRadius: '0 10px 10px 0',
                boxShadow: isStartOpen 
                  ? 'inset 2px 2px 4px rgba(0,0,0,0.6)' 
                  : 'inset 0 1px 0 rgba(255,255,255,0.6), 2px 0 6px rgba(0,0,0,0.3)',
                color: '#ffffff',
                fontFamily: 'Franklin Gothic Medium, Tahoma, sans-serif',
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                outline: 'none'
              }}
            >
              {/* Windows XP 4-color Flag Icon */}
              <div style={{ display: 'grid', gridTemplateColumns: '8px 8px', gap: '2px' }}>
                <div style={{ width: '8px', height: '8px', background: '#e53935', borderRadius: '2px 0 0 0' }}></div>
                <div style={{ width: '8px', height: '8px', background: '#43a047', borderRadius: '0 2px 0 0' }}></div>
                <div style={{ width: '8px', height: '8px', background: '#1e88e5', borderRadius: '0 0 0 2px' }}></div>
                <div style={{ width: '8px', height: '8px', background: '#fdd835', borderRadius: '0 0 2px 0' }}></div>
              </div>
              <span style={{ letterSpacing: '0.5px' }}>iniciar</span>
            </button>

            {/* SEPARADOR */}
            <div style={{ width: '12px' }} />

            {/* ABA DA JANELA ATIVA NA BARRA DE TAREFAS */}
            {windowState !== 'closed' && (
              <div 
                onClick={handleTaskbarTabClick}
                style={{
                  height: '26px',
                  minWidth: '180px',
                  maxWidth: '240px',
                  background: windowState === 'open'
                    ? 'linear-gradient(180deg, #18429b 0%, #2056c7 40%, #153c90 100%)'
                    : 'linear-gradient(180deg, #3c80e7 0%, #2668d2 60%, #1952d5 100%)',
                  border: windowState === 'open' ? '1px solid #0f2e6e' : '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '3px',
                  boxShadow: windowState === 'open' 
                    ? 'inset 1px 1px 3px rgba(0,0,0,0.6)' 
                    : 'inset 0 1px 0 rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  gap: '6px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                <span>{currentGame === 'platformer' ? '🎮' : '🕹️'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {gameTitles[currentGame]}
                </span>
              </div>
            )}
          </div>

          {/* LADO DIREITO: BANDEJA DO SISTEMA (SYSTEM TRAY COM RELÓGIO DIGITAL) */}
          <div 
            style={{
              height: '100%',
              background: 'linear-gradient(180deg, #0c3298 0%, #0f45bd 50%, #0a2f91 100%)',
              borderLeft: '1px solid #1449b8',
              boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: '12px',
              color: '#ffffff',
              fontSize: '11px'
            }}
          >
            {/* Ícones da Bandeja */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#bae6fd' }}>
              <SoundOutlined title="Volume: 100%" style={{ fontSize: '12px', cursor: 'pointer' }} />
              <SafetyOutlined title="Proteção de Segurança: Ativa" style={{ fontSize: '12px', cursor: 'pointer' }} />
              <WifiOutlined title="Rede: Conectada" style={{ fontSize: '12px', cursor: 'pointer' }} />
            </div>

            {/* SEPARADOR INSET */}
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)' }} />

            {/* RELÓGIO DIGITAL COM DATA E HORA EM TEMPO REAL */}
            <Tooltip title={`Data do Sistema: ${dateString}`}>
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                  {timeString}
                </span>
                <span style={{ fontSize: '9px', color: '#93c5fd', marginTop: '-2px' }}>
                  {shortDateString}
                </span>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
