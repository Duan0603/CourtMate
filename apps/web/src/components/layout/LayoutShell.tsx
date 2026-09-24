'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Renders the global Navbar and Footer for internal app pages.
 * Landing page ("/") is self-contained and manages its own chrome.
 * Auth pages (login, register) are full-screen with no chrome.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that fully manage their own layout (no shared navbar/footer)
  const selfManagedRoutes = ['/', '/login', '/register'];
  const isSelfManaged = selfManagedRoutes.includes(pathname);

  if (isSelfManaged) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-[72px]">{children}</main>
      <Footer />
    </>
  );
}
