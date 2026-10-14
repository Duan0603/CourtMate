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
import { useSmartAsync } from '@/context/useSmartAsync';
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
  LogIn,
  X,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrCode = params?.id as string;
  const { user, isAuthenticated } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {
    loading,
    isThresholdElapsed,
    error,
    execute,
  } = useSmartAsync({ initialLoading: true });
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<BadmintonSkillLevel>(BadmintonSkillLevel.TB);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDetail = async () => {
    if (!idOrCode) return;
    try {
      await execute(async () => {
        const data = await matchesApi.getMatchDetails(idOrCode);
        setMatch(data);
      });
    } catch (err) {
      console.error('Lỗi khi tải chi tiết kèo đấu:', err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [idOrCode]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
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

  if (loading && isThresholdElapsed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 flex flex-col justify-center items-center animate-fadeIn">
        <div className="w-10 h-10 border-4 border-[#1E5AA8] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-semibold">Đang chuẩn bị thông tin kèo đấu...</p>
      </div>
    );
  }

  if (error || (!loading && !match)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 text-center animate-fadeIn px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {error ? 'Không thể tải thông tin trận đấu' : 'Không tìm thấy thông tin trận đấu'}
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          {typeof error === 'string' ? error : (error as any)?.message || 'Kèo đấu này có thể đã kết thúc hoặc bị hủy.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchDetail}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E5AA8] text-white font-semibold text-sm shadow hover:bg-[#154689] transition-colors"
          >
            Thử lại
          </button>
          <Link href="/matches" className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const isHost = user && (user.id === match.hostId || (user as any)._id === match.hostId);
  const isJoined = user && match.players.some((p) => p.userId === user.id || p.userId === (user as any)._id);
  const availableSlots = match.totalSlots - match.joinedCount;
  const isFull = match.status === MatchStatus.FULL || availableSlots <= 0;

  const minMeta = BADMINTON_SKILL_LABELS[match.minSkillLevel];
  const maxMeta = BADMINTON_SKILL_LABELS[match.maxSkillLevel];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-6 sm:pt-8 pb-24">
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
            {/* VIRAL SHARE STRIP (Compact) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 via-indigo-50/60 to-white border border-sky-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1E5AA8]/10 text-[#1E5AA8] flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Chia sẻ kèo đấu với nhóm bạn
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Gửi link nhanh qua Zalo / Facebook để rủ thêm bạn cùng vào slot
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Đã sao chép!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleShareZalo}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0068FF] text-white text-xs font-bold hover:bg-[#0052cc] shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Gửi Zalo</span>
                </button>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E5AA8]" />
                  <span>Trình độ yêu cầu</span>
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
                  * Yêu cầu người tham gia trung thực về trình độ để trận đấu cân sức & vui vẻ.
                </p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>💰</span>
                  <span>Hình thức chi phí</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {match.estimatedCostText || 'Chia đều tiền sân tại chỗ'}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  * Thanh toán trực tiếp tại sân sau buổi chơi, không giữ cọc trung gian.
                </p>
              </div>
            </div>

            {/* VENUE FULL ADDRESS */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#1E5AA8] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Địa chỉ cụ thể: </span>
                <span>{match.venueAddress}</span>
              </div>
            </div>

            {/* PLAYERS LIST & INTERACTIVE SLOTS */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E5AA8]" />
                  Danh sách vận động viên ({match.joinedCount}/{match.totalSlots})
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
                {/* Confirmed players */}
                {match.players.map((p, idx) => {
                  const pMeta = BADMINTON_SKILL_LABELS[p.skillLevel as BadmintonSkillLevel];
                  const isThisHost = p.userId === match.hostId;

                  return (
                    <div
                      key={p.userId || idx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] flex items-center justify-center font-black text-sm">
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
                            Trình độ: <span className="font-semibold text-slate-700">{pMeta?.label || 'Chưa cập nhật'}</span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        <UserCheck className="w-3.5 h-3.5" />
                        Đã giữ slot
                      </span>
                    </div>
                  );
                })}

                {/* Interactive Clickable Empty slots */}
                {Array.from({ length: Math.max(0, availableSlots) }).map((_, i) => (
                  <button
                    key={`empty-${i}`}
                    onClick={() => {
                      if (!isJoined && !isFull && !isHost) {
                        handleJoin();
                      }
                    }}
                    disabled={isJoined || isFull || isHost || joining}
                    className={`p-3.5 rounded-2xl border border-dashed transition-all flex items-center justify-between text-left group ${
                      isJoined || isHost
                        ? 'border-slate-200 bg-slate-50/50 text-slate-400 cursor-default'
                        : 'border-[#1E5AA8]/30 bg-sky-50/30 hover:bg-sky-50/80 hover:border-[#1E5AA8] text-slate-700 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 group-hover:border-[#1E5AA8] flex items-center justify-center text-slate-400 group-hover:text-[#1E5AA8] transition-colors">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-[#1E5AA8] transition-colors">
                          Slot trống #{match.joinedCount + i + 1}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {isJoined ? 'Vị trí còn trống' : 'Bấm vào đây để giữ slot này'}
                        </div>
                      </div>
                    </div>

                    {!isJoined && !isHost && (
                      <span className="text-xs font-bold text-[#1E5AA8] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Vào ngay →
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION SECTION */}
            <div className="pt-6 border-t border-slate-100">
              {isHost ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">
                    👑
                  </div>
                  <div>
                    <div className="font-bold text-amber-950">Bạn là người đăng kèo thi đấu này</div>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Sao chép mã kèo <span className="font-mono font-bold">{match.shareCode}</span> hoặc gửi link Zalo cho bạn bè để nhanh chóng lấp đầy các vị trí trống!
                    </p>
                  </div>
                </div>
              ) : isJoined ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950 text-sm">Bạn đã giữ slot thành công cho trận đấu này!</div>
                      <p className="text-emerald-700 text-xs mt-0.5">Vui lòng có mặt đúng giờ trước 15 phút tại sân thi đấu.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLeave}
                    disabled={joining}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  >
                    Hủy slot (Rút lui)
                  </button>
                </div>
              ) : isFull ? (
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-center font-bold text-sm">
                  Trận đấu này đã đủ số lượng người tham gia!
                </div>
              ) : (
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                        Chọn trình độ thực tế của bạn trước khi vào kèo:
                      </label>
                      <p className="text-[11px] text-slate-500">Giúp các thành viên trong nhóm nắm được thể lực và khả năng thi đấu</p>
                    </div>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value as any)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] cursor-pointer"
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
                    className="w-full py-3.5 px-8 rounded-xl bg-gradient-to-r from-[#1E5AA8] to-[#123E75] hover:from-[#154689] hover:to-[#0A2540] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>{joining ? 'Đang xác nhận...' : 'Tham Gia Giữ Slot Ngay (1-Chạm)'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── POPUP CHÍNH GIỮA MÀN HÌNH: YÊU CẦU ĐĂNG NHẬP ─── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#1E5AA8]/10 text-[#1E5AA8] flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Yêu Cầu Đăng Nhập
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Bạn cần đăng nhập tài khoản CourtMate để giữ slot thi đấu này, giúp chủ sân và các người chơi khác có thể liên hệ giao lưu cùng bạn.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  router.push(`/login?redirect=/matches/${idOrCode}`);
                }}
                className="w-full py-3 px-5 rounded-xl bg-[#1E5AA8] hover:bg-[#154687] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập ngay</span>
              </button>

              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 px-5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Để sau, tôi muốn xem thông tin sân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
