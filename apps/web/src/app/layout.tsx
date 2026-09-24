import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LayoutShell } from '../components/layout/LayoutShell';

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
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-navy">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
