'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  Medal,
} from 'lucide-react';
import { UserRole } from '@courtmate/shared';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';

interface AuthCardProps {
  initialMode?: 'login' | 'register';
}

/* ────────────────────────────────────────────────────────────────────────
 * Registration form redesigned to prioritize Role selection
 * ──────────────────────────────────────────────────────────────────────── */

export const AuthCard: React.FC<AuthCardProps> = ({ initialMode = 'login' }) => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [redirectTo, setRedirectTo] = useState('/tournaments');

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('redirect');
    if (!requested || !requested.startsWith('/') || requested.startsWith('//')) return;
    try {
      const destination = new URL(requested, window.location.origin);
      if (destination.origin === window.location.origin) setRedirectTo(destination.pathname + destination.search + destination.hash);
    } catch { /* Keep the default destination for invalid URLs. */ }
  }, []);

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PLAYER);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode]);

  const handleToggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    window.history.replaceState(null, '', `${newMode === 'login' ? '/login' : '/register'}${redirectTo !== '/tournaments' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(loginEmail, loginPassword);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    if (regPassword.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await register(regEmail, regPassword, regName, role);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Đăng ký tài khoản không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">

      {/* Header Logo */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg  group- transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="font-black text-3xl tracking-tight text-ink">
            Court<span className="text-primary">Mate</span>
          </span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-feature p-6 sm:p-8 border border-slate-200/80 shadow-card relative overflow-hidden">

        {/* Sliding Tab Indicator */}
        <div className="relative bg-surface-dim p-1 rounded-full flex items-center mb-6">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${
              mode === 'register' ? 'left-[calc(50%+2px)]' : 'left-1'
            }`}
          />
          <button
            type="button"
            onClick={() => handleToggleMode('login')}
            className={`cm-button relative z-10 w-1/2 py-2 rounded-full text-sm font-bold transition-colors text-center ${
              mode === 'login' ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('register')}
            className={`cm-button relative z-10 w-1/2 py-2 rounded-full text-sm font-bold transition-colors text-center ${
              mode === 'register' ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            Tạo tài khoản
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Animated Container */}
        <div className="relative overflow-hidden">

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form
              className="space-y-4 animate-fadeIn"
              onSubmit={(e) => { e.preventDefault(); handleLoginSubmit(e); }}
            >
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5  ">
                  Địa chỉ Email <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    id="loginEmail" aria-label="Email đăng nhập" autoComplete="email" value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="cm-control w-full pl-11 pr-4 py-3 text-sm bg-canvas border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-ink  ">
                    Mật khẩu <span className="text-rose-500 font-bold">*</span>
                  </label>

                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="loginPassword" aria-label="Mật khẩu" autoComplete="current-password" value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="cm-control w-full pl-11 pr-16 py-3 text-sm bg-canvas border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition-all"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}
                    className="cm-button absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoginSubmit}
                disabled={loading}
                className="cm-action cm-button w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                <span>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form
              className="space-y-4 animate-fadeIn"
              onSubmit={(e) => { e.preventDefault(); handleRegisterSubmit(e); }}
            >

              {/* Role Toggle (Moved to Top) */}
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5  ">
                  Bạn muốn làm gì? <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.PLAYER)}
                    className={`cm-button py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                      role === UserRole.PLAYER
                        ? 'border-primary bg-primary/5 text-primary shadow-xs'
                        : 'border-slate-200 bg-canvas text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-5 h-5 mb-0.5" />
                    <span>Người chơi</span>
                    <span className="text-[10px] font-normal text-muted">Giao lưu & thi đấu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.ORGANIZER)}
                    className={`cm-button py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                      role === UserRole.ORGANIZER
                        ? 'border-primary bg-primary/5 text-primary shadow-xs'
                        : 'border-slate-200 bg-canvas text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Trophy className="w-5 h-5 mb-0.5" />
                    <span>Ban tổ chức</span>
                    <span className="text-[10px] font-normal text-muted">Tạo & quản lý giải</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5  ">
                  Họ và tên <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    id="regName" aria-label="Họ và tên" autoComplete="name" value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="cm-control w-full pl-11 pr-4 py-3 text-sm bg-canvas border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5  ">
                    Email <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      id="regEmail" aria-label="Email đăng ký" autoComplete="email" value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="cm-control w-full pl-10 pr-3 py-2.5 text-xs bg-canvas border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium"
                      placeholder="name@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5  ">
                    Số Điện Thoại <span className="text-muted font-normal lowercase text-[10px]">(không bắt buộc)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      id="regPhone" aria-label="Số điện thoại" autoComplete="tel" value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="cm-control w-full pl-10 pr-3 py-2.5 text-xs bg-canvas border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium"
                      placeholder="0905 123 456"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5  ">
                    Mật khẩu <span className="text-rose-500 font-bold">*</span> <span className="text-muted font-normal lowercase text-[10px]">(≥ 6 ký tự)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      id="regPassword" aria-label="Mật khẩu mới" autoComplete="new-password" value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="cm-control w-full pl-10 pr-3 py-2.5 text-xs bg-canvas border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5  ">
                    Nhập lại mật khẩu <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="regConfirmPassword" aria-label="Nhập lại mật khẩu" autoComplete="new-password" value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="cm-control w-full pl-10 pr-3 py-2.5 text-xs bg-canvas border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Role Toggle removed from here (Moved to top) */}

              <button
                type="button"
                onClick={handleRegisterSubmit}
                disabled={loading}
                className="cm-action cm-button w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                <span>{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-muted uppercase tracking-wider">
            {mode === 'login' ? 'Hoặc đăng nhập với' : 'Hoặc đăng ký nhanh với'}
          </span>
        </div>

        {/* Real Google OAuth Login Button */}
        <GoogleLoginButton
          text={mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google'}
          redirectTo={redirectTo}
        />



      </div>
    </div>
  );
};
