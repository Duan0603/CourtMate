'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { AuthDialog } from '../auth/AuthDialog';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FeedbackFloatingBubble } from '../feedback/FeedbackFloatingBubble';

import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@courtmate/shared';

/**
 * Renders the single unified global Navbar and Footer across all pages.
 * Excludes auth pages (/login, /register) which use full-screen layout.
 * Excludes admin & organizer accounts so they only see their dedicated dashboard & statistics.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Pages that skip global Navbar & Footer
  const noLayoutRoutes = ['/login', '/register'];
  const isNoLayout = noLayoutRoutes.includes(pathname);

  // On management dashboard routes (/admin, /organizer), hide consumer Navbar & Footer
  // so admins and organizers only see their dedicated dashboard & statistics.
  const hideHeader = pathname.startsWith('/admin') || pathname.startsWith('/organizer');

  if (isNoLayout) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ duration: 4000, className: 'cm-toast', style: { borderRadius: 'var(--cm-radius-control)', boxShadow: 'var(--cm-shadow-elevated)' } }} />
        {children}
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, className: 'cm-toast', style: { borderRadius: 'var(--cm-radius-control)', boxShadow: 'var(--cm-shadow-elevated)' } }} />
      {!hideHeader && <Navbar />}
      <AuthDialog />
      <main className={`site-main flex-1 flex flex-col ${hideHeader ? '!pt-0' : ''}`}>{children}</main>
      {!hideHeader && <Footer />}
      {!hideHeader && <FeedbackFloatingBubble />}
    </>
  );
}

