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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SportType } from '@courtmate/shared';
import { registrationsApi } from '../../lib/registrations.api';
import { tournamentsApi } from '../../lib/tournaments.api';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-tournaments' | 'saved' | 'edit'>('my-tournaments');
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [savedTournaments, setSavedTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.preferences?.bio || '');
  const [location, setLocation] = useState(user?.preferences?.location || 'Đà Nẵng');
  const [clubName, setClubName] = useState(user?.preferences?.clubName || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.preferences?.bio || '');
      setLocation(user.preferences?.location || 'Đà Nẵng');
      setClubName(user.preferences?.clubName || '');
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
        // Load saved tournaments if bookmarked
        if (user?.bookmarkedTournaments && user.bookmarkedTournaments.length > 0) {
          const saved = tourRes.data.filter(t => user.bookmarkedTournaments?.includes(t.id));
          setSavedTournaments(saved);
        } else {
          setSavedTournaments(tourRes.data.slice(0, 2));
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
    await updateProfile({
      name,
      preferences: {
        ...user?.preferences,
        bio,
        location,
        clubName,
        sports: user?.preferences?.sports || [SportType.BADMINTON],
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80'}
              alt={user?.name || 'Vận động viên'}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-primary/10 shadow-md"
            />
            {user?.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-sm" title="VĐV Đã xác thực">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-extrabold text-navy">{user?.name || 'Vận động viên'}</h1>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary w-fit mx-auto sm:mx-0">
                {user?.role === 'ORGANIZER' ? 'Ban tổ chức' : 'VĐV Thể thao'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              {user?.preferences?.bio || 'Đam mê thể thao, tìm bạn giao lưu và chinh phục các giải đấu!'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {user?.preferences?.location || 'Đà Nẵng'}
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-court-orange" />
                Trình độ: <strong>{user?.preferences?.skillLevel || 'Tự do (Phong trào)'}</strong>
              </span>
              {user?.preferences?.clubName && (
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-primary" />
                  CLB: <strong>{user.preferences.clubName}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('my-tournaments')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'my-tournaments'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Vé & Giải đấu đã đăng ký ({myRegistrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Giải quan tâm ({savedTournaments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'edit'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cập nhật hồ sơ</span>
          </button>
        </div>

        {/* Tab 1: My Tournaments */}
        {activeTab === 'my-tournaments' && (
          <div className="space-y-4">
            {myRegistrations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-navy text-sm">Chưa có giải đấu nào được đăng ký</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Bạn chưa đăng ký tham gia giải đấu nào trên hệ thống CourtMate.
                </p>
                <Link
                  href="/tournaments"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition inline-block"
                >
                  Khám phá giải đấu ngay
                </Link>
              </div>
            ) : (
              myRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-base">
                        {reg.tournamentTitle || reg.tournament?.title || `Giải đấu #${reg.tournamentId?.slice(-6) || 'CM'}`}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        VĐV: <strong>{reg.playerName}</strong> {reg.partnerName ? `& ${reg.partnerName}` : ''} • Trình: {reg.skillLevel || 'Tiêu chuẩn'}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[11px]">
                          {reg.status}
                        </span>
                        <span className="text-slate-400">
                          Đăng ký: {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/ticket/${reg.tournamentId}`}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Mở vé QR Check-in</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Tournaments */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedTournaments.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-navy text-sm">Chưa có giải đấu yêu thích</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Bấm vào biểu tượng lưu trên thẻ giải đấu để xem lại tại đây.
                </p>
                <Link
                  href="/tournaments"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition inline-block"
                >
                  Tìm giải đấu
                </Link>
              </div>
            ) : (
              savedTournaments.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex gap-4">
                  <img
                    src={t.coverImage || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80'}
                    alt={t.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-navy text-sm line-clamp-1">{t.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-primary">{t.city}</span>
                      <Link href={`/tournaments/${t.id}`} className="text-xs font-semibold text-navy hover:text-primary">
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Edit Profile */}
        {activeTab === 'edit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl shadow-xs">
            {savedSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                Cập nhật thông tin thành công!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Giới thiệu ngắn (Bio)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Khu vực sinh sống</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Tên CLB sinh hoạt</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
