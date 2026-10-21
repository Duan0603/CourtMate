'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Ticket,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@courtmate/shared';
import { NotificationBell } from '../notifications/NotificationBell';
import { getSocket } from '../../lib/socket';

export { NotificationBell };

export function ChatIcon({ isTransparent = false }: { isTransparent?: boolean } = {}) {
  const { user, token, isAuthenticated } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const pathname = usePathname();
  const userId = user?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setUnreadChatCount(0);
      return;
    }

    const socket = getSocket();
    // The chat page shows its own per-conversation badges
    const onChatPage = () => window.location.pathname.startsWith('/chat');
    if (onChatPage()) setUnreadChatCount(0);

    // Ask the server for conversations (with unread counts) on every (re)connect / navigation
    const refresh = () => socket.emit('register_user', {});

    const handleRecentChats = (chats: { unreadCount?: number }[]) => {
      if (onChatPage()) return;
      setUnreadChatCount(chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0));
    };

    const handleNewMessage = (msg: { senderId: string }) => {
      if (msg.senderId === userId || onChatPage()) return;
      setUnreadChatCount((prev) => prev + 1);
    };

    socket.on('connect', refresh);
    socket.on('recent_chats', handleRecentChats);
    socket.on('new_message_notification', handleNewMessage);
    if (socket.connected) refresh();

    return () => {
      socket.off('connect', refresh);
      socket.off('recent_chats', handleRecentChats);
      socket.off('new_message_notification', handleNewMessage);
    };
    // `token`: a new token means getSocket() builds a new socket, so listeners must move to it
  }, [isAuthenticated, userId, token, pathname]);



  return (
    <Link
      href="/chat"
      onClick={() => setUnreadChatCount(0)}
      className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        isTransparent ? 'hover:bg-white/15' : 'hover:bg-primary/10'
      }`}
      aria-label="Tin nhắn"
    >
      <MessageCircle
        className={`w-5 h-5 transition-colors duration-300 ${
          isTransparent ? 'text-white' : 'text-primary'
        }`}
      />
      {unreadChatCount > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
          {unreadChatCount > 9 ? '9+' : unreadChatCount}
        </span>
      )}
    </Link>
  );
}

export function UserAvatar({
  user,
  logout,
  switchRole,
  isTransparent = false,
}: {
  user: any;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isTransparent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabel =
    user.role === UserRole.ORGANIZER
      ? 'Ban tổ chức'
      : user.role === UserRole.SUPER_ADMIN
      ? 'Quản trị viên'
      : 'Vận động viên';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`cm-button flex items-center gap-2 p-1 rounded-full transition-all duration-300 border group ${
          isTransparent
            ? 'border-white/30 hover:bg-white/15 text-white'
            : 'border-slate-200/60 hover:bg-slate-100 text-ink'
        }`}
        aria-label="Tài khoản"
        aria-expanded={open}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        {/* Avatar with online status dot */}
        <div className="relative">
          <img
            src={
              user.avatarUrl ||
              user.preferences?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=1E5AA8&color=ffffff&size=128&bold=true`
            }
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
          />
          {/* Online status dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
        </div>
        <span
          className={`hidden xl:inline text-sm font-bold max-w-[110px] truncate pr-0.5 transition-colors duration-300 ${
            isTransparent ? 'text-white' : 'text-ink'
          }`}
        >
          {user.name}
        </span>
        <ChevronDown
          className={`hidden xl:block w-3.5 h-3.5 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } ${isTransparent ? 'text-white/80' : 'text-muted'}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-slate-200/80 py-2 z-50 animate-fadeIn">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={
                    user.avatarUrl ||
                    user.preferences?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=1E5AA8&color=ffffff&size=128&bold=true`
                  }
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-ink truncate">{user.name}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {roleLabel}
            </div>
          </div>

          {/* Nav links */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors font-medium"
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              Hồ sơ cá nhân
            </Link>

            {user.role === UserRole.PLAYER && (
              <Link
                href="/ticket/tour-1"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors font-medium"
              >
                <Ticket className="w-4 h-4 shrink-0" />
                Vé điện tử
              </Link>
            )}

            {user.role === UserRole.ORGANIZER && (
              <Link
                href="/organizer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors font-medium"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                Bảng quản lý giải
              </Link>
            )}

            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.REGIONAL_ADMIN) && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors font-medium"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Quản trị viên
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="cm-button w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-bold"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN NAVBAR ─────────────────────────────────────────────────────────────
export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 4 standard navigation links in exact order
  const navLinks = [
    { href: '/tournaments', label: 'Giải đấu' },
    { href: '/matches', label: 'Giao lưu' },
    { href: '/coaches', label: 'Huấn luyện viên' },
    { href: '/about', label: 'Về chúng tôi' },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(currentScrollY > 15);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    setIsScrolled(currentScrollY > 15);
  }, [pathname]);

  // Transparent only when on Home page and at the very top (scrollY <= 15)
  // For all other pages without Hero Section, keep header easily readable (white solid mode)
  const hasHeroSection = pathname === '/';
  const isTransparent = hasHeroSection && !isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 h-[var(--header-height)] transition-all duration-300 ease-in-out ${
          isTransparent
            ? 'bg-transparent text-primary'
            : 'bg-white/95 backdrop-blur-md text-primary shadow-elevated border-b border-slate-200/80'
        }`}
      >
        <div className="page-container h-full flex items-center justify-between gap-4">
          {/* ─── LEFT: Logo ─── */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group focus:outline-none"
            aria-label="CourtMate Trang chủ"
          >
            <img
              src="/courtMate_logo.png"
              alt="CourtMate"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span
              className={`text-lg sm:text-xl font-black tracking-tight transition-colors duration-300 inline ${
                'text-ink'
              }`}
            >
              Court<span className="text-primary">Mate</span>
            </span>
          </Link>

          {/* ─── RIGHT: CN#1-CN#4 Menu Links + 🔔 + 💬 + TK ▽ ─── */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
            {/* CN#1, CN#2, CN#3, CN#4 (Desktop ≥ lg) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-[#1E5AA8]/15 text-[#1E5AA8] font-bold'
                        : 'text-[#1E5AA8]/85 hover:text-[#1E5AA8] hover:bg-[#1E5AA8]/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Icons & Account: 🔔 💬 TK ▽ */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Authenticated Controls: Notifications & Chat */}
              {isAuthenticated && user && (
                <>
                  <NotificationBell isTransparent={false} />
                  <ChatIcon isTransparent={false} />
                </>
              )}

              {/* TK ▽: User Avatar & Dropdown or Login CTA */}
              {isAuthenticated && user ? (
                <UserAvatar
                  user={user}
                  logout={logout}
                  switchRole={switchRole}
                  isTransparent={false}
                />
              ) : (
                <Link
                  href="/login"
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ${
                    isTransparent
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-[#1E5AA8] text-white hover:bg-[#154687] shadow-[#1E5AA8]/20'
                  }`}
                >
                  Đăng nhập
                </Link>
              )}

              {/* Mobile Nav Toggle Trigger */}
              <button
                className={`p-2 rounded-xl lg:hidden transition-all duration-300 border ${
                  isTransparent
                    ? 'text-primary bg-primary-soft hover:bg-surface-dim border-surface-border'
                    : 'text-[#1E5AA8] bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER (Below Header) ─── */}
      {mobileMenuOpen && (
        <div className="fixed top-[var(--header-height)] inset-x-4 max-w-[var(--page-max-width)] mx-auto bg-white/95 backdrop-blur-xl rounded-2xl p-5 z-40 flex flex-col gap-4 font-medium shadow-2xl border border-slate-200/80 lg:hidden animate-fadeIn">
          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-ink hover:bg-slate-50 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Mobile Auth Area */}
          {isAuthenticated && user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        user.avatarUrl ||
                        user.preferences?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=1E5AA8&color=ffffff&size=128&bold=true`
                      }
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-ink truncate max-w-[160px]">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChatIcon />
                  <NotificationBell isMobile />
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-2 text-sm text-muted hover:text-primary font-semibold"
                >
                  <UserIcon className="w-4 h-4" /> Hồ sơ cá nhân
                </Link>
                {user.role === UserRole.ORGANIZER && (
                  <Link
                    href="/organizer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2 py-2 text-sm text-muted hover:text-primary font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Bảng quản lý giải
                  </Link>
                )}
                {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.REGIONAL_ADMIN) && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2 py-2 text-sm text-muted hover:text-primary font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4" /> Quản trị viên
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="cm-button flex items-center gap-2.5 px-2 py-2 text-sm text-rose-600 font-bold pt-2 border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-primary text-white text-center py-3 rounded-full font-bold text-sm shadow-md hover:bg-primary-dark transition-all"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </>
  );
};
