import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { App as AntdApp } from 'antd';
import { LandingPage } from './pages/LandingPage';

export function App() {
  return (
    <ThemeProvider initialMode="dark">
      <AntdApp>
        <LandingPage />
      </AntdApp>
    </ThemeProvider>
  );
}

export default App;
