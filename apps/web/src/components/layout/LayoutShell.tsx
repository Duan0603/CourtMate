'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Renders the single unified global Navbar and Footer across all pages.
 * Excludes auth pages (/login, /register) which use full-screen layout.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that skip global Navbar & Footer
  const noLayoutRoutes = ['/login', '/register'];
  const isNoLayout = noLayoutRoutes.includes(pathname);

  if (isNoLayout) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar />
      <main className="flex-1 flex flex-col pt-[72px]">{children}</main>
      <Footer />
    </>
  );
}

