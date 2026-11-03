import type { ComponentPropsWithoutRef } from 'react';

/** Shared horizontal frame. Header, footer and page sections use the same tokens. */
export function PageContainer({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`page-container ${className}`} {...props} />;
}

/** Forms keep a readable inner measure inside the shared page frame. */
export function FormContainer({ children, className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <PageContainer className={`w-full ${className}`} {...props}><div className="w-full">{children}</div></PageContainer>;
}
