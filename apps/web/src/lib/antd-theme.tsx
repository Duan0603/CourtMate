'use client';

import React from 'react';
import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1E5AA8',
    colorLink: '#1E5AA8',
    borderRadius: 12,
    fontFamily: 'var(--font-inter), sans-serif',
  },
  components: {
    Button: {
      controlHeight: 40,
      fontWeight: 600,
    },
    Input: {
      controlHeight: 40,
    },
    Select: {
      controlHeight: 40,
    },
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
