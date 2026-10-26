import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import ptBR from 'antd/locale/pt_BR';

const ThemeContext = createContext({
  themeMode: 'dark',
  isDark: true,
  toggleTheme: () => { },
  setThemeMode: () => { }
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, initialMode = 'dark' }) => {
  const [themeMode, setThemeMode] = useState(initialMode);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = themeMode === 'dark';

  const antTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: isDark
      ? {
        colorPrimary: '#38bdf8',
        colorBgBase: '#080d1a',
        colorBgContainer: 'rgba(26, 35, 56, 0.85)',
        colorBgElevated: '#1a2338',
        colorBorder: 'rgba(255, 255, 255, 0.1)',
        colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
        colorText: '#f8fafc',
        colorTextSecondary: '#94a3b8',
        borderRadius: 10,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }
      : {
        colorPrimary: '#0284c7',
        colorBgBase: '#EFDFD2',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBorder: '#cbd5e1',
        colorBorderSecondary: '#e2e8f0',
        colorText: '#0f172a',
        colorTextSecondary: '#475569',
        borderRadius: 10,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
    components: {
      Layout: {
        bodyBg: 'transparent',
        headerBg: 'transparent',
        siderBg: 'transparent'
      },
      Menu: isDark
        ? {
          itemBg: 'transparent',
          subMenuItemBg: 'transparent',
          itemColor: '#cbd5e1',
          itemHoverColor: '#ffffff',
          itemHoverBg: 'rgba(56, 189, 248, 0.1)',
          itemSelectedColor: '#ffffff',
          itemSelectedBg: '#1d4ed8',
          itemBorderRadius: 8
        }
        : {
          itemBg: 'transparent',
          subMenuItemBg: 'transparent',
          itemColor: '#1e293b',
          itemHoverColor: '#0f172a',
          itemHoverBg: 'rgba(0, 0, 0, 0.06)',
          itemSelectedColor: '#ffffff',
          itemSelectedBg: '#0284c7',
          itemBorderRadius: 8
        },
      Table: isDark
        ? {
          headerBg: '#151c2e',
          headerColor: '#f8fafc',
          rowHoverBg: 'rgba(56, 189, 248, 0.12)',
          colorBgContainer: 'rgba(26, 35, 56, 0.85)'
        }
        : {
          headerBg: '#f1f5f9',
          headerColor: '#0f172a',
          rowHoverBg: '#f0f9ff',
          colorBgContainer: '#ffffff'
        },
      Card: {
        colorBgContainer: isDark ? 'rgba(26, 35, 56, 0.85)' : '#ffffff'
      },
      Modal: {
        contentBg: isDark ? '#1a2338' : '#ffffff',
        headerBg: isDark ? '#1a2338' : '#ffffff'
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, toggleTheme, setThemeMode }}>
      <ConfigProvider locale={ptBR} theme={antTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
