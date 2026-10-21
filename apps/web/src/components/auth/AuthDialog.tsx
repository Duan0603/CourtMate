'use client';
import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthCard } from './AuthCard';

type Mode = 'login' | 'register';
export function AuthDialog({ routeMode }: { routeMode?: Mode }) {
  const [mode, setMode] = useState<Mode | null>(null);
  useEffect(() => { if (routeMode) setMode(routeMode); }, [routeMode]);
  const [destination, setDestination] = useState<string>();
  const pathname = usePathname(); const router = useRouter();
  const success = (role?: string) => {
    setMode(null);
    const requested = destination || (routeMode ? new URLSearchParams(window.location.search).get('redirect') : null);
    if (requested?.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\')) {
      router.push(requested);
    } else if (role === 'ORGANIZER') {
      router.push('/organizer');
    } else if (role === 'SUPER_ADMIN' || role === 'REGIONAL_ADMIN') {
      router.push('/admin');
    } else if (routeMode) {
      router.push('/tournaments');
    }
  };
  const close = () => { setMode(null); if (routeMode) router.push('/'); };
  useEffect(() => {
    if (routeMode) return;
    const open = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest('a[href]');
      if (!link || link.getAttribute('target') === '_blank') return;
      const url = new URL(link.getAttribute('href')!, window.location.href);
      if (url.origin !== window.location.origin || !['/login','/register'].includes(url.pathname)) return;
      event.preventDefault(); event.stopPropagation();
      setDestination(url.searchParams.get('redirect') || undefined);
      setMode(url.pathname === '/register' ? 'register' : 'login');
    };
    const openRequested = (event: Event) => { const detail = (event as CustomEvent<{ mode?: Mode; redirect?: string }>).detail; setDestination(detail?.redirect); setMode(detail?.mode || 'login'); };
    window.addEventListener('courtmate:open-auth', openRequested);
    document.addEventListener('click', open, true);
    return () => { document.removeEventListener('click', open, true); window.removeEventListener('courtmate:open-auth', openRequested); };
  }, [routeMode]);
  useEffect(() => { if (!routeMode) setMode(null); }, [pathname, routeMode]);
  return <Modal open={!!mode} onCancel={close} footer={null} centered width={866} destroyOnClose className="cm-auth-modal" wrapClassName="cm-auth-wrap" closeIcon={<X size={20}/>} title={<span className="sr-only">Tài khoản CourtMate</span>} styles={{ content: {padding:0, background:'transparent', border:0, boxShadow:'none'}, body:{overflow:'hidden',padding:0}, mask:{background:'rgba(17,17,17,.55)'} }}>
    {mode && <AuthCard key={mode} initialMode={mode} destination={destination} onSuccess={success}/>}
  </Modal>;
}
