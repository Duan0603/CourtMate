'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleLoginButtonProps {
  text?: string;
  redirectTo?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  text = 'Tiếp tục với Google',
  redirectTo = '/tournaments',
}) => {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [btnRendered, setBtnRendered] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      router.push(redirectTo);
    } catch (err: any) {
      alert(err.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  const renderGoogleButton = () => {
    if (!clientId || !window.google?.accounts?.id || !googleBtnRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear any prior content
      googleBtnRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 340,
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
      });

      setBtnRendered(true);
    } catch (e) {
      console.warn('Google SDK render warning:', e);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderGoogleButton();
    };
    document.body.appendChild(script);

    // Periodic check in case ref mounted slightly after script loaded
    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current && !btnRendered) {
        renderGoogleButton();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [clientId, btnRendered]);

  const handleCustomClick = async () => {
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    setLoading(true);
    try {
      const demoGoogleToken = 'google_demo_id_token_' + Date.now();
      await loginWithGoogle(demoGoogleToken);
      router.push(redirectTo);
    } catch (e: any) {
      alert(e.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Official Google Button container (Always in DOM so ref exists) */}
      <div
        ref={googleBtnRef}
        className={`w-full flex justify-center min-h-[44px] ${btnRendered ? 'block' : 'hidden'}`}
      />

      {/* Fallback Custom Button when official button is loading or client ID not yet active */}
      {!btnRendered && (
        <button
          type="button"
          disabled={loading}
          onClick={handleCustomClick}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-navy font-semibold text-xs transition shadow-xs flex items-center justify-center gap-3 hover:border-slate-300 disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{loading ? 'Đang kết nối Google...' : text}</span>
        </button>
      )}

      {loading && (
        <span className="text-xs text-primary font-medium mt-2 animate-pulse">
          Đang xác thực thông tin tài khoản Google...
        </span>
      )}
    </div>
  );
};
