'use client';

import { PageContainer } from '../../components/layout/PageContainer';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Trophy,
  Heart,
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
import { FavoritesPanel } from '../../components/profile/FavoritesPanel';
import { useAuth } from '../../context/AuthContext';
import { SportType } from '@courtmate/shared';
import { registrationsApi } from '../../lib/registrations.api';
import { tournamentsApi } from '../../lib/tournaments.api';
import { uploadImageToCloudinary } from '../../lib/cloudinary';
import { LoadingDots } from '../../components/shared/LoadingDots';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, token, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-tournaments' | 'saved' | 'edit'>('edit');
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [savedTournaments, setSavedTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const favoriteCount = (user?.bookmarkedTournaments?.length || 0) + (user?.bookmarkedCoaches?.length || 0);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'favorites') setActiveTab('saved');
  }, []);

  // Avatar Upload State
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Edit fields
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || user?.preferences?.avatarUrl || '');
  const [bio, setBio] = useState(user?.preferences?.bio || '');
  const [location, setLocation] = useState(user?.preferences?.location || 'Đà Nẵng');
  const [clubName, setClubName] = useState(user?.preferences?.clubName || '');
  const [skillLevel, setSkillLevel] = useState(user?.preferences?.skillLevel || 'Tự do (Phong trào)');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || user.preferences?.avatarUrl || '');
      setBio(user.preferences?.bio || '');
      setLocation(user.preferences?.location || 'Đà Nẵng');
      setClubName(user.preferences?.clubName || '');
      setSkillLevel(user.preferences?.skillLevel || 'Tự do (Phong trào)');
    }

  }, [user]);

  useEffect(() => {
    let active = true;
    if (!user?.id) { setMyRegistrations([]); return; }
    registrationsApi.getMyRegistrations(user.id).then(regs => {
      if (active) setMyRegistrations(regs || []);
    });
    return () => { active = false; };
  }, [user?.id]);

  const savedIds = user?.bookmarkedTournaments?.join(',') || '';
  useEffect(() => {
    let active = true;
    if (!user?.id || !token || !savedIds) {
      setSavedTournaments([]); setLoading(false); return;
    }
    setLoading(true);
    tournamentsApi.getBookmarkedTournaments(token, savedIds.split(',')).then(saved => {
      if (active) setSavedTournaments(saved);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, token, savedIds]);

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
    <div className="bg-canvas min-h-screen page-section">
      <PageContainer>

        {/* Header Profile Card - Redesigned */}
        <div className="relative bg-surface shadow-card rounded-3xl border border-ink overflow-hidden  mb-8">
          {/* Cover Gradient with Name overlay */}
          <div className="h-44 sm:h-52 bg-primary relative overflow-hidden">
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
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 text-white border border-white/20 ">
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
                  src={
                    avatarUrl ||
                    user?.avatarUrl ||
                    user?.preferences?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || name || 'User')}&background=1E5AA8&color=ffffff&size=256&bold=true`
                  }
                  alt={user?.name || 'Vận động viên'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                />

                {/* Upload Status Overlay */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-3xl bg-black/60 flex flex-col items-center justify-center text-white z-10">
                    <LoadingDots size="sm" colorScheme="white" />
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="cm-control hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setIsUploadingAvatar(true);
                    const toastId = toast.loading('Đang upload ảnh lên...');

                    try {
                      const uploadedUrl = await uploadImageToCloudinary(file);
                      setAvatarUrl(uploadedUrl);
                      await updateProfile({
                        avatarUrl: uploadedUrl,
                        preferences: {
                          ...(user?.preferences || {}),
                          avatarUrl: uploadedUrl,
                        } as any,
                      });
                      toast.dismiss(toastId);
                    } catch (err: any) {
                      console.error('Upload avatar error:', err);
                      const detail = err?.message && err.message !== 'Upload thất bại' ? `: ${err.message}` : '';
                      toast.error(`Upload thất bại${detail}`, { id: toastId });
                    } finally {
                      setIsUploadingAvatar(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                  }}
                />

                {/* Camera Action Button */}
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="cm-action cm-button absolute bottom-1 right-1 p-2 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg transition transform hover:scale-110 disabled:opacity-50 cursor-pointer"
                  title="Đổi ảnh đại diện (Cloudinary)"
                  aria-label="Tải ảnh đại diện"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Info row + Stats - offset to clear avatar */}
            <div className="pt-14 sm:pt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm sm:text-sm text-muted max-w-xl line-clamp-2 font-medium">
                  {user?.preferences?.bio || bio || 'Đam mê thể thao, tìm bạn giao lưu và chinh phục các giải đấu!'}
                </p>

                {/* Badges line */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-muted font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-accent-tan text-primary font-semibold border border-ink">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    {skillLevel}
                  </span>
                  {clubName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-accent-baby text-primary font-semibold border border-ink">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      CLB: {clubName}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-4 bg-white border border-ink p-3 rounded-2xl shrink-0 text-center">
                <div className="px-3">
                  <div className="text-lg font-black text-ink">{myRegistrations.length}</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Giải đăng ký</div>
                </div>
                <div className="h-8 w-[1px] bg-white" />
                <div className="px-3">
                  <div className="text-lg font-black text-ink">{favoriteCount}</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Yêu thích</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Split: Sidebar (Left) + Main Content (Right) */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-72 shrink-0 space-y-4">
            <div className="bg-surface shadow-card rounded-3xl border border-ink p-3 ">


              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`cm-button w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === 'edit'
                      ? 'bg-primary text-white shadow-md '
                      : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={`w-4 h-4 ${activeTab === 'edit' ? 'text-white' : 'text-muted'}`} />
                    <span>Cập nhật hồ sơ</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'edit' ? 'text-white/70' : 'text-white'}`} />
                </button>

                <button
                  onClick={() => setActiveTab('my-tournaments')}
                  className={`cm-button w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === 'my-tournaments'
                      ? 'bg-primary text-white shadow-md '
                      : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Ticket className={`w-4 h-4 ${activeTab === 'my-tournaments' ? 'text-white' : 'text-muted'}`} />
                    <span>Vé & Giải đấu</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    activeTab === 'my-tournaments' ? 'bg-white/20 text-white' : 'bg-white text-muted'
                  }`}>
                    {myRegistrations.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`cm-button w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-between ${
                    activeTab === 'saved'
                      ? 'bg-primary text-white shadow-md '
                      : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className={`w-4 h-4 ${activeTab === 'saved' ? 'text-white' : 'text-muted'}`} />
                    <span>Yêu thích</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-white text-muted'
                  }`}>
                    {favoriteCount}
                  </span>
                </button>
              </nav>
            </div>

            {/* Help / Tip Card */}

          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 w-full space-y-6">

            {/* TAB 1: EDIT PROFILE */}
            {activeTab === 'edit' && (
              <div className="bg-surface shadow-card rounded-3xl border border-ink p-6 sm:p-8  space-y-6">

                <div className="border-b border-ink pb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-ink flex items-center gap-2">
                      <span>Hồ sơ cá nhân</span>
                    </h2>

                  </div>
                  {savedSuccess && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-baby border border-ink text-primary text-xs font-bold animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã lưu thành công!</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">

                  {/* Section: Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                      Thông tin cá nhân
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-muted mb-1.5">
                          Họ và tên <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập họ và tên của bạn"
                            className="cm-control w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-ink rounded-2xl focus:outline-none focus:bg-surface shadow-card focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-muted mb-1.5">
                          Giới thiệu bản thân
                        </label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Chia sẻ vài dòng về bản thân, phong cách chơi hoặc thời gian rảnh..."
                          className="cm-control w-full px-4 py-2.5 text-sm bg-white border border-ink rounded-2xl focus:outline-none focus:bg-surface shadow-card focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition"
                        />
                        <span className="text-[10px] text-muted mt-1 block">Tối đa 200 ký tự.</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-ink" />

                  {/* Section: Sports & Activity */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                      Thông tin thi đấu
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-muted mb-1.5">
                          Khu vực sinh sống
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ví dụ: Đà Nẵng, Q. Hải Châu..."
                            className="cm-control w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-ink rounded-2xl focus:outline-none focus:bg-surface shadow-card focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-muted mb-1.5">
                          Câu lạc bộ hoặc nhóm
                        </label>
                        <div className="relative">
                          <Trophy className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                            placeholder="Ví dụ: CLB Cầu Lông Sơn Trà"
                            className="cm-control w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-ink rounded-2xl focus:outline-none focus:bg-surface shadow-card focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skill Level Selection Pills */}
                    <div>
                      <label className="block text-sm font-bold text-muted mb-2">
                        Trình độ thi đấu của bạn
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {skillOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSkillLevel(option)}
                            className={`cm-button px-3 py-2.5 text-xs font-bold rounded-xl border transition-all text-center ${
                              skillLevel === option
                                ? 'bg-accent-baby border-primary text-primary shadow-xs'
                                : 'bg-white border-ink text-muted hover:bg-white'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-ink flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cm-action cm-button px-6 py-3 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-black transition disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* TAB 2: MY TOURNAMENTS */}
            {activeTab === 'my-tournaments' && (
              <div className="space-y-4">
                <div className="bg-surface shadow-card rounded-3xl border border-ink p-6  flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-ink">Giải đấu đã đăng ký</h2>

                  </div>
                  <span className="px-3 py-1 rounded-full bg-white text-muted text-xs font-bold">
                    Tổng: {myRegistrations.length}
                  </span>
                </div>

                {myRegistrations.length === 0 ? (
                  <div className="bg-surface shadow-card rounded-3xl border border-ink p-12 text-center  space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-accent-baby text-primary flex items-center justify-center mx-auto">
                      <Ticket className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-ink text-base">Chưa có giải đấu nào được đăng ký</h3>
                    <p className="text-sm text-muted max-w-sm mx-auto">
                      Chọn giải đấu để tham gia.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/tournaments"
                        className="cm-action px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary transition inline-flex items-center gap-2 shadow-sm"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Xem giải đấu</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  myRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="bg-surface shadow-card rounded-3xl border border-ink p-5  flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-ink transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-baby text-primary flex items-center justify-center shrink-0 border border-ink">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-ink text-base">
                            {reg.tournamentTitle || reg.tournament?.title || `Giải đấu #${reg.tournamentId?.slice(-6) || 'CM'}`}
                          </h3>
                          <p className="text-sm text-muted">
                            VĐV: <strong className="text-ink">{reg.playerName}</strong> {reg.partnerName ? `& ${reg.partnerName}` : ''} • Trình: {reg.skillLevel || 'Tiêu chuẩn'}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <span className={`px-3 py-0.5 rounded-full font-extrabold text-[10px] tracking-wide ${
                              reg.status === 'PAID' || reg.status === 'APPROVED'
                                ? 'bg-accent-baby text-primary'
                                : reg.status === 'PENDING'
                                ? 'bg-accent-tan text-primary'
                                : 'bg-accent-tan text-primary'
                            }`}>
                              {reg.status === 'PAID' ? 'ĐÃ THANH TOÁN' : reg.status === 'APPROVED' ? 'ĐÃ DUYỆT' : reg.status === 'PENDING' ? 'CHỜ THANH TOÁN' : 'ĐÃ HỦY / THẤT BẠI'}
                            </span>
                            <span className="text-[11px] text-muted">
                              {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        {reg.status === 'PAID' || reg.status === 'APPROVED' ? (
                          <Link
                            href={`/ticket/${reg.tournamentId}`}
                            className="cm-action w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>Xem vé QR</span>
                          </Link>
                        ) : reg.status === 'PENDING' ? (
                          <Link
                            href={`/tournaments/${reg.tournamentId}/register`}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Thanh toán ngay</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/tournaments/${reg.tournamentId}/register`}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white hover:bg-white text-muted font-bold text-xs flex items-center justify-center gap-1.5 transition"
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

            {activeTab === 'saved' && <FavoritesPanel tournaments={savedTournaments} loading={loading} />}


          </div>

        </div>

      </PageContainer>
    </div>
  );
}
