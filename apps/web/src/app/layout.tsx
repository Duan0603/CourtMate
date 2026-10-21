import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdProvider } from '../lib/antd-theme';
import { AuthProvider } from '../context/AuthContext';
import { LoadingProvider } from '../context/LoadingContext';
import { LayoutShell } from '../components/layout/LayoutShell';
import { InitialPreloader, RouteTransitionLoader } from '../components/loading';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CourtMate - Nền tảng kết nối thể thao & giải đấu Việt Nam',
  description: 'Tìm kiếm đối thủ on-demand, tham gia các giải đấu Cầu lông, Pickleball, Tennis và quản lý thi đấu chuyên nghiệp.',
  keywords: ['thể thao', 'cầu lông', 'pickleball', 'tennis', 'giải đấu', 'đặt sân', 'courtmate'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-canvas text-navy">
        <AntdRegistry>
          <AntdProvider>
            <LoadingProvider>
              <InitialPreloader />
              <RouteTransitionLoader />
              <AuthProvider>
                <LayoutShell>{children}</LayoutShell>
              </AuthProvider>
            </LoadingProvider>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
