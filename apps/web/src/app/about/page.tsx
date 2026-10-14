'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Trophy,
  Target,
  Zap,
  Shield,
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Activity,
  Flame,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// 7 Sáng Lập Viên CourtMate (Tập trung danh xưng, không nhồi nhét chức danh khô cứng)
const FOUNDERS = [
  {
    id: 'phuc',
    name: 'Hoàng Phúc',
    highlight: 'Trưởng nhóm dự án',
    tag: 'Cầu Lông & Pickleball',
    badge: 'Founder #01',
    color: 'from-blue-600 via-indigo-600 to-sky-500',
    number: '01',
  },
  {
    id: 'thinh',
    name: 'Xuân Thịnh',
    highlight: 'Kiến trúc hệ thống',
    tag: 'Công nghệ & Nền tảng',
    badge: 'Founder #02',
    color: 'from-sky-500 via-blue-600 to-indigo-700',
    number: '02',
  },
  {
    id: 'huan',
    name: 'Anh Huân',
    highlight: 'Vận hành thực địa',
    tag: 'Cộng đồng & Sự kiện',
    badge: 'Founder #03',
    color: 'from-indigo-600 via-purple-600 to-blue-700',
    number: '03',
  },
  {
    id: 'dong',
    name: 'Hà Đông',
    highlight: 'Phát triển cộng đồng',
    tag: 'Truyền thông & Kết nối',
    badge: 'Founder #04',
    color: 'from-blue-500 via-teal-500 to-indigo-600',
    number: '04',
  },
  {
    id: 'duan',
    name: 'Hoàng Duẫn',
    highlight: 'Hợp tác & Đối tác',
    tag: 'Mạng lưới sân bãi',
    badge: 'Founder #05',
    color: 'from-cyan-600 via-blue-600 to-sky-700',
    number: '05',
  },
  {
    id: 'ngan',
    name: 'Thảo Ngân',
    highlight: 'Trải nghiệm vận động viên',
    tag: 'Sản phẩm & Tương tác',
    badge: 'Founder #06',
    color: 'from-indigo-500 via-sky-600 to-blue-600',
    number: '06',
  },
  {
    id: 'thao',
    name: 'Phương Thảo',
    highlight: 'Nhận diện & Thiết kế',
    tag: 'Giao diện & Mỹ thuật',
    badge: 'Founder #07',
    color: 'from-blue-600 via-indigo-600 to-violet-600',
    number: '07',
  },
];

const METRICS = [
  {
    value: '50+',
    label: 'Cụm sân xác thực',
    desc: 'Khảo sát thực địa trên toàn địa bàn TP. Đà Nẵng',
    icon: <MapPin className="w-5 h-5 text-[#1E5AA8]" />,
  },
  {
    value: '13+',
    label: 'Giải đấu quy chuẩn',
    desc: 'Hệ thống vận hành số hóa, cập nhật bảng đấu real-time',
    icon: <Trophy className="w-5 h-5 text-amber-500" />,
  },
  {
    value: '< 3 Phút',
    label: 'Ghép kèo nhanh tức thì',
    desc: 'Thuật toán tìm đối thủ đúng trình độ ELO quanh bạn',
    icon: <Zap className="w-5 h-5 text-sky-500" />,
  },
  {
    value: '100%',
    label: 'Vé điện tử QR',
    desc: 'Check-in thi đấu minh bạch, không cần giấy tờ',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  },
];

const VALUES = [
  {
    icon: <Flame className="w-6 h-6 text-orange-500" />,
    title: 'Nhiệt Huyết Thể Thao',
    desc: 'Xuất phát từ tình yêu thuần khiết với từng đường cầu, cú đập bóng của giới thể thao phong trào.',
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    title: 'Tức Thì & Tiện Lợi',
    desc: 'Triệt tiêu hoàn toàn sự chờ đợi: tìm sân và ghép đối thủ chỉ với một chạm duy nhất trên điện thoại.',
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-500" />,
    title: 'Minh Bạch & Tôn Trọng',
    desc: 'Đánh giá cấp độ trung thực, chi phí công khai tại chỗ, tạo sân chơi văn minh và công bằng.',
  },
  {
    icon: <Activity className="w-6 h-6 text-[#1E5AA8]" />,
    title: 'Đổi Mới Công Nghệ',
    desc: 'Số hóa giải đấu, cấp mã VĐV tự động và phát triển xếp hạng ELO chuẩn xác theo phong độ.',
  },
];

export default function AboutPage() {
  const container = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const [activeFounder, setActiveFounder] = useState<number | null>(null);

  useGSAP(
    () => {
      // 1. Reveal header
      gsap.fromTo(
        '.reveal-hero',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }
      );

      // 2. Metrics counter entrance
      gsap.fromTo(
        '.metric-box',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.metrics-strip',
            start: 'top 85%',
          },
        }
      );

      // 3. Sections reveal
      const sections = gsap.utils.toArray('.reveal-block');
      sections.forEach((section: any) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} className="bg-[#F8FAFC] min-h-screen text-[#101828] overflow-hidden selection:bg-[#1E5AA8]/20 selection:text-[#1E5AA8]">
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#1E5AA8]/10 via-[#0077FF]/5 to-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="reveal-hero inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E5AA8]/10 border border-[#1E5AA8]/20 text-[#1E5AA8] text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#1E5AA8]" />
          <span>Câu chuyện CourtMate</span>
        </div>

        <h1 className="reveal-hero text-4xl sm:text-6xl lg:text-7xl font-black text-[#101828] tracking-tight leading-[1.1] max-w-4xl mb-6">
          Sinh ra từ sân đấu,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] via-[#0077FF] to-sky-600">
            Dành cho người yêu thể thao.
          </span>
        </h1>

        <p className="reveal-hero text-base sm:text-xl text-[#475467] max-w-2xl font-medium leading-relaxed mb-8">
          Chúng tôi không xây dựng một phần mềm trong phòng máy lạnh. CourtMate được tạo nên từ chính những buổi chiều gọi cháy máy tìm sân và những lần bỏ lỡ đam mê vì thiếu người ghép cặp.
        </p>

        {/* Dynamic Context Buttons */}
        <div className="reveal-hero flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/tournaments"
            className="px-7 py-3.5 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#1E5AA8]/25 hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Khám phá 13+ Giải đấu</span>
          </Link>

          <Link
            href="/matches"
            className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-bold text-sm sm:text-base shadow-xs hover:border-[#1E5AA8]/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#1E5AA8]" />
            <span>Kèo giao lưu hôm nay</span>
          </Link>
        </div>
      </section>

      {/* ─── REAL DATA METRICS STRIP ─── */}
      <section className="metrics-strip max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {METRICS.map((item, idx) => (
              <div key={idx} className="metric-box flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#101828] tracking-tight mb-1">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  {item.label}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BRAND STORY: FROM PAIN POINT TO SOLUTION ─── */}
      <section className="reveal-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-200/80 p-8 sm:p-14 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1E5AA8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 text-xs font-bold uppercase tracking-wider">
                <span>Khởi nguồn từ thực tế</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] tracking-tight leading-snug">
                "Tại sao tìm một giờ chơi thể thao lại khó khăn đến thế?"
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                <p>
                  Tại Đà Nẵng, làn sóng người chơi <strong>Cầu lông</strong> và <strong>Pickleball</strong> bùng nổ mạnh mẽ chưa từng có. Thế nhưng, đằng sau sự hứng khởi đó là vô vàn phiền toái:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <p className="text-xs text-slate-700">
                      <strong>Tìm sân thủ công:</strong> Gọi điện thoại từng chủ sân hoặc lướt các bài đăng trôi mất hút trong nhóm Facebook/Zalo.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <p className="text-xs text-slate-700">
                      <strong>Lệch trình độ:</strong> Ghép đội ngẫu nhiên dẫn đến chênh lệch thể lực, giảm nhiệt huyết của cả buổi giao lưu.
                    </p>
                  </div>
                </div>
                <p>
                  Nhóm 7 người chúng tôi quyết định khảo sát thực tế <strong>hơn 50 cụm sân</strong> khắp Hải Châu, Sơn Trà, Cẩm Lệ, Ngũ Hành Sơn... và kết nối cùng hơn <strong>11 Ban tổ chức giải đấu</strong>.
                </p>
                <p>
                  <strong>CourtMate</strong> chính thức thành hình: Một hệ điều hành On-demand — nơi bạn tìm được người chơi vừa tầm chỉ trong 3 phút, giữ slot minh bạch và tự động hóa toàn diện quy trình giải đấu.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 group bg-slate-900 aspect-4/3 sm:aspect-square flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80"
                  alt="CourtMate Danang Sports"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Đà Nẵng • 2026</span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    Mạng lưới thể thao kết nối tức thì
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Cầu lông, Pickleball & các giải đấu phong trào hàng đầu miền Trung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDERS: EXPANDABLE NETFLIX-STYLE POSTER CARDS ─── */}
      <section className="reveal-block py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1E5AA8]/30 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E5AA8]/20 border border-[#1E5AA8]/40 text-sky-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5" />
              <span>Đội ngũ sáng lập</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
              Những Người Tạo Nên CourtMate
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Bảy thành viên sáng lập — Cùng chung một niềm tin mạnh mẽ vào tương lai số hóa của thể thao Việt Nam.
            </p>
          </div>

          {/* NETFLIX-STYLE ACCORDION / EXPANDING POSTER STRIP (Desktop & Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 lg:gap-3">
            {FOUNDERS.map((founder, idx) => {
              const isActive = activeFounder === idx;

              return (
                <div
                  key={founder.id}
                  onMouseEnter={() => setActiveFounder(idx)}
                  onMouseLeave={() => setActiveFounder(null)}
                  className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out border border-white/10 ${
                    isActive
                      ? 'lg:col-span-2 shadow-2xl shadow-[#1E5AA8]/40 border-sky-400/60 ring-2 ring-sky-400/40 -translate-y-2'
                      : 'hover:border-white/30 hover:-translate-y-1'
                  }`}
                  style={{
                    minHeight: '340px',
                  }}
                >
                  {/* Poster Background with Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${founder.color} opacity-90 transition-opacity duration-500 group-hover:opacity-100`} />
                  
                  {/* Dark glass overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/40 transition-colors duration-500" />

                  {/* Sport Graphic Watermark Number */}
                  <div className="absolute top-4 right-4 text-5xl font-black text-white/10 select-none group-hover:text-white/25 transition-colors">
                    {founder.number}
                  </div>

                  {/* Poster Card Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between z-10">
                    {/* Top: Avatar Monogram Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        {founder.name.split(' ').pop()?.charAt(0) || 'C'}
                      </div>

                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/40 text-sky-200 border border-white/15 backdrop-blur-sm">
                        {founder.badge}
                      </span>
                    </div>

                    {/* Bottom: Name & Expandable Details */}
                    <div className="mt-auto">
                      <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>{founder.tag}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {founder.name}
                      </h3>

                      {/* Expanded Section on Hover */}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          isActive
                            ? 'max-h-24 opacity-100 pt-2.5'
                            : 'max-h-0 lg:max-h-0 opacity-0 lg:opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-hover:pt-2.5'
                        }`}
                      >
                        <p className="text-xs text-slate-200 font-medium leading-relaxed bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/15">
                          {founder.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1E5AA8]" />
              <span>Cùng hàng ngàn vận động viên và các đơn vị đồng hành tại Đà Nẵng</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─── CORE VALUES ─── */}
      <section className="reveal-block py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] text-xs font-bold uppercase tracking-wider mb-3">
            <span>Tiêu chuẩn vận hành</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#101828] tracking-tight">
            Giá Trị Định Hình CourtMate
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Mỗi tính năng trên nền tảng đều phục vụ một mục đích duy nhất: Mang lại trải nghiệm thể thao trọn vẹn nhất cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((val, idx) => (
            <div
              key={idx}
              className="p-8 rounded-[32px] bg-white border border-slate-200/90 hover:border-[#1E5AA8]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-xs">
                {val.icon}
              </div>
              <h4 className="text-lg font-bold text-[#101828] mb-2">{val.title}</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SMART CONTEXTUAL FINAL CTA (NO REDUNDANT LOGIN) ─── */}
      <section className="reveal-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-[36px] sm:rounded-[44px] bg-gradient-to-br from-[#1E5AA8] via-[#154687] to-slate-950 p-8 sm:p-16 text-white text-center shadow-2xl overflow-hidden">
          {/* Subtle Decorative court lines */}
          <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-amber-300 shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>

            {/* Smart Conditional Messaging based on Authentication */}
            {isAuthenticated && user ? (
              <>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã đăng nhập với tư cách: {user.name}</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Chào mừng bạn, {user.name}! Sẵn sàng cho trận đấu mới?
                </h2>

                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  Bạn đã là một phần của cộng đồng CourtMate. Hãy chọn giải đấu đang mở hoặc tìm một kèo đấu gần bạn để xách vợt ra sân ngay!
                </p>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/tournaments"
                    className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#1E5AA8] font-bold text-sm sm:text-base shadow-xl hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Xem danh sách giải đấu</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/matches"
                    className="px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm sm:text-base backdrop-blur-md hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Ghép kèo giao lưu</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Sẵn Sàng Ra Sân Cùng CourtMate?
                </h2>

                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  Tạo tài khoản chỉ trong 30 giây để nhận thông báo giải đấu sớm nhất, lưu các kèo đấu yêu thích và giữ slot thi đấu trực tiếp.
                </p>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#1E5AA8] font-bold text-sm sm:text-base shadow-xl hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Tạo tài khoản miễn phí</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/tournaments"
                    className="px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm sm:text-base backdrop-blur-md hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Xem giải đấu trước</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
