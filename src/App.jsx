import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { App as AntdApp, Modal } from 'antd';
import { LandingPage } from './pages/LandingPage';

export function App() {
  const [modalState, setModalState] = useState({ open: false, title: '', content: '' });

  const handleNavigateAdmin = () => {
    setModalState({
      open: true,
      title: 'Acesso ao Painel Selene',
      content: 'A Landing Page agora está rodando de forma independente no Cosmic. Para acessar o painel administrativo completo, utilize o frontend Selene na porta 5173.'
    });
  };

  const handleOpenLogin = () => {
    setModalState({
      open: true,
      title: 'Autenticação Cosmic',
      content: 'O módulo de login está integrado ao ambiente corporativo Selene.'
    });
  };

  return (
    <ThemeProvider initialMode="dark">
      <AntdApp>
        <LandingPage 
          onNavigateToAdmin={handleNavigateAdmin} 
          onOpenLogin={handleOpenLogin} 
        />
        <Modal
          title={modalState.title}
          open={modalState.open}
          onOk={() => setModalState(prev => ({ ...prev, open: false }))}
          onCancel={() => setModalState(prev => ({ ...prev, open: false }))}
          okText="Entendido"
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          <p>{modalState.content}</p>
        </Modal>
      </AntdApp>
    </ThemeProvider>
  );
}

export default App;
