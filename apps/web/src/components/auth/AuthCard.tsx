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
  Activity,
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
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('test@courtmate.com');
  const [loginPassword, setLoginPassword] = useState('Password123');
  
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
    window.history.replaceState(null, '', newMode === 'login' ? '/login' : '/register');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(loginEmail, loginPassword);
      router.push('/tournaments');
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
      router.push('/tournaments');
    } catch (err: any) {
      setError(err.message || 'Đăng ký tài khoản không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email: string) => {
    setLoading(true);
    try {
      await login(email, 'Password123');
      router.push('/tournaments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      
      {/* Header Logo */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
          <div className="w-12 h-12 rounded-2xl bg-[#1E5AA8] flex items-center justify-center text-white shadow-lg shadow-[#1E5AA8]/25 group-hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="font-black text-3xl tracking-tight text-[#101828]">
            Court<span className="text-[#1E5AA8]">Mate</span>
          </span>
        </Link>
        <p className="text-sm font-medium text-[#475467]">
          Nền tảng kết nối đối thủ & giải đấu thể thao số 1
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/80 shadow-[0_32px_80px_rgba(0,0,0,0.08)] relative overflow-hidden">
        
        {/* Sliding Tab Indicator */}
        <div className="relative bg-[#F2F4F7] p-1 rounded-full flex items-center mb-6">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${
              mode === 'register' ? 'left-[calc(50%+2px)]' : 'left-1'
            }`}
          />
          <button
            type="button"
            onClick={() => handleToggleMode('login')}
            className={`relative z-10 w-1/2 py-2 rounded-full text-sm font-bold transition-colors text-center ${
              mode === 'login' ? 'text-[#101828]' : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('register')}
            className={`relative z-10 w-1/2 py-2 rounded-full text-sm font-bold transition-colors text-center ${
              mode === 'register' ? 'text-[#101828]' : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
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
                <label className="block text-xs font-bold text-[#101828] mb-1.5 uppercase tracking-wider">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-[#F8FAFC] border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-[#101828] font-medium transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  <Link href="#" className="text-xs text-[#1E5AA8] hover:underline font-semibold">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 text-sm bg-[#F8FAFC] border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-[#101828] font-medium transition-all"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoginSubmit}
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1E5AA8] hover:bg-[#154687] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'}</span>
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
                <label className="block text-xs font-bold text-[#101828] mb-1.5 uppercase tracking-wider">
                  Bạn tham gia CourtMate với vai trò gì?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.PLAYER)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === UserRole.PLAYER
                        ? 'border-[#1E5AA8] bg-[#1E5AA8]/5 text-[#1E5AA8]'
                        : 'border-slate-200 bg-[#F8FAFC] text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 mb-0.5" />
                    <span>Vận Động Viên</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.ORGANIZER)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === UserRole.ORGANIZER
                        ? 'border-[#1E5AA8] bg-[#1E5AA8]/5 text-[#1E5AA8]'
                        : 'border-slate-200 bg-[#F8FAFC] text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Activity className="w-5 h-5 mb-0.5" />
                    <span>Ban Tổ Chức</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5 uppercase tracking-wider">
                  Họ và Tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-[#F8FAFC] border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-[#101828] font-medium transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-[#101828] font-medium"
                      placeholder="name@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5 uppercase tracking-wider">
                    Số Điện Thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-[#101828] font-medium"
                      placeholder="0905 123 456"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5 uppercase tracking-wider">
                    Mật Khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-[#101828] font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1.5 uppercase tracking-wider">
                    Nhập Lại Mật Khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-[#101828] font-medium"
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
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1E5AA8] hover:bg-[#154687] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                <span>{loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}</span>
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
          <span className="relative bg-white px-3 text-[11px] font-bold text-[#475467] uppercase tracking-wider">
            {mode === 'login' ? 'Hoặc đăng nhập với' : 'Hoặc đăng ký nhanh với'}
          </span>
        </div>

        {/* Real Google OAuth Login Button */}
        <GoogleLoginButton
          text={mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google'}
          redirectTo="/tournaments"
        />

        {/* Quick Demo Login Option */}
        {mode === 'login' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('tien.nguyen@courtmate.com')}
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-[#F2F4F7] hover:bg-slate-200 text-[#101828] font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Vào vai Người chơi (Tiến Nguyễn)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vbf.danang@courtmate.vn')}
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-[#F2F4F7] hover:bg-slate-200 text-[#101828] font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Activity className="w-4 h-4 text-amber-600" />
              <span>Vào vai BTC Cầu lông (Liên đoàn VBF)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
