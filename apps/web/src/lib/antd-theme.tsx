'use client';

import React from 'react';
import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1848FF',
    colorLink: '#1848FF',
    colorPrimaryHover: '#1848ff',
    colorText: '#111111',
    colorTextSecondary: '#111111',
    colorBgLayout: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBorder: '#111111',
    colorSuccess: '#1848ff',
    colorWarning: '#1848ff',
    colorError: '#1848ff',
    colorInfo: '#1848ff',
    colorBgElevated: '#ffffff',
    colorFillAlter: '#ffffff',
    colorFillSecondary: '#8fd9fb',
    colorPrimaryBg: '#8fd9fb',
    colorPrimaryBgHover: '#8fd9fb',
    colorPrimaryText: '#1848ff',
    colorPrimaryBorder: '#111111',
    colorSuccessBg: '#8fd9fb', colorSuccessBorder: '#111111', colorSuccessText: '#111111',
    colorWarningBg: '#d2b48c', colorWarningBorder: '#111111', colorWarningText: '#111111',
    colorErrorBg: '#8fd9fb', colorErrorBorder: '#111111', colorErrorText: '#111111',
    colorInfoBg: '#8fd9fb', colorInfoBorder: '#111111', colorInfoText: '#111111',
    lineWidth: 2,
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 10,
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
      fontWeight: 800,
      primaryShadow: 'var(--cm-shadow-interactive)',
      defaultShadow: 'var(--cm-shadow-subtle)',
      dangerShadow: 'var(--cm-shadow-subtle)',
    },
    Input: {
      controlHeight: 48,
      inputFontSize: 16,
      activeShadow: 'none', activeBorderColor: '#111111', hoverBorderColor: '#111111',
    },
    Select: {
      controlHeight: 48,
    },
    Card: { borderRadiusLG: 10, boxShadowTertiary: 'var(--cm-shadow-card)' },
    Modal: { borderRadiusLG: 14, titleFontSize: 20 },
    Dropdown: { borderRadiusLG: 6 },
    Popover: { borderRadiusLG: 6 },
    Table: { headerBg: '#d2b48c', headerColor: '#111111', rowHoverBg: '#ffffff', borderColor: '#111111' },
    Tabs: { itemColor: '#111111', itemSelectedColor: '#1848ff', inkBarColor: '#1848ff' },
    Pagination: { borderRadius: 8 },
    Alert: { borderRadiusLG: 6 },
    Notification: { borderRadiusLG: 10 },
  },
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider layer>
      <ConfigProvider theme={antdTheme} wave={{ disabled: true }}>
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
