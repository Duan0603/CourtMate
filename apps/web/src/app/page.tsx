'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard,
  QrCode,
  Flame
} from 'lucide-react';
import { SportType, Tournament } from '@courtmate/shared';
import { tournamentsApi } from '../lib/tournaments.api';
import { TournamentCard } from '../components/tournaments/TournamentCard';

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [activeSport, setActiveSport] = useState<SportType | 'ALL'>('ALL');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const filters: any = {};
        if (activeSport !== 'ALL') filters.sport = activeSport;
        const res = await tournamentsApi.getTournaments(filters);
        setTournaments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeSport]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (city) params.append('city', city);
    if (activeSport !== 'ALL') params.append('sport', activeSport);
    router.push(`/tournaments?${params.toString()}`);
  };

  const sports = [
    { type: 'ALL', name: 'Tất cả môn', icon: '🔥' },
    { type: SportType.BADMINTON, name: 'Cầu lông', icon: '🏸' },
    { type: SportType.PICKLEBALL, name: 'Pickleball', icon: '🏓' },
    { type: SportType.TENNIS, name: 'Quần vợt', icon: '🎾' },
    { type: SportType.FOOTBALL, name: 'Bóng đá mini', icon: '⚽' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#00102F] via-[#001B4B] to-[#00102F] text-white pt-20 pb-28">
        {/* Abstract background decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-court-orange/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-court-orange mb-6 shadow-xs animate-pulse">
              <Flame className="w-4 h-4 text-court-orange" />
              <span>Hơn 120+ giải đấu thể thao phong trào đang diễn ra</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
              Tìm Đối Thủ On-Demand. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-blue-400 to-court-orange">
                Chinh Phục Giải Đấu.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Nền tảng thể thao kết nối người chơi tức thì, đặt sân nhanh chóng và tham gia thi đấu chuyên nghiệp với hệ thống xếp hạng DUPR & VĐV tiêu chuẩn.
            </p>

            {/* Desktop Hero Search Bar */}
            <div className="mt-10 p-2 sm:p-2.5 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-full border border-white/20 shadow-2xl max-w-3xl mx-auto">
              <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                  <Search className="w-5 h-5 text-slate-300 shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm tên giải đấu, từ khóa..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-transparent text-white placeholder:text-slate-400 text-sm focus:outline-none"
                  />
                </div>

                <div className="hidden sm:block w-[1px] h-8 bg-white/20" />

                <div className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto">
                  <MapPin className="w-4 h-4 text-court-orange shrink-0" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent text-sm text-white focus:outline-none cursor-pointer [&>option]:text-navy"
                  >
                    <option value="">Tất cả địa điểm</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Ha Noi">Hà Nội</option>
                    <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary hover:bg-primary-light text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition transform hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm kiếm</span>
                </button>
              </form>
            </div>

            {/* Sports Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {sports.map((sport) => {
                const isActive = activeSport === sport.type;
                return (
                  <button
                    key={sport.type}
                    onClick={() => setActiveSport(sport.type as any)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-navy shadow-md scale-105'
                        : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <span>{sport.icon}</span>
                    <span>{sport.name}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Featured Tournaments Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              <span>Đang mở đăng ký</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Giải Đấu Nổi Bật Mới Nhất
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Các giải đấu thể thao phong trào và bán chuyên quy mô hấp dẫn trên toàn quốc
            </p>
          </div>

          <Link
            href="/tournaments"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition group"
          >
            <span>Xem tất cả giải đấu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy">Không tìm thấy giải đấu phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1">Hãy thử đổi môn thể thao hoặc khu vực lọc</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.slice(0, 3).map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </section>

      {/* Value Pillars / Feature Highlights */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-navy">
              Trải Nghiệm Thể Thao Đẳng Cấp Cùng CourtMate
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Đồng bộ hoàn hảo giữa vận động viên, ban tổ chức và chủ sân thể thao
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">On-Demand Matchmaking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tìm bạn chơi thể thao và ghép cặp thi đấu theo vị trí gần bạn tức thì, đồng bộ trình độ thi đấu (DUPR / UTR / Ranking).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-court-orange/15 text-court-orange flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Thanh Toán Trực Tuyến</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tích hợp cổng thanh toán bảo mật PayOS, MoMo, VNPay. Nhận xác nhận đăng ký giải đấu tức thì qua SMS và Email.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Vé Điện Tử & Check-in QR</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Vận động viên nhận vé QR trực tuyến để làm thủ tục điểm danh tại sân nhanh chóng trong vài giây, loại bỏ thủ tục giấy tờ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA For Organizers */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Bạn Là Ban Tổ Chức Giải Đấu?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            CourtMate cung cấp giải pháp trọn gói: thu lệ phí thi đấu, chia bảng tự động, phân chia ca sân và kết nối truyền thông đến hàng chục nghìn VĐV.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tournaments/create"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-navy font-bold text-sm hover:bg-slate-100 transition shadow-lg"
            >
              Đăng ký tổ chức giải đấu
            </Link>
            <Link
              href="/organizer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary-dark/80 text-white font-bold text-sm border border-white/30 hover:bg-primary-deep transition"
            >
              Xem giao diện quản lý giải
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
