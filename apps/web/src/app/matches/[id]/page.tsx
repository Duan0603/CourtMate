'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Match,
  MatchStatus,
  BadmintonSkillLevel,
  BADMINTON_SKILL_LABELS,
  SportType,
} from '@courtmate/shared';
import { matchesApi } from '@/lib/matches.api';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Share2,
  Copy,
  Check,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Phone,
  AlertCircle,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrCode = params?.id as string;
  const { user, isAuthenticated } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<BadmintonSkillLevel>(BadmintonSkillLevel.TB);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDetail = async () => {
    if (!idOrCode) return;
    setLoading(true);
    try {
      const data = await matchesApi.getMatchDetails(idOrCode);
      setMatch(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [idOrCode]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/matches/${idOrCode}`);
      return;
    }
    if (!match) return;

    setJoining(true);
    try {
      const updated = await matchesApi.joinMatch(match.id || match._id!, selectedSkill);
      setMatch(updated);
      setStatusMsg({ text: 'Tham gia giữ slot thành công! Hẹn gặp bạn ở sân đấu.', type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Không thể tham gia', type: 'error' });
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy slot đã đăng ký không?')) return;
    if (!match) return;

    setJoining(true);
    try {
      const updated = await matchesApi.leaveMatch(match.id || match._id!);
      setMatch(updated);
      setStatusMsg({ text: 'Đã rút lui khỏi kèo đấu thành công.', type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Không thể rút lui', type: 'error' });
    } finally {
      setJoining(false);
    }
  };

  // Sao chép Link mời thật
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Chia sẻ Zalo
  const handleShareZalo = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `🏸 [CourtMate] Kèo Cầu Lông: ${match?.title} tại ${match?.venueName} (${match?.district}). Còn trống ${
        (match?.totalSlots || 4) - (match?.joinedCount || 1)
      } chỗ! Vào giữ slot ngay nhé:`
    );
    window.open(`https://zalo.me/share?url=${url}&text=${text}`, '_blank');
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' - ' +
        d.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#1E5AA8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin trận đấu</h2>
        <Link href="/matches" className="text-sm font-semibold text-[#1E5AA8] hover:underline">
          Quay lại danh sách kèo
        </Link>
      </div>
    );
  }

  const isHost = user && (user.id === match.hostId || (user as any)._id === match.hostId);
  const isJoined = user && match.players.some((p) => p.userId === user.id || p.userId === (user as any)._id);
  const availableSlots = match.totalSlots - match.joinedCount;
  const isFull = match.status === MatchStatus.FULL || availableSlots <= 0;

  const minMeta = BADMINTON_SKILL_LABELS[match.minSkillLevel];
  const maxMeta = BADMINTON_SKILL_LABELS[match.maxSkillLevel];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1E5AA8] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách kèo
        </Link>

        {statusMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMsg.text}</span>
          </div>
        )}

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E5AA8] to-[#123E75] text-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                🏸 {match.sport === SportType.BADMINTON ? 'Cầu Lông Phong Trào' : 'Pickleball'}
              </span>

              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                Mã kèo: {match.shareCode || 'CM-OPEN'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">{match.title}</h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-300 shrink-0" />
                <span>
                  {match.venueName} {match.courtNumber ? `(${match.courtNumber})` : ''} - Q. {match.district}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{formatDateTime(match.startTime)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* VIRAL SHARE CARD */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Share2 className="w-4 h-4 text-[#1E5AA8]" />
                  Rủ bạn bè hoặc đăng lên Group Zalo / Facebook
                </h4>
                <p className="text-xs text-slate-600">
                  Người khác bấm vào link này sẽ xem được thông tin và giữ slot ngay lập tức!
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã chép link!' : 'Copy Link Kèo'}
                </button>

                <button
                  onClick={handleShareZalo}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0068FF] text-white text-xs font-bold hover:bg-[#0052cc] shadow-sm transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Gửi sang Zalo
                </button>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Trình độ yêu cầu
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${minMeta?.color}`}>
                    {minMeta?.label}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">đến</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${maxMeta?.color}`}>
                    {maxMeta?.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  * Yêu cầu người tham gia trung thực về trình độ để buổi chơi vui vẻ và đúng tầm.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Hình thức chi phí
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {match.estimatedCostText || 'Chia đều tiền sân tại chỗ'}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  * Thanh toán trực tiếp tại sân sau buổi chơi.
                </p>
              </div>
            </div>

            {/* VENUE FULL ADDRESS */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#1E5AA8] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Địa chỉ cụ thể: </span>
                <span>{match.venueAddress}</span>
              </div>
            </div>

            {/* PLAYERS LIST (SLOTS) */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E5AA8]" />
                  Danh sách người tham gia ({match.joinedCount}/{match.totalSlots})
                </h3>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isFull
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isFull ? 'Đã đủ số người' : `Còn ${availableSlots} vị trí`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {match.players.map((p, idx) => {
                  const pMeta = BADMINTON_SKILL_LABELS[p.skillLevel as BadmintonSkillLevel];
                  const isThisHost = p.userId === match.hostId;

                  return (
                    <div
                      key={p.userId || idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] flex items-center justify-center font-bold text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isThisHost && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                Chủ kèo
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Trình: {pMeta?.label || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>

                      <UserCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                  );
                })}

                {/* Empty placeholder slots */}
                {Array.from({ length: Math.max(0, availableSlots) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center text-xs font-medium text-slate-400 gap-1.5"
                  >
                    <span>Slot trống #{match.joinedCount + i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-6 border-t border-slate-100">
              {isHost ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                  👑 Bạn là người tạo kèo này. Bạn có thể sao chép link ở trên để gửi vào nhóm bạn bè hoặc Zalo!
                </div>
              ) : isJoined ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Bạn đã giữ slot thành công cho trận đấu này!</span>
                  </div>
                  <button
                    onClick={handleLeave}
                    disabled={joining}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
                  >
                    Hủy slot (Rút lui)
                  </button>
                </div>
              ) : isFull ? (
                <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-center font-bold text-sm">
                  Trận đấu này đã đủ số lượng người tham gia!
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Chọn trình độ thực tế của bạn trước khi vào kèo:
                    </label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value as any)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8]"
                    >
                      {Object.values(BadmintonSkillLevel).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {BADMINTON_SKILL_LABELS[lvl]?.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E5AA8] to-[#123E75] hover:from-[#154689] hover:to-[#0A2540] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {joining ? 'Đang xác nhận...' : 'Tham Gia Giữ Slot Ngay (1-Chạm)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
