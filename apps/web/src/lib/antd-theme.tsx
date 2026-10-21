'use client';

import React from 'react';
import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1E5AA8',
    colorLink: '#1E5AA8',
    colorPrimaryHover: '#154687',
    colorText: '#101828',
    colorTextSecondary: '#475467',
    colorBgLayout: '#f3f7fb',
    colorBgContainer: '#ffffff',
    colorBorder: '#d6e1ed',
    colorSuccess: '#15803d',
    colorWarning: '#a16207',
    colorError: '#be123c',
    colorInfo: '#1e5aa8',
    borderRadius: 12,
    borderRadiusSM: 8,
    borderRadiusLG: 28,
    controlHeight: 44,
    controlHeightLG: 48,
    fontSize: 14,
    fontSizeLG: 16,
    boxShadow: 'var(--cm-shadow-card)',
    boxShadowSecondary: 'var(--cm-shadow-elevated)',
    motionDurationFast: '0.1s',
    motionDurationMid: '0.16s',
    motionDurationSlow: '0.2s',
    fontFamily: 'var(--font-inter), sans-serif',
  },
  components: {
    Button: {
      controlHeight: 44,
      fontWeight: 600,
      primaryShadow: 'var(--cm-shadow-interactive)',
      defaultShadow: 'var(--cm-shadow-subtle)',
      dangerShadow: 'var(--cm-shadow-subtle)',
    },
    Input: {
      controlHeight: 48,
      inputFontSize: 16,
    },
    Select: {
      controlHeight: 48,
    },
    Card: { borderRadiusLG: 28, boxShadowTertiary: 'var(--cm-shadow-card)' },
    Modal: { borderRadiusLG: 36, titleFontSize: 20 },
    Dropdown: { borderRadiusLG: 12 },
    Popover: { borderRadiusLG: 12 },
    Table: { headerBg: '#edf3f9', headerColor: '#475467', rowHoverBg: '#f3f7fb', borderColor: '#d6e1ed' },
    Tabs: { itemColor: '#475467', itemSelectedColor: '#1e5aa8', inkBarColor: '#1e5aa8' },
    Pagination: { borderRadius: 8 },
    Alert: { borderRadiusLG: 12 },
    Notification: { borderRadiusLG: 28 },
  },
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider layer>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
