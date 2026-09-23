'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Conditionally renders the global Navbar and Footer.
 * Pages that have their own layout (e.g. landing page at "/") are excluded.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that manage their own chrome (navbar/footer)
  const selfContainedRoutes = ['/', '/landing'];
  const isSelfContained = selfContainedRoutes.includes(pathname);

  if (isSelfContained) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
