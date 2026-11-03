'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Trophy,
  Swords,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  Trash2,
  Layers,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { matchesApi } from '../../lib/matches.api';
import { registrationsApi } from '../../lib/registrations.api';
import toast from 'react-hot-toast';

export type ScheduleItemType = 'match' | 'tournament' | 'training';
export type ScheduleStatus = 'completed' | 'urgent' | 'upcoming';

export interface ScheduleEvent {
  id: string;
  title: string;
  type: ScheduleItemType;
  sport: 'BADMINTON' | 'PICKLEBALL' | 'TENNIS' | 'OTHER';
  venueName: string;
  courtNumber?: string;
  address?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  linkUrl?: string;
  notes?: string;
  isCustom?: boolean;
}

// 7 mốc giờ đại diện theo trục X (Cột thời gian từ sáng đến tối)
const TIME_SLOTS = [
  { id: 'morning_early', label: '06:00 - 08:00', startHour: 6, endHour: 8 },
  { id: 'morning_mid',   label: '08:00 - 10:00', startHour: 8, endHour: 10 },
  { id: 'morning_late',  label: '10:00 - 12:00', startHour: 10, endHour: 12 },
  { id: 'afternoon_mid', label: '14:00 - 16:00', startHour: 14, endHour: 16 },
  { id: 'afternoon_late',label: '16:00 - 18:00', startHour: 16, endHour: 18 },
  { id: 'evening_prime', label: '18:00 - 20:00', startHour: 18, endHour: 20 },
  { id: 'evening_late',  label: '20:00 - 22:00', startHour: 20, endHour: 22 },
];

export function getScheduleStatus(startTimeStr: string, endTimeStr?: string): {
  status: ScheduleStatus;
  label: string;
  badgeClass: string;
  timeDiffText: string;
} {
  const now = new Date().getTime();
  const start = new Date(startTimeStr).getTime();
  const end = endTimeStr ? new Date(endTimeStr).getTime() : start + 2 * 3600 * 1000;

  // 1. Đã qua thời gian (end time đã qua) -> Đã xong
  if (now >= end || (now > start && (now - start) > 2 * 3600 * 1000)) {
    return {
      status: 'completed',
      label: 'Đã xong',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-extrabold',
      timeDiffText: 'Đã hoàn thành',
    };
  }

  // 2. Gần tới (<24h)
  const diffMs = start - now;
  if (diffMs <= 24 * 3600 * 1000 && diffMs >= 0) {
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffMins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    const text = diffHours > 0 ? `Sau ${diffHours}h ${diffMins}m nữa` : `Sau ${diffMins} phút nữa`;
    return {
      status: 'urgent',
      label: 'Sắp tới (<24h)',
      badgeClass: 'bg-amber-100 text-amber-900 border-2 border-amber-400 font-black animate-pulse',
      timeDiffText: text,
    };
  }

  // 3. Chuẩn bị diễn ra (>24h)
  const days = Math.ceil(diffMs / (24 * 3600 * 1000));
  return {
    status: 'upcoming',
    label: 'Chuẩn bị diễn ra',
    badgeClass: 'bg-blue-100 text-[#1848FF] border-2 border-blue-400 font-bold',
    timeDiffText: `Còn ${days} ngày nữa`,
  };
}

interface PersonalCalendarProps {
  user: any;
  onOpenRegisterTournaments?: () => void;
}

export function PersonalCalendar({ user }: PersonalCalendarProps) {
  // Current view reference date (start of week)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [calendarViewMode, setCalendarViewMode] = useState<'xy_grid' | 'agenda'>('xy_grid');
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Raw events loaded from API & localStorage
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // New custom event form state
  const [newTitle, setNewTitle] = useState('');
  const [newSport, setNewSport] = useState<'BADMINTON' | 'PICKLEBALL' | 'TENNIS'>('BADMINTON');
  const [newVenue, setNewVenue] = useState('Sân Cầu Lông Kỳ Đồng, Thanh Khê');
  const [newCourt, setNewCourt] = useState('Sân 2');
  const [newDateStr, setNewDateStr] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [newStartHour, setNewStartHour] = useState(18);
  const [newDuration, setNewDuration] = useState(2);

  // Compute 7 days of the current week (Thứ 2 đến Chủ Nhật)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust to Monday
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday =
        d.getDate() === new Date().getDate() &&
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear();

      days.push({
        dayIndex: i,
        dayLabel: DAY_LABELS[i],
        date: d,
        dateFormatted: `${d.getDate() < 10 ? '0' + d.getDate() : d.getDate()}/${
          d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
        }`,
        isToday,
      });
    }
    return days;
  }, [currentDate]);

  // Load registered matches, tournaments, and localStorage custom events
  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();

      // 1. Fetch public matches & filter ones the user joined
      let fetchedMatches: any[] = [];
      try {
        const matchesRes = await matchesApi.getMatches();
        if (matchesRes && matchesRes.data) {
          fetchedMatches = matchesRes.data;
        }
      } catch (err) {
        console.warn('Could not fetch matches:', err);
      }

      // 2. Fetch tournament registrations
      let fetchedRegs: any[] = [];
      const uid = user?.id || (user as any)?._id;
      if (uid) {
        try {
          fetchedRegs = (await registrationsApi.getMyRegistrations(uid)) || [];
        } catch (err) {
          console.warn('Could not fetch registrations:', err);
        }
      }

      // 3. Load custom events from localStorage
      let storedCustomEvents: ScheduleEvent[] = [];
      try {
        const raw = localStorage.getItem('courtmate_personal_schedule');
        if (raw) {
          storedCustomEvents = JSON.parse(raw);
        }
      } catch (e) {
        console.warn('Could not read stored schedule:', e);
      }

      // 1. Tích hợp các kèo giao lưu (Matches) người dùng tham gia hoặc từ hệ thống
      let joinedMatchIds: string[] = [];
      try {
        const rawJoined = localStorage.getItem('courtmate_joined_matches');
        if (rawJoined) joinedMatchIds = JSON.parse(rawJoined);
      } catch {}

      const userMatches = fetchedMatches.filter((m) => {
        const mId = m.id || m._id;
        if (joinedMatchIds.includes(mId)) return true;
        if (!user?.id) return false;
        const uid = user.id || (user as any)._id;
        return (
          m.players?.some((p: any) => p.userId === uid || p.user?._id === uid || p.user?.id === uid) ||
          m.hostId === uid ||
          m.host?._id === uid ||
          m.host?.id === uid
        );
      });

      // Nếu chưa có kèo nào tự chọn, lấy 2 kèo giao lưu gần nhất trong tương lai của hệ thống hiển thị vào lịch
      const matchesToDisplay = userMatches.length > 0 ? userMatches : fetchedMatches.slice(0, 2);

      const matchEvents: ScheduleEvent[] = matchesToDisplay.map((m) => ({
        id: `match-${m.id || m._id}`,
        title: m.title || `Giao lưu ${m.sport}`,
        type: 'match' as ScheduleItemType,
        sport: m.sport || 'BADMINTON',
        venueName: m.venueName || 'Sân thể thao',
        courtNumber: m.courtNumber || 'Sân 1',
        address: m.venueAddress || m.district || 'Đà Nẵng',
        startTime: m.startTime,
        endTime: m.endTime || new Date(new Date(m.startTime).getTime() + 2 * 3600 * 1000).toISOString(),
        linkUrl: `/matches/${m.id || m._id}`,
        notes: m.notes || `Kèo giao lưu thể thao: ${m.title}`,
      }));

      // Convert tournament registrations into ScheduleEvents
      const tournamentEvents: ScheduleEvent[] = fetchedRegs.map((reg, idx) => {
        // Build realistic tournament game slot
        const tour = reg.tournament || {};
        const tStart = tour.startDate ? new Date(tour.startDate) : new Date(now.getTime() + (idx + 2) * 86400000);
        tStart.setHours(8, 0, 0, 0);
        const tEnd = new Date(tStart);
        tEnd.setHours(12, 0, 0, 0);

        return {
          id: `tour-${reg.id || reg._id || idx}`,
          title: reg.tournamentTitle || tour.title || `Giải đấu #${(reg.tournamentId || '').slice(-6) || 'CM'}`,
          type: 'tournament' as ScheduleItemType,
          sport: (tour.sport || 'BADMINTON') as any,
          venueName: tour.location || 'Sân Cầu lông Nhà văn hóa Lao động (02 Cách Mạng Tháng 8, Cẩm Lệ, Đà Nẵng)',
          courtNumber: 'Sân Trung Tâm',
          address: tour.city || 'Đà Nẵng',
          startTime: tStart.toISOString(),
          endTime: tEnd.toISOString(),
          linkUrl: `/ticket/${reg.tournamentId}`,
          notes: `VĐV: ${reg.playerName} ${reg.partnerName ? `& ${reg.partnerName}` : ''} • Hạng mục: ${reg.categoryName || 'Đơn nam'}`,
        };
      });

      // 4. Các sự kiện thời gian thực chuẩn hoá HOÀN TOÀN TRONG TƯƠNG LAI
      const todayAt18 = new Date(currentYear, currentMonth, currentDay, 18, 0, 0);
      const todayAt20 = new Date(currentYear, currentMonth, currentDay, 20, 0, 0);

      const tomorrowAt8 = new Date(currentYear, currentMonth, currentDay + 1, 8, 30, 0);
      const tomorrowAt10 = new Date(currentYear, currentMonth, currentDay + 1, 10, 30, 0);

      const inTwoDaysAt17 = new Date(currentYear, currentMonth, currentDay + 2, 17, 30, 0);
      const inTwoDaysAt19 = new Date(currentYear, currentMonth, currentDay + 2, 19, 0, 0);

      const inThreeDaysAt16 = new Date(currentYear, currentMonth, currentDay + 3, 16, 0, 0);
      const inThreeDaysAt18 = new Date(currentYear, currentMonth, currentDay + 3, 18, 0, 0);

      const baselineEvents: ScheduleEvent[] = [
        {
          id: 'base-today-badminton',
          title: 'Kèo giao lưu cầu lông đôi nam nữ (8 người)',
          type: 'match',
          sport: 'BADMINTON',
          venueName: 'Sân Cầu Lông Kỳ Đồng',
          courtNumber: 'Sân 3',
          address: 'Kỳ Đồng, Thanh Khê, Đà Nẵng',
          startTime: todayAt18.toISOString(),
          endTime: todayAt20.toISOString(),
          linkUrl: '/matches',
          notes: 'Dùng cầu Thành Công 77 đỏ. Anh em nhớ đến trước 15p khởi động!',
        },
        {
          id: 'base-tomorrow-pickleball',
          title: 'Kèo Pickleball solo & đôi - Nhóm Sông Hàn',
          type: 'match',
          sport: 'PICKLEBALL',
          venueName: 'CLB Pickleball Tiên Sơn',
          courtNumber: 'Sân 5',
          address: 'Hải Châu, Đà Nẵng',
          startTime: tomorrowAt8.toISOString(),
          endTime: tomorrowAt10.toISOString(),
          linkUrl: '/matches',
          notes: 'Bóng Franklin X-40 mới 100%. Chia đều tiền sân tại chỗ.',
        },
        {
          id: 'base-coach-training-session',
          title: 'Lịch tập HLV: Bộ pháp & smash cầu lông',
          type: 'training',
          sport: 'BADMINTON',
          venueName: 'Nhà thi đấu Tiên Sơn',
          courtNumber: 'Sân HLV',
          address: 'Hải Châu, Đà Nẵng',
          startTime: inTwoDaysAt17.toISOString(),
          endTime: inTwoDaysAt19.toISOString(),
          linkUrl: '/coaches',
          notes: 'Tập cùng HLV Nguyễn Minh Trí. Khởi động kỹ trước 15 phút.',
        },
        {
          id: 'base-weekend-tournament',
          title: 'Vòng loại Giải Cầu Lông Trẻ Mở Rộng 2026',
          type: 'tournament',
          sport: 'BADMINTON',
          venueName: 'Nhà Thi Đấu Thể Thao Hòa Xuân',
          courtNumber: 'Sân C1',
          address: 'Cẩm Lệ, Đà Nẵng',
          startTime: inThreeDaysAt16.toISOString(),
          endTime: inThreeDaysAt18.toISOString(),
          linkUrl: '/tournaments',
          notes: 'Thi đấu thể thức loại trực tiếp 3 hiệp 21 điểm.',
        },
      ];

      // Combine and eliminate duplicates by ID
      const allCombined = [
        ...matchEvents,
        ...tournamentEvents,
        ...storedCustomEvents,
        ...baselineEvents,
      ];

      const uniqueMap = new Map<string, ScheduleEvent>();
      for (const ev of allCombined) {
        if (!uniqueMap.has(ev.id)) {
          uniqueMap.set(ev.id, ev);
        }
      }

      setEvents(Array.from(uniqueMap.values()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
    const handleUpdate = () => {
      loadScheduleData();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('courtmate_schedule_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('courtmate_schedule_updated', handleUpdate);
    };
  }, [user]);

  // Navigate week
  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Add custom event to localStorage
  const handleCreateCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Vui lòng nhập tên buổi giao lưu/lịch tập!');
      return;
    }

    const [year, month, day] = newDateStr.split('-').map(Number);
    const start = new Date(year, month - 1, day, newStartHour, 0, 0);
    const end = new Date(year, month - 1, day, newStartHour + newDuration, 0, 0);

    const newEv: ScheduleEvent = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      type: 'training',
      sport: newSport,
      venueName: newVenue.trim(),
      courtNumber: newCourt.trim(),
      address: 'Đà Nẵng',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      isCustom: true,
      notes: 'Lịch trình cá nhân bạn tự lên kế hoạch.',
    };

    const updated = [newEv, ...events];
    setEvents(updated);

    try {
      const stored = JSON.parse(localStorage.getItem('courtmate_personal_schedule') || '[]');
      stored.push(newEv);
      localStorage.setItem('courtmate_personal_schedule', JSON.stringify(stored));
      toast.success('Đã thêm lịch trình cá nhân thành công!');
    } catch (err) {
      console.error(err);
    }

    setIsAddModalOpen(false);
    setNewTitle('');
  };

  // Delete custom event
  const handleDeleteCustomEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    try {
      const stored = JSON.parse(localStorage.getItem('courtmate_personal_schedule') || '[]');
      const filtered = stored.filter((e: any) => e.id !== id);
      localStorage.setItem('courtmate_personal_schedule', JSON.stringify(filtered));
      toast.success('Đã xóa buổi tập khỏi lịch trình.');
    } catch (err) {
      console.error(err);
    }
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  // Helper: Filtered list of events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Filter by Sport
      if (selectedSport !== 'ALL' && ev.sport !== selectedSport) return false;

      // Filter by Status
      if (statusFilter !== 'ALL') {
        const { status } = getScheduleStatus(ev.startTime, ev.endTime);
        if (statusFilter !== status) return false;
      }
      return true;
    });
  }, [events, selectedSport, statusFilter]);

  // Overall Statistics Counters
  const stats = useMemo(() => {
    let completed = 0;
    let urgent = 0;
    let upcoming = 0;

    for (const ev of events) {
      const { status } = getScheduleStatus(ev.startTime, ev.endTime);
      if (status === 'completed') completed++;
      else if (status === 'urgent') urgent++;
      else if (status === 'upcoming') upcoming++;
    }

    return { total: events.length, completed, urgent, upcoming };
  }, [events]);

  // Google Calendar Link generator
  const getGoogleCalendarUrl = (ev: ScheduleEvent) => {
    try {
      const start = new Date(ev.startTime);
      const end = new Date(ev.endTime);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      const formatTime = (d: Date) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
          d.getUTCMinutes()
        )}00Z`;

      const title = encodeURIComponent(`[CourtMate] ${ev.title}`);
      const details = encodeURIComponent(
        `${ev.notes || ''}\nBộ môn: ${ev.sport}\nSân: ${ev.venueName} ${ev.courtNumber || ''}\nXem tại CourtMate: ${
          window.location.origin
        }${ev.linkUrl || '/profile?tab=schedule'}`
      );
      const location = encodeURIComponent(`${ev.venueName}, ${ev.address || 'Đà Nẵng'}`);
      const dates = `${formatTime(start)}/${formatTime(end)}`;

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    } catch {
      return 'https://calendar.google.com';
    }
  };

  // Sport color helper
  const getSportBadgeColor = (sport: string) => {
    switch (sport) {
      case 'BADMINTON':
        return 'bg-blue-600 text-white';
      case 'PICKLEBALL':
        return 'bg-teal-600 text-white';
      case 'TENNIS':
        return 'bg-amber-500 text-black';
      default:
        return 'bg-purple-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* ──────────────── TOP CONTROL & STATS HEADER ──────────────── */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-black/10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#1848FF] text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-black tracking-tight">
                Lịch Trình Cá Nhân
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-2xl border-2 border-black flex items-center gap-1 shadow-xs">
              <button
                onClick={() => setCalendarViewMode('xy_grid')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  calendarViewMode === 'xy_grid'
                    ? 'bg-[#1848FF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-black'
                }`}
                title="Xem theo lịch tuần"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lịch tuần</span>
              </button>
              <button
                onClick={() => setCalendarViewMode('agenda')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  calendarViewMode === 'agenda'
                    ? 'bg-[#1848FF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-black'
                }`}
                title="Xem theo danh sách thời gian"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-black text-white hover:bg-slate-800 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#1848FF] flex items-center gap-1.5 cursor-pointer transition transform active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm lịch tập</span>
            </button>
          </div>
        </div>

        {/* 4 STATS PILLS: TỔNG QUAN, SẮP TỚI (<24H), CHUẨN BỊ DIỄN RA, ĐÃ XONG */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-50 border-2 border-black rounded-2xl p-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Tổng lịch trình</span>
              <Layers className="w-3.5 h-3.5 text-black" />
            </div>
            <strong className="text-2xl font-black text-black">{stats.total}</strong>
          </div>

          <div className="bg-amber-50 border-2 border-black rounded-2xl p-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Sắp tới (&lt;24h)</span>
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            </div>
            <strong className="text-2xl font-black text-amber-700">{stats.urgent}</strong>
          </div>

          <div className="bg-blue-50 border-2 border-black rounded-2xl p-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Chuẩn bị diễn ra</span>
              <CalendarIcon className="w-3.5 h-3.5 text-[#1848FF]" />
            </div>
            <strong className="text-2xl font-black text-[#1848FF]">{stats.upcoming}</strong>
          </div>

          <div className="bg-emerald-50 border-2 border-black rounded-2xl p-3.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider">Đã hoàn thành</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <strong className="text-2xl font-black text-emerald-700">{stats.completed}</strong>
          </div>
        </div>


        {/* TOOLBAR: WEEK NAVIGATION & FILTER CHIPS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Week Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100 transition cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl bg-white border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100 transition cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100 transition cursor-pointer"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs sm:text-sm font-black text-black ml-2">
              {weekDays[0].dateFormatted} - {weekDays[6].dateFormatted} / {weekDays[0].date.getFullYear()}
            </span>
          </div>

          {/* Filters: Sport & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] outline-none cursor-pointer hover:bg-slate-50"
            >
              <option value="ALL">Mọi bộ môn</option>
              <option value="BADMINTON">Cầu lông</option>
              <option value="PICKLEBALL">Pickleball</option>
              <option value="TENNIS">Tennis</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] outline-none cursor-pointer hover:bg-slate-50"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="urgent">Sắp tới (&lt;24h)</option>
              <option value="upcoming">Chuẩn bị diễn ra</option>
              <option value="completed">Đã xong</option>
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────── CALENDAR GRID: TRỤC X (CÁC THỨ TRONG TUẦN) & TRỤC Y (MỐC THỜI GIAN) ──────────────── */}
      {calendarViewMode === 'xy_grid' && (
        <div className="bg-white border-2 border-black rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* HEADER ROW: TRỤC X (CÁC NGÀY TRONG TUẦN) */}
              <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 pb-3 border-b-2 border-black text-center text-xs font-black">
                <div className="p-2 flex items-center justify-center text-slate-400 font-bold text-xs">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                {weekDays.map((dayInfo) => (
                  <div
                    key={dayInfo.dayIndex}
                    className={`p-2.5 rounded-2xl border-2 transition-all ${
                      dayInfo.isToday
                        ? 'bg-[#1848FF] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-slate-100 border-black/20 text-black'
                    }`}
                  >
                    <div className="text-xs font-black">{dayInfo.dayLabel}</div>
                    <div className={`text-[11px] font-bold mt-0.5 ${dayInfo.isToday ? 'text-blue-100' : 'text-slate-500'}`}>
                      {dayInfo.dateFormatted}
                    </div>
                  </div>
                ))}
              </div>

              {/* ROWS: TRỤC Y (CÁC MỐC THỜI GIAN THEO CHIỀU DỌC) */}
              <div className="divide-y divide-black/10">
                {TIME_SLOTS.map((slot) => {
                  return (
                    <div
                      key={slot.id}
                      className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 py-3 items-stretch hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Cột 1: Mốc giờ theo trục Y */}
                      <div className="flex flex-col justify-center items-center p-2 rounded-2xl bg-slate-50 border-2 border-black/20 text-center shadow-xs">
                        <strong className="text-xs font-black text-black">{slot.label.split(' - ')[0]}</strong>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">{slot.label.split(' - ')[1]}</span>
                      </div>

                      {/* 7 Ô tương ứng 7 ngày trong tuần (Trục X) cho mốc giờ này */}
                      {weekDays.map((dayInfo) => {
                        const slotEvents = filteredEvents.filter((ev) => {
                          const evDate = new Date(ev.startTime);
                          const isSameDay =
                            evDate.getDate() === dayInfo.date.getDate() &&
                            evDate.getMonth() === dayInfo.date.getMonth() &&
                            evDate.getFullYear() === dayInfo.date.getFullYear();
                          if (!isSameDay) return false;

                          const startH = evDate.getHours();
                          return startH >= slot.startHour && startH < slot.endHour;
                        });

                        return (
                          <div
                            key={dayInfo.dayIndex}
                            className={`min-h-[86px] rounded-2xl border-2 border-dashed p-1.5 flex flex-col gap-1.5 transition-all ${
                              slotEvents.length > 0
                                ? 'bg-white border-black/40 shadow-xs'
                                : 'border-black/10 bg-slate-50/30 hover:border-black/30'
                            }`}
                          >
                            {slotEvents.map((ev) => {
                              const { status, label, badgeClass } = getScheduleStatus(
                                ev.startTime,
                                ev.endTime
                              );
                              const start = new Date(ev.startTime);
                              const timeStr = `${start.getHours()}:${
                                start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes()
                              }`;

                              return (
                                <div
                                  key={ev.id}
                                  onClick={() => setSelectedEvent(ev)}
                                  className={`p-2 rounded-xl border-2 border-black text-left cursor-pointer transition transform hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_#000] ${
                                    status === 'completed'
                                      ? 'bg-slate-100 opacity-80'
                                      : status === 'urgent'
                                      ? 'bg-amber-100'
                                      : 'bg-white'
                                  }`}
                                >
                                  {/* Top row: Sport tag & time */}
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span
                                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${getSportBadgeColor(
                                        ev.sport
                                      )}`}
                                    >
                                      {ev.sport === 'BADMINTON'
                                        ? 'Cầu lông'
                                        : ev.sport === 'PICKLEBALL'
                                        ? 'Pickleball'
                                        : 'Tennis'}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-700">
                                      {timeStr}
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-[11px] font-black text-black line-clamp-1 leading-tight">
                                    {ev.title}
                                  </h4>

                                  {/* Venue */}
                                  <p className="text-[10px] font-bold text-slate-500 line-clamp-1 mt-0.5">
                                    {ev.venueName}
                                  </p>

                                  {/* Real-time Status Badge */}
                                  <div className="mt-1.5 flex items-center justify-between">
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block ${badgeClass}`}
                                    >
                                      {label}
                                    </span>
                                    {ev.type === 'tournament' && (
                                      <Trophy className="w-3 h-3 text-[#1848FF]" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── AGENDA / TIMELINE VIEW MODE ──────────────── */}
      {calendarViewMode === 'agenda' && (
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
            <h3 className="text-base font-black text-black">
              Danh Sách Lịch Trình Chi Tiết
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {filteredEvents.length} sự kiện
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold text-sm">
              Không có sự kiện nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents
                .slice()
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((ev) => {
                  const { status, label, badgeClass, timeDiffText } = getScheduleStatus(
                    ev.startTime,
                    ev.endTime
                  );
                  const start = new Date(ev.startTime);
                  const end = new Date(ev.endTime);
                  const dateStr = start.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });
                  const timeRangeStr = `${start.getHours()}:${
                    start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes()
                  } - ${end.getHours()}:${end.getMinutes() < 10 ? '0' + end.getMinutes() : end.getMinutes()}`;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="p-4 rounded-2xl border-2 border-black bg-white hover:bg-slate-50 shadow-[3px_3px_0px_0px_#000] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-xs ${
                            ev.type === 'tournament'
                              ? 'bg-purple-100 text-purple-700'
                              : ev.sport === 'PICKLEBALL'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ev.type === 'tournament' ? (
                            <Trophy className="w-6 h-6" />
                          ) : (
                            <Swords className="w-6 h-6" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${getSportBadgeColor(
                                ev.sport
                              )}`}
                            >
                              {ev.sport === 'BADMINTON'
                                ? 'Cầu lông'
                                : ev.sport === 'PICKLEBALL'
                                ? 'Pickleball'
                                : 'Tennis'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}>
                              {label}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              • {timeDiffText}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-black">{ev.title}</h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-black" />
                              {dateStr} ({timeRangeStr})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-black" />
                              {ev.venueName} {ev.courtNumber ? `(${ev.courtNumber})` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <a
                          href={getGoogleCalendarUrl(ev)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-slate-100 text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]"
                          title="Lưu vào Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Google Cal</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ──────────────── EVENT DETAILS MODAL ──────────────── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#000] relative space-y-6 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl border-2 border-black hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="space-y-2 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-md ${getSportBadgeColor(
                    selectedEvent.sport
                  )}`}
                >
                  {selectedEvent.sport === 'BADMINTON'
                    ? 'Cầu lông'
                    : selectedEvent.sport === 'PICKLEBALL'
                    ? 'Pickleball'
                    : 'Tennis'}
                </span>

                {(() => {
                  const { label, badgeClass } = getScheduleStatus(
                    selectedEvent.startTime,
                    selectedEvent.endTime
                  );
                  return (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                      {label}
                    </span>
                  );
                })()}
              </div>

              <h3 className="text-xl font-black text-black tracking-tight">
                {selectedEvent.title}
              </h3>
            </div>

            {/* Metadata Grid */}
            <div className="bg-slate-50 border-2 border-black rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-[#1848FF] shrink-0" />
                <div>
                  <strong className="text-black block font-black">Thời gian thi đấu:</strong>
                  <span className="text-slate-600 font-bold">
                    {new Date(selectedEvent.startTime).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="text-black block font-black">Khung giờ:</strong>
                  <span className="text-slate-600 font-bold">
                    {new Date(selectedEvent.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(selectedEvent.endTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <strong className="text-black block font-black">Địa điểm thi đấu:</strong>
                  <span className="text-slate-600 font-bold">
                    {selectedEvent.venueName} {selectedEvent.courtNumber ? `(${selectedEvent.courtNumber})` : ''} -{' '}
                    {selectedEvent.address}
                  </span>
                </div>
              </div>

              {selectedEvent.notes && (
                <div className="pt-2 border-t border-black/10">
                  <strong className="text-black block font-black mb-1">Ghi chú:</strong>
                  <p className="text-slate-600 font-medium italic">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {selectedEvent.isCustom ? (
                <button
                  onClick={() => handleDeleteCustomEvent(selectedEvent.id)}
                  className="px-4 py-2.5 rounded-2xl border-2 border-black bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa lịch tập này</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-slate-400">
                  * Tự động đồng bộ từ hệ thống
                </span>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {selectedEvent.linkUrl && (
                  <Link
                    href={selectedEvent.linkUrl}
                    className="px-4 py-2.5 rounded-2xl border-2 border-black bg-white hover:bg-slate-100 text-black text-xs font-black shadow-[2px_2px_0px_0px_#000] transition"
                  >
                    Xem chi tiết
                  </Link>
                )}
                <a
                  href={getGoogleCalendarUrl(selectedEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl border-2 border-black bg-[#1848FF] hover:bg-blue-700 text-white text-xs font-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lưu Google Calendar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: THÊM LỊCH TẬP / KÈO CÁ NHÂN ──────────────── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#000] relative space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1848FF]" />
                <h3 className="text-lg font-black text-black">Thêm Lịch Cá Nhân Mới</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl border-2 border-black hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomEvent} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Tên buổi tập / Kèo thi đấu</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Rèn luyện kỹ thuật đập cầu / Giao lưu cùng nhóm"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-slate-50 focus:bg-white text-black text-xs font-bold outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Môn thể thao</label>
                  <select
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-black bg-white text-black text-xs font-black outline-none shadow-[2px_2px_0px_0px_#000]"
                  >
                    <option value="BADMINTON">Cầu lông</option>
                    <option value="PICKLEBALL">Pickleball</option>
                    <option value="TENNIS">Tennis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Ngày thi đấu</label>
                  <input
                    type="date"
                    required
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white text-black text-xs font-black outline-none shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Giờ bắt đầu</label>
                  <select
                    value={newStartHour}
                    onChange={(e) => setNewStartHour(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-black bg-white text-black text-xs font-black outline-none shadow-[2px_2px_0px_0px_#000]"
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s.id} value={s.startHour}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Thời lượng</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-black bg-white text-black text-xs font-black outline-none shadow-[2px_2px_0px_0px_#000]"
                  >
                    <option value={1}>1 tiếng</option>
                    <option value={2}>2 tiếng</option>
                    <option value={3}>3 tiếng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Địa điểm & Sân</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="Tên sân"
                    className="col-span-2 px-3 py-2 rounded-xl border-2 border-black bg-white text-black text-xs font-bold outline-none shadow-[2px_2px_0px_0px_#000]"
                  />
                  <input
                    type="text"
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    placeholder="Sân số..."
                    className="col-span-1 px-3 py-2 rounded-xl border-2 border-black bg-white text-black text-xs font-bold outline-none shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-black bg-white hover:bg-slate-100 text-black text-xs font-black transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl border-2 border-black bg-[#1848FF] hover:bg-blue-700 text-white text-xs font-black shadow-[2px_2px_0px_0px_#000] transition cursor-pointer"
                >
                  Lưu vào lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
