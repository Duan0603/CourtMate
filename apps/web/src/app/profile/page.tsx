'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User as UserIcon, 
  Trophy, 
  Bookmark, 
  Settings, 
  Ticket, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Award,
  Calendar,
  AlertCircle,
  CreditCard,
  RotateCcw,
  Camera,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Activity,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SportType } from '@courtmate/shared';
import { registrationsApi } from '../../lib/registrations.api';
import { tournamentsApi } from '../../lib/tournaments.api';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-tournaments' | 'saved' | 'edit'>('edit');
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [savedTournaments, setSavedTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.preferences?.bio || '');
  const [location, setLocation] = useState(user?.preferences?.location || 'Đà Nẵng');
  const [clubName, setClubName] = useState(user?.preferences?.clubName || '');
  const [skillLevel, setSkillLevel] = useState(user?.preferences?.skillLevel || 'Tự do (Phong trào)');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.preferences?.bio || '');
      setLocation(user.preferences?.location || 'Đà Nẵng');
      setClubName(user.preferences?.clubName || '');
      setSkillLevel(user.preferences?.skillLevel || 'Tự do (Phong trào)');
    }

    async function loadData() {
      setLoading(true);
      try {
        if (user?.id) {
          const regs = await registrationsApi.getMyRegistrations(user.id);
          setMyRegistrations(regs || []);
        } else {
          setMyRegistrations([]);
        }

        const tourRes = await tournamentsApi.getTournaments();
        if (user?.bookmarkedTournaments && user.bookmarkedTournaments.length > 0) {
          const saved = tourRes.data.filter(t => user.bookmarkedTournaments?.includes(t.id));
          setSavedTournaments(saved);
        } else {
          setSavedTournaments([]);
        }
      } catch (e) {
        console.error('Error loading profile data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        name,
        preferences: {
          ...user?.preferences,
          bio,
          location,
          clubName,
          skillLevel,
          sports: user?.preferences?.sports || [SportType.BADMINTON],
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillOptions = [
    'Tự do (Phong trào)',
    'Trung bình - Khá',
    'Bán chuyên',
    'Chuyên nghiệp'
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profile Card - Redesigned */}
        <div className="relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm mb-8">
          {/* Cover Gradient with Name overlay */}
          <div className="h-44 sm:h-52 bg-gradient-to-br from-[#0F3460] via-[#1E5AA8] to-[#3B82F6] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.4),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(30,90,168,0.5),transparent_50%)] pointer-events-none" />
            {/* Decorative icon */}
            <div className="absolute right-8 bottom-4 opacity-[0.06]">
              <Trophy className="w-56 h-56 text-white" />
            </div>
            {/* Name on gradient banner */}
            <div className="absolute bottom-6 left-36 sm:left-44 right-6 pr-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight line-clamp-2 drop-shadow-sm">
                {user?.name || name || 'Vận động viên'}
              </h1>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Đã xác thực</span>
                </span>
              )}
            </div>
          </div>

          {/* Profile Content below gradient */}
          <div className="px-6 sm:px-8 pb-6 relative">
            {/* Avatar floating on boundary */}
            <div className="absolute -top-14 sm:-top-16 left-6 sm:left-8">
              <div className="relative group">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80'}
                  alt={user?.name || 'Vận động viên'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-slate-100"
                />
                <button 
                  type="button" 
                  className="absolute bottom-1 right-1 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg shadow-lg transition transform hover:scale-105"
                  title="Đổi ảnh đại diện"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Info row + Stats - offset to clear avatar */}
            <div className="pt-14 sm:pt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl line-clamp-2 font-medium">
                  {user?.preferences?.bio || bio || 'Đam mê thể thao, tìm bạn giao lưu và chinh phục các giải đấu!'}
                </p>

                {/* Badges line */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-slate-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-semibold border border-amber-200/50">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    {skillLevel}
                  </span>
                  {clubName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-semibold border border-blue-200/50">
                      <Trophy className="w-3.5 h-3.5 text-blue-600" />
                      CLB: {clubName}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/70 p-3 rounded-2xl shrink-0 text-center">
                <div className="px-3">
                  <div className="text-lg font-black text-slate-900">{myRegistrations.length}</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Giải đăng ký</div>
                </div>
                <div className="h-8 w-[1px] bg-slate-200" />
                <div className="px-3">
                  <div className="text-lg font-black text-slate-900">{savedTournaments.length}</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Giải quan tâm</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Split: Sidebar (Left) + Main Content (Right) */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs">
              <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                Tài khoản & Hoạt động
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === 'edit'
                      ? 'bg-[#1E5AA8] text-white shadow-md shadow-[#1E5AA8]/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={`w-4 h-4 ${activeTab === 'edit' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Cập nhật hồ sơ</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'edit' ? 'text-white/70' : 'text-slate-300'}`} />
                </button>

                <button
                  onClick={() => setActiveTab('my-tournaments')}
                  className={`w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === 'my-tournaments'
                      ? 'bg-[#1E5AA8] text-white shadow-md shadow-[#1E5AA8]/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Ticket className={`w-4 h-4 ${activeTab === 'my-tournaments' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Vé & Giải đấu</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    activeTab === 'my-tournaments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {myRegistrations.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === 'saved'
                      ? 'bg-[#1E5AA8] text-white shadow-md shadow-[#1E5AA8]/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Giải quan tâm</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {savedTournaments.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Help / Tip Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-5 text-white shadow-sm space-y-2 hidden md:block">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Mẹo hoàn thiện hồ sơ</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Cập nhật chính xác trình độ và CLB để hệ thống đề xuất các giải đấu và kèo ghép đối phù hợp nhất với bạn.
              </p>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 w-full space-y-6">

            {/* TAB 1: EDIT PROFILE */}
            {activeTab === 'edit' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                
                <div className="border-b border-slate-100 pb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>Cập nhật thông tin hồ sơ</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Quản lý thông tin hiển thị cá nhân và thông tin thi đấu thể thao của bạn.
                    </p>
                  </div>
                  {savedSuccess && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã lưu thành công!</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Section: Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      1. Thông tin cá nhân
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Họ và tên hiển thị <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập họ và tên của bạn"
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-slate-900 font-medium transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Giới thiệu ngắn (Bio)
                        </label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Chia sẻ vài dòng về bản thân, phong cách chơi hoặc thời gian rảnh..."
                          className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-slate-900 font-medium transition"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Tối đa 200 ký tự.</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Section: Sports & Activity */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      2. Hoạt động & Thi đấu
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Khu vực sinh sống
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ví dụ: Đà Nẵng, Q. Hải Châu..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-slate-900 font-medium transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tên CLB / Nhóm đang sinh hoạt
                        </label>
                        <div className="relative">
                          <Trophy className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                            placeholder="Ví dụ: CLB Cầu Lông Sơn Trà"
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] text-slate-900 font-medium transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skill Level Selection Pills */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Trình độ thi đấu của bạn
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {skillOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSkillLevel(option)}
                            className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition-all text-center ${
                              skillLevel === option
                                ? 'bg-[#1E5AA8]/10 border-[#1E5AA8] text-[#1E5AA8] shadow-xs'
                                : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1E5AA8] to-[#2563EB] hover:from-[#174888] hover:to-[#1D4ED8] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* TAB 2: MY TOURNAMENTS */}
            {activeTab === 'my-tournaments' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Vé & Giải đấu đã đăng ký</h2>
                    <p className="text-xs text-slate-500">Danh sách các giải đấu bạn đã đăng ký tham gia</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    Tổng: {myRegistrations.length}
                  </span>
                </div>

                {myRegistrations.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center mx-auto">
                      <Ticket className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Chưa có giải đấu nào được đăng ký</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Bạn chưa đăng ký tham gia giải đấu nào. Hãy khám phá danh sách giải đấu sắp diễn ra ngay!
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/tournaments"
                        className="px-5 py-2.5 rounded-2xl bg-[#1E5AA8] text-white text-xs font-bold hover:bg-[#174888] transition inline-flex items-center gap-2 shadow-sm"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Khám phá giải đấu</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  myRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center shrink-0 border border-blue-100">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 text-base">
                            {reg.tournamentTitle || reg.tournament?.title || `Giải đấu #${reg.tournamentId?.slice(-6) || 'CM'}`}
                          </h3>
                          <p className="text-xs text-slate-600">
                            VĐV: <strong className="text-slate-900">{reg.playerName}</strong> {reg.partnerName ? `& ${reg.partnerName}` : ''} • Trình: {reg.skillLevel || 'Tiêu chuẩn'}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <span className={`px-3 py-0.5 rounded-full font-extrabold text-[10px] tracking-wide ${
                              reg.status === 'PAID' || reg.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : reg.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {reg.status === 'PAID' ? 'ĐÃ THANH TOÁN' : reg.status === 'APPROVED' ? 'ĐÃ DUYỆT' : reg.status === 'PENDING' ? 'CHỜ THANH TOÁN' : 'ĐÃ HỦY / THẤT BẠI'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        {reg.status === 'PAID' || reg.status === 'APPROVED' ? (
                          <Link
                            href={`/ticket/${reg.tournamentId}`}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#1E5AA8] hover:bg-[#174888] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>Mở vé QR Check-in</span>
                          </Link>
                        ) : reg.status === 'PENDING' ? (
                          <Link
                            href={`/tournaments/${reg.tournamentId}/register`}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Thanh toán ngay</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/tournaments/${reg.tournamentId}/register`}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Đăng ký lại</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: SAVED TOURNAMENTS */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Giải đấu đang quan tâm</h2>
                    <p className="text-xs text-slate-500">Các giải đấu bạn đã bookmark để theo dõi</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {savedTournaments.length} giải
                  </span>
                </div>

                {savedTournaments.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center mx-auto">
                      <Bookmark className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Chưa lưu giải đấu nào</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Bấm vào biểu tượng lưu trên thẻ giải đấu để xem lại thông tin nhanh chóng tại đây.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/tournaments"
                        className="px-5 py-2.5 rounded-2xl bg-[#1E5AA8] text-white text-xs font-bold hover:bg-[#174888] transition inline-flex items-center gap-2 shadow-sm"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Khám phá giải đấu</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedTournaments.map((t) => (
                      <div key={t.id} className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex gap-4 hover:border-slate-300 transition">
                        <img
                          src={t.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80'}
                          alt={t.title}
                          className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-slate-100"
                        />
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{t.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-[#1E5AA8] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {t.city}
                            </span>
                            <Link href={`/tournaments/${t.id}`} className="text-xs font-bold text-slate-700 hover:text-[#1E5AA8] flex items-center gap-0.5">
                              <span>Chi tiết</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
