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

// Ant Design Components & Icons
import {
  Button,
  Tag,
  Badge,
  Select,
  Alert,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  ShareAltOutlined,
  CopyOutlined,
  CheckOutlined,
  UserAddOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  LoginOutlined,
  CalendarOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrCode = params?.id as string;
  const { user, isAuthenticated } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [otherActiveMatch, setOtherActiveMatch] = useState<Match | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    loading,
    isThresholdElapsed,
    error,
    execute,
  } = useSmartAsync({ initialLoading: true });
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<BadmintonSkillLevel>(BadmintonSkillLevel.TB);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

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

  // Kiểm tra xem người dùng hiện tại có đang tham gia slot ở một kèo đấu khác không
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOtherActiveMatch(null);
      return;
    }

    const uid = user.id || (user as any)._id;
    matchesApi
      .getMatches()
      .then((res) => {
        const found = res.data.find((m) => {
          const mId = m.id || m._id;
          const currentId = match?.id || match?._id;
          const isCurrentMatch =
            mId === idOrCode ||
            m.shareCode === idOrCode ||
            (currentId && mId === currentId);

          return (
            !isCurrentMatch &&
            m.players?.some((p) => p.userId === uid) &&
            m.status !== MatchStatus.CANCELLED &&
            m.status !== MatchStatus.COMPLETED
          );
        });
        setOtherActiveMatch(found || null);
      })
      .catch((err) => {
        console.error('Lỗi kiểm tra kèo đấu active khác:', err);
      });
  }, [isAuthenticated, user, idOrCode, match]);

  // Tạo URL Google Calendar trực tiếp
  const getGoogleCalendarUrl = (m: Match) => {
    try {
      const start = new Date(m.startTime);
      const end = m.endTime
        ? new Date(m.endTime)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      const formatTime = (d: Date) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

      const title = encodeURIComponent(`[CourtMate] ${m.title}`);
      const details = encodeURIComponent(
        `Trận đấu: ${m.title}\nBộ môn: ${m.sport === SportType.BADMINTON ? 'Cầu lông' : 'Pickleball'
        }\nĐịa điểm: ${m.venueName} (${m.courtNumber || 'Sân giao lưu'})\nĐịa chỉ: ${m.venueAddress
        }, Q. ${m.district}\nChi phí: ${m.estimatedCostText
        }\n\n* Nhắc nhở từ CourtMate: Có mặt trước 15 phút để khởi động và gặp gỡ bạn chơi!`
      );
      const location = encodeURIComponent(`${m.venueName}, ${m.venueAddress}, Đà Nẵng`);
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatTime(start)}/${formatTime(end)}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!match) return;

    // Ngăn chặn nếu người chơi đã có slot ở kèo đấu khác
    if (otherActiveMatch) {
      setStatusMsg({
        text: `Bạn đã tham gia slot tại "${otherActiveMatch.title}". Mỗi người chơi chỉ được giữ một trận tại một thời điểm!`,
        type: 'warning',
      });
      return;
    }

    setJoining(true);
    try {
      const updated = await matchesApi.joinMatch(match.id || match._id!, selectedSkill);
      setMatch(updated);
      setStatusMsg({
        text: 'Tham gia giữ slot thành công! Hẹn gặp bạn ở sân đấu.',
        type: 'success',
      });
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
      ` [CourtMate] Kèo Cầu Lông: ${match?.title} tại ${match?.venueName} (${match?.district}). Còn trống ${(match?.totalSlots || 4) - (match?.joinedCount || 1)
      } chỗ! Vào giữ slot ngay nhé:`
    );
    window.open(`https://zalo.me/share?url=${url}&text=${text}`, '_blank');
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' · ' +
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
      <div className="min-h-screen bg-canvas pt-32 pb-20 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-semibold">Đang tải thông tin kèo đấu...</p>
      </div>
    );
  }

  if (error || (!loading && !match)) {
    return (
      <div className="min-h-screen bg-canvas pt-32 pb-20 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 text-2xl">
          <ExclamationCircleFilled />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {error ? 'Không thể tải thông tin trận đấu' : 'Không tìm thấy thông tin trận đấu'}
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          {typeof error === 'string'
            ? error
            : (error as any)?.message || 'Kèo đấu này có thể đã kết thúc hoặc bị hủy.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button type="primary" size="large" onClick={fetchDetail} className="font-bold rounded-xl">
            Thử lại
          </Button>
          <Link href="/matches">
            <Button size="large" className="rounded-xl font-semibold">
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const currentUserId = user ? (user.id || (user as any)._id) : null;
  const isHost = Boolean(currentUserId && currentUserId === match.hostId);
  const isJoined = Boolean(
    currentUserId && match.players.some((p) => p.userId === currentUserId)
  );
  const hasOtherActiveMatch = Boolean(otherActiveMatch);

  const availableSlots = match.totalSlots - match.joinedCount;
  const isFull = match.status === MatchStatus.FULL || availableSlots <= 0;

  const minMeta = BADMINTON_SKILL_LABELS[match.minSkillLevel as BadmintonSkillLevel] || {
    label: match.minSkillLevel,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };
  const maxMeta = BADMINTON_SKILL_LABELS[match.maxSkillLevel as BadmintonSkillLevel] || {
    label: match.maxSkillLevel,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="min-h-screen bg-canvas page-section">
      <div className="page-container">
        {/* TOP COMMAND & BREADCRUMB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <Link
            href="/matches"
            className="cm-link inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeftOutlined />
            <span>Quay lại danh sách giao lưu</span>
          </Link>
        </div>

        {/* NOTIFICATION STATUS MESSAGE */}
        {statusMsg && (
          <div className="mb-6">
            <Alert
              message={statusMsg.text}
              type={statusMsg.type}
              showIcon
              closable
              onClose={() => setStatusMsg(null)}
              className="rounded-2xl shadow-xs font-medium"
            />
          </div>
        )}

        {/* ACTIVE SLOT REMINDER BANNER FOR OTHER MATCH */}
        {hasOtherActiveMatch && !isJoined && otherActiveMatch && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-amber-500/20 text-lg">
                <CalendarOutlined />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Tag color="orange" className="font-bold text-xs rounded-full px-2.5 py-0.5 border-none uppercase">
                    Đang tham gia trận khác
                  </Tag>
                  <span className="text-xs text-amber-800 font-medium">
                    Mỗi người chỉ tham gia một trận tại một thời điểm.
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Trận bạn đã tham gia: <u>{otherActiveMatch.title}</u>
                </h4>
                <p className="text-sm text-slate-600 mt-0.5">
                  {otherActiveMatch.venueName} · {formatDateTime(otherActiveMatch.startTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <a
                href={getGoogleCalendarUrl(otherActiveMatch)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  className="font-bold text-xs rounded-xl bg-amber-600 hover:bg-amber-700 border-none shadow-md w-full sm:w-auto"
                >
                  Lưu vào Google Calendar
                </Button>
              </a>
              <Button
                onClick={() => router.push(`/matches/${otherActiveMatch.id || otherActiveMatch._id}`)}
                className="font-bold text-xs rounded-xl text-slate-700 w-full sm:w-auto"
              >
                Đến trận đã đặt →
              </Button>
            </div>
          </div>
        )}

        {/* MAIN MATCH CARD */}
        <div className="bg-surface shadow-card rounded-2xl border border-slate-200/90  overflow-hidden mb-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary via-[#164E8E] to-[#123E75] text-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <Tag
                color={match.sport === SportType.BADMINTON ? 'blue' : 'orange'}
                className="font-bold text-xs rounded-lg px-2.5 py-0.5 border-none uppercase tracking-wider m-0"
              >
                {match.sport === SportType.BADMINTON ? ' Cầu Lông Phong Trào' : ' Pickleball'}
              </Tag>

              <Tag
                color="gold"
                className="font-mono font-bold text-xs rounded-full px-2.5 py-0.5 border-none text-slate-950 m-0"
              >
                Mã trận: {match.shareCode || 'CM-OPEN'}
              </Tag>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white">
              {match.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-100">
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-sky-300 shrink-0" />
                <span>
                  {match.venueName} {match.courtNumber ? `(${match.courtNumber})` : ''} - Q. {match.district}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-amber-300 shrink-0" />
                <span>{formatDateTime(match.startTime)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* VIRAL SHARE STRIP */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 via-indigo-50/60 to-white border border-sky-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShareAltOutlined className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Chia sẻ trận giao lưu với bạn bè</h4>

                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  icon={copied ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none font-bold text-xs rounded-xl border-slate-200"
                >
                  {copied ? 'Đã sao chép!' : 'Copy Link'}
                </Button>

                <Button
                  type="primary"
                  icon={<ShareAltOutlined />}
                  onClick={handleShareZalo}
                  className="flex-1 sm:flex-none font-bold text-xs rounded-xl bg-[#0068FF] hover:bg-[#0052cc] border-none shadow-xs"
                >
                  Gửi Zalo
                </Button>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ThunderboltFilled className="text-primary" />
                  <span>Trình độ yêu cầu</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag color="cyan" className="font-bold text-xs rounded-md px-2 py-0.5 m-0">
                    {minMeta.label}
                  </Tag>
                  <span className="text-muted text-xs font-medium">đến</span>
                  <Tag color="blue" className="font-bold text-xs rounded-md px-2 py-0.5 m-0">
                    {maxMeta.label}
                  </Tag>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  * Yêu cầu người tham gia trung thực về trình độ để trận đấu cân sức & vui vẻ.
                </p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarCircleOutlined className="text-emerald-600" />
                  <span>Chi phí</span>
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
              <EnvironmentOutlined className="text-primary shrink-0 mt-0.5 text-sm" />
              <div>
                <span className="font-bold text-slate-900">Địa chỉ cụ thể: </span>
                <span>
                  {match.venueAddress} · Q. {match.district}, Đà Nẵng
                </span>
              </div>
            </div>

            {/* PLAYERS LIST & INTERACTIVE SLOTS */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TeamOutlined className="text-primary" />
                  Người tham gia ({match.joinedCount}/{match.totalSlots})
                </h3>

                <Badge
                  status={isFull ? 'default' : 'success'}
                  text={
                    <span
                      className={`text-xs font-bold ${isFull ? 'text-slate-500' : 'text-emerald-700'
                        }`}
                    >
                      {isFull ? 'Đã đủ số người' : `Còn ${availableSlots} vị trí`}
                    </span>
                  }
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isFull ? 'bg-slate-100' : 'bg-emerald-50 border border-emerald-200'
                    }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Confirmed players */}
                {match.players.map((p, idx) => {
                  const pMeta =
                    BADMINTON_SKILL_LABELS[p.skillLevel as BadmintonSkillLevel] || {
                      label: p.skillLevel || 'Chưa cập nhật',
                    };
                  const isThisHost = p.userId === match.hostId;
                  const isThisMe = currentUserId && p.userId === currentUserId;

                  return (
                    <div
                      key={p.userId || idx}
                      className={`p-3.5 rounded-2xl border bg-surface shadow-card flex items-center justify-between shadow-2xs transition-colors ${isThisMe
                          ? 'border-emerald-500/70 ring-2 ring-emerald-500/15 bg-emerald-50/20'
                          : 'border-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isThisHost && (
                              <Tag color="gold" className="text-[10px] font-bold rounded px-1.5 py-0 border-none m-0">
                                Người tạo trận
                              </Tag>
                            )}
                            {isThisMe && (
                              <Tag color="green" className="text-[10px] font-bold rounded px-1.5 py-0 border-none m-0">
                                Bạn
                              </Tag>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Trình độ: <span className="font-semibold text-slate-700">{pMeta.label}</span>
                          </div>
                        </div>
                      </div>

                      <Tag color="green" className="font-bold text-[11px] rounded-lg px-2 py-0.5 border-none m-0">
                        Đã tham gia
                      </Tag>
                    </div>
                  );
                })}

                {/* Interactive Clickable Empty slots */}
                {Array.from({ length: Math.max(0, availableSlots) }).map((_, i) => (
                  <button
                    key={`empty-${i}`}
                    onClick={() => {
                      if (hasOtherActiveMatch) {
                        setStatusMsg({
                          text: `Bạn đang có slot ở trận "${otherActiveMatch?.title}". Không thể vào thêm slot trận khác!`,
                          type: 'warning',
                        });
                        return;
                      }
                      if (!isJoined && !isFull && !isHost) {
                        handleJoin();
                      }
                    }}
                    disabled={isJoined || isFull || isHost || joining}
                    className={`cm-button p-3.5 rounded-2xl border border-dashed transition-all flex items-center justify-between text-left group ${isJoined || isHost
                        ? 'border-slate-200 bg-slate-50/50 text-muted cursor-default'
                        : hasOtherActiveMatch
                          ? 'border-amber-300 bg-amber-50/40 text-slate-500 cursor-not-allowed'
                          : 'border-primary/40 bg-sky-50/30 hover:bg-sky-50/80 hover:border-primary text-slate-700 cursor-pointer shadow-2xs'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full border border-dashed flex items-center justify-center transition-colors ${hasOtherActiveMatch
                            ? 'border-amber-400 text-amber-600'
                            : 'border-slate-300 group-hover:border-primary text-muted group-hover:text-primary'
                          }`}
                      >
                        <UserAddOutlined className="text-sm" />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold transition-colors ${hasOtherActiveMatch
                              ? 'text-amber-900'
                              : 'text-slate-700 group-hover:text-primary'
                            }`}
                        >
                          Chỗ trống #{match.joinedCount + i + 1}
                        </div>
                        <div className="text-[11px] text-muted">
                          {isJoined
                            ? 'Vị trí còn trống'
                            : hasOtherActiveMatch
                              ? 'Bạn đã có lịch ở trận khác'
                              : 'Bấm vào đây để giữ slot này'}
                        </div>
                      </div>
                    </div>

                    {!isJoined && !isHost && (
                      <span
                        className={`text-xs font-bold transition-transform flex items-center gap-1 ${hasOtherActiveMatch ? 'text-amber-600' : 'text-primary'
                          }`}
                      >
                        {hasOtherActiveMatch ? 'Đã có lịch' : 'Vào ngay →'}
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

                  </div>
                  <div>
                    <div className="font-bold text-amber-950">Bạn đã tạo trận này</div>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Chia sẻ mã trận <span className="font-mono font-bold">{match.shareCode}</span> hoặc gửi liên kết cho bạn bè.
                    </p>
                  </div>
                </div>
              ) : isJoined ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 text-xl">
                      <CheckCircleFilled />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950 text-sm">
                        Bạn đã tham gia trận này.
                      </div>
                      <p className="text-emerald-700 text-sm mt-0.5">
                        Vui lòng có mặt đúng giờ trước 15 phút tại sân thi đấu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={getGoogleCalendarUrl(match)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none"
                    >
                      <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        className="w-full font-bold text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none shadow-xs"
                      >
                        Lưu vào Google Calendar
                      </Button>
                    </a>

                    <Button
                      danger
                      onClick={handleLeave}
                      loading={joining}
                      className="flex-1 sm:flex-none font-bold text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      Rút khỏi trận
                    </Button>
                  </div>
                </div>
              ) : hasOtherActiveMatch ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0">
                      <ExclamationCircleFilled />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        Bạn đang tham gia trận khác.
                      </div>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        Theo quy định của CourtMate, mỗi người chơi chỉ được đăng ký <strong>một trận tại một thời điểm</strong> để đảm bảo trách nhiệm và thời gian thi đấu. Trận đã tham gia: <strong>{otherActiveMatch?.title}</strong> ({otherActiveMatch?.venueName}).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2 border-t border-amber-200/80">
                    <a
                      href={otherActiveMatch ? getGoogleCalendarUrl(otherActiveMatch) : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none"
                    >
                      <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        className="w-full font-bold text-xs rounded-xl bg-amber-600 hover:bg-amber-700 border-none shadow-md"
                      >
                        Lưu vào Google Calendar
                      </Button>
                    </a>

                    <Button
                      onClick={() => {
                        if (otherActiveMatch) {
                          router.push(`/matches/${otherActiveMatch.id || otherActiveMatch._id}`);
                        }
                      }}
                      className="font-bold text-xs rounded-xl text-slate-700"
                    >
                      Chuyển đến trận đã đặt →
                    </Button>
                  </div>
                </div>
              ) : isFull ? (
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-center font-bold text-sm">
                  Trận đấu này đã đủ số lượng người tham gia!
                </div>
              ) : (
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-800   mb-1">
                        Chọn trình độ của bạn:
                      </label>

                    </div>

                    <Select
                      value={selectedSkill}
                      onChange={(val) => setSelectedSkill(val)}
                      size="large"
                      className="w-full sm:w-56"
                      options={Object.values(BadmintonSkillLevel).map((lvl) => ({
                        value: lvl,
                        label: BADMINTON_SKILL_LABELS[lvl]?.label,
                      }))}
                    />
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<UserAddOutlined />}
                    onClick={handleJoin}
                    loading={joining}
                    className="w-full font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 h-12 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {joining ? 'Đang xác nhận...' : 'Tham gia trận'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* POPUP YÊU CẦU ĐĂNG NHẬP */}
      <Modal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        footer={null}
        width={440}
        centered
        className="rounded-2xl"
        destroyOnHidden
      >
        <div className="text-center p-2 pt-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
            <LoginOutlined />
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-2">Đăng nhập để tham gia</h3>
          <p className="text-slate-600 text-sm sm:text-sm leading-relaxed mb-6">
            Đăng nhập để tham gia và liên hệ với người chơi.
          </p>

          <div className="space-y-2.5">
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={() => {
                router.push(`/login?redirect=/matches/${idOrCode}`);
              }}
              className="w-full font-bold rounded-xl shadow-md shadow-blue-500/20"
            >
              Đăng nhập ngay
            </Button>

            <Button
              type="text"
              onClick={() => setShowLoginModal(false)}
              className="w-full font-semibold text-xs text-slate-500 hover:text-slate-800"
            >
              Tiếp tục xem trận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
