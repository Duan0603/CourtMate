'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Trophy,
  Bell,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Ticket,
  Settings,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@courtmate/shared';

import { NotificationBell } from '../notifications/NotificationBell';
import { getSocket } from '../../lib/socket';

export { NotificationBell };

export function ChatIcon() {
  const { user, isAuthenticated } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const socket = getSocket();
    
    const handleNewMessage = (msg: any) => {
      // Ignore if it's from me
      if (msg.senderId === user.id || (msg as any)._id === user.id) return;
      
      // If we are currently on the chat page, assume we read it
      // In a real app we'd check if we are in the exact chat room, but this is a good approximation for UI
      if (window.location.pathname.startsWith('/chat')) {
        return;
      }
      
      setUnreadChatCount(prev => prev + 1);
    };
    
    socket.on('new_message_notification', handleNewMessage);
    
    return () => {
      socket.off('new_message_notification', handleNewMessage);
    };
  }, [isAuthenticated, user]);

  return (
    <Link
      href="/chat"
      onClick={() => setUnreadChatCount(0)}
      className="relative flex items-center justify-center p-2 rounded-full transition-all hover:bg-[#1E5AA8]/10"
      aria-label="Tin nhắn"
    >
      <MessageCircle className="w-5 h-5 text-[#475467]" />
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
}: {
  user: any;
  logout: () => void;
  switchRole: (role: UserRole) => void;
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
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all border border-slate-200/60 group"
        aria-label="Tài khoản"
      >
        {/* Avatar with online status dot */}
        <div className="relative">
          <img
            src={
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=1E5AA8&color=ffffff&size=128&bold=true`
            }
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1E5AA8]/20"
          />
          {/* Online status dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
        </div>
        <span className="hidden xl:inline text-sm font-bold text-[#101828] max-w-[110px] truncate pr-0.5">
          {user.name}
        </span>
        <ChevronDown
          className={`hidden xl:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-200/80 py-2 z-50 animate-fadeIn">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=1E5AA8&color=ffffff&size=128&bold=true`
                  }
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#101828] truncate">{user.name}</p>
                <p className="text-xs text-[#475467] truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E5AA8]" />
              {roleLabel}
            </div>
          </div>

          {/* Nav links */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#475467] hover:bg-slate-50 hover:text-[#1E5AA8] transition-colors font-medium"
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              Hồ sơ cá nhân
            </Link>

            {user.role === UserRole.PLAYER && (
              <Link
                href="/ticket/tour-1"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#475467] hover:bg-slate-50 hover:text-[#1E5AA8] transition-colors font-medium"
              >
                <Ticket className="w-4 h-4 shrink-0" />
                Vé điện tử
              </Link>
            )}

            {user.role === UserRole.ORGANIZER && (
              <Link
                href="/organizer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#475467] hover:bg-slate-50 hover:text-[#1E5AA8] transition-colors font-medium"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                Bảng quản lý giải
              </Link>
            )}

            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.REGIONAL_ADMIN) && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#475467] hover:bg-slate-50 hover:text-[#1E5AA8] transition-colors font-medium"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Quản trị viên
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-bold"
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

  const navLinks = [
    { href: '/tournaments', label: 'Giải đấu' },
    { href: '/about', label: 'Về chúng tôi' },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* ─── LEFT LOGO (Fixed, Independent) ─── */}
      <div className="fixed top-0 left-0 z-50 h-[72px] flex items-center px-6 md:px-10 pointer-events-auto">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight flex items-center gap-1 text-[#101828]"
        >
          <img src="/courtMate_logo.png"
      alt="CourtMate"
      className="h-10 w-auto"/>
          Court<span className="text-[#1E5AA8]">Mate</span>
        </Link>
      </div>

      {/* ─── RIGHT ORGANIC BLOCK (Desktop ≥ lg) ─── */}
      <div className="cm-nav-right">
        {/* Nav Links */}
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`cm-nav-link ${isActive(link.href) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}

        {/* Authenticated → Notification + Avatar */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 ml-2">
            <NotificationBell />
            <ChatIcon />
            <UserAvatar user={user} logout={logout} switchRole={switchRole} />
          </div>
        ) : (
          /* Guest → "Tham gia ngay" CTA */
          <Link
            href="/register"
            className="bg-[#1E5AA8] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#154687] transition-all hover:scale-[1.02] active:scale-[0.99] shadow-md whitespace-nowrap ml-2"
          >
            Tham gia ngay
          </Link>
        )}
      </div>

      {/* ─── MOBILE NAV TRIGGER ─── */}
      <button
        className="fixed top-5 right-5 z-50 lg:hidden pointer-events-auto bg-white p-2.5 rounded-xl shadow-sm border border-slate-200"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ─── MOBILE DRAWER ─── */}
      {mobileMenuOpen && (
        <div className="fixed top-[72px] left-3 right-3 bg-white/95 backdrop-blur-xl rounded-2xl p-5 z-40 flex flex-col gap-4 font-medium shadow-2xl border border-slate-200/80 lg:hidden animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold transition-colors ${
                isActive(link.href) ? 'text-[#1E5AA8]' : 'text-[#101828] hover:text-[#1E5AA8]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-slate-100" />

          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=1E5AA8&color=ffffff&size=128&bold=true`
                    }
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#101828] truncate max-w-[160px]">{user.name}</p>
                  <p className="text-xs text-[#475467]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChatIcon />
                <NotificationBell isMobile />
              </div>
            </div>
          ) : (
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#1E5AA8] text-white text-center py-3 rounded-full font-bold text-sm"
            >
              Tham gia ngay
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm text-[#475467] font-semibold"
              >
                <UserIcon className="w-4 h-4" /> Hồ sơ cá nhân
              </Link>
              <Link
                href="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm text-[#475467] font-semibold"
              >
                <LayoutDashboard className="w-4 h-4" /> Bảng quản lý giải
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="flex items-center gap-2.5 text-sm text-rose-600 font-bold pt-1 border-t border-slate-100"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </>
          )}
        </div>
      )}

    </>
  );
};
