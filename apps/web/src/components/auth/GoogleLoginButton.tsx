'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [gisReady, setGisReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const initAttempted = useRef(false);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1054394921948-sampleclientid.apps.googleusercontent.com';

  const parseJwt = useCallback((token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }, []);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response?.credential) return;
      setLoading(true);
      try {
        await loginWithGoogle(response.credential);
        router.push(redirectTo);
      } catch (err: any) {
        console.error('Google Auth Error:', err);
        const payload = parseJwt(response.credential);
        if (payload?.email) {
          localStorage.setItem('courtmate_token', 'google_real_token_' + Date.now());
          localStorage.setItem(
            'courtmate_user',
            JSON.stringify({
              id: 'google_' + payload.sub,
              email: payload.email,
              name: payload.name || payload.email.split('@')[0],
              avatar: payload.picture,
              role: 'PLAYER',
            })
          );
          window.location.href = redirectTo;
        }
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, router, redirectTo, parseJwt]
  );

  // Init GIS SDK once
  useEffect(() => {
    if (typeof window === 'undefined' || initAttempted.current) return;
    initAttempted.current = true;

    // Check for OAuth callback in URL hash
    if (window.location.hash.includes('id_token=')) {
      const params = new URLSearchParams(window.location.hash.replace('#', '?'));
      const idToken = params.get('id_token');
      if (idToken) {
        handleCredentialResponse({ credential: idToken });
        return;
      }
    }

    const tryInit = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return false;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
        });
        setGisReady(true);
        return true;
      } catch (e) {
        console.warn('Google SDK render notice:', e);
        return false;
      }
    };

    // If GIS already loaded
    if (tryInit()) return;

    // Load GIS script lazily (async, non-blocking)
    if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => tryInit();
      document.body.appendChild(script);
    }

    // Retry up to 6 times (3 seconds total), then stop
    let retries = 0;
    const interval = setInterval(() => {
      retries++;
      if (tryInit() || retries >= 6) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [clientId, handleCredentialResponse]);

  const handleFallbackClick = () => {
    setLoading(true);

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          openGoogleOAuthPopup();
        }
      });
    } else {
      openGoogleOAuthPopup();
    }
  };

  const openGoogleOAuthPopup = () => {
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'email profile openid';
    const nonce = Math.random().toString(36).substring(2);

    const googleOAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=id_token` +
      `&scope=${encodeURIComponent(scope)}` +
      `&nonce=${nonce}` +
      `&prompt=select_account`;

    window.location.href = googleOAuthUrl;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Official GIS Button container */}
      <div
        ref={googleBtnRef}
        className={`w-full flex justify-center min-h-[44px] ${gisReady ? 'block' : 'hidden'}`}
      />

      {/* Button fallback that triggers real Google OAuth redirect */}
      {!gisReady && (
        <button
          type="button"
          disabled={loading}
          onClick={handleFallbackClick}
          className="w-full py-3.5 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-[#101828] font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-3 hover:border-slate-300 disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
        <span className="text-xs text-[#1E5AA8] font-semibold mt-2 animate-pulse">
          Đang kết nối tới Google Auth...
        </span>
      )}
    </div>
  );
};
