'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import {
  Trophy,
  Zap,
  Shield,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Activity,
  Flame,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);
}

// 7 Sáng Lập Viên CourtMate — Bảng màu Chống AI-Slop (Deep Athletic Tones, True to Sports & Visual Design)
const FOUNDERS = [
  {
    id: 'phuc',
    name: 'Hoàng Phúc',
    role: 'Trưởng nhóm dự án',
    tag: 'Cầu lông & Pickleball',
    badge: 'Founder #01',
    letter: 'P',
    number: '01',
    bgGradient: 'from-[#0B1E3F] via-[#0E2856] to-[#08152B]',
    borderHover: 'group-hover:border-sky-400/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'thinh',
    name: 'Xuân Thịnh',
    role: 'Kiến trúc hệ thống',
    tag: 'Công nghệ & Nền tảng',
    badge: 'Founder #02',
    letter: 'T',
    number: '02',
    bgGradient: 'from-[#082846] via-[#0A3359] to-[#061C33]',
    borderHover: 'group-hover:border-cyan-400/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'huan',
    name: 'Anh Huân',
    role: 'Vận hành thực địa',
    tag: 'Cộng đồng & Sự kiện',
    badge: 'Founder #03',
    letter: 'H',
    number: '03',
    bgGradient: 'from-[#17163B] via-[#201D4F] to-[#11102E]',
    borderHover: 'group-hover:border-indigo-400/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'dong',
    name: 'Hà Đông',
    role: 'Phát triển kết nối',
    tag: 'Truyền thông & Kết nối',
    badge: 'Founder #04',
    letter: 'Đ',
    number: '04',
    bgGradient: 'from-[#062F38] via-[#0A3D46] to-[#042127]',
    borderHover: 'group-hover:border-emerald-400/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'duan',
    name: 'Hoàng Duẫn',
    role: 'Hợp tác & Đối tác',
    tag: 'Mạng lưới sân bãi',
    badge: 'Founder #05',
    letter: 'D',
    number: '05',
    bgGradient: 'from-[#092B4F] via-[#0C3866] to-[#061E38]',
    borderHover: 'group-hover:border-sky-400/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'ngan',
    name: 'Thảo Ngân',
    role: 'Trải nghiệm VĐV',
    tag: 'Sản phẩm & Tương tác',
    badge: 'Founder #06',
    letter: 'N',
    number: '06',
    bgGradient: 'from-[#102447] via-[#15315C] to-[#0B1A35]',
    borderHover: 'group-hover:border-blue-400/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    id: 'thao',
    name: 'Phương Thảo',
    role: 'Nhận diện & Thiết kế',
    tag: 'Giao diện & Mỹ thuật',
    badge: 'Founder #07',
    letter: 'T',
    number: '07',
    bgGradient: 'from-[#141A42] via-[#1E255C] to-[#0E1333]',
    borderHover: 'group-hover:border-purple-400/60',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
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
    label: 'Giải đấu đồng hành',
    desc: 'Số hóa quản lý bảng đấu, tỉ số và xếp hạng real-time',
    icon: <Trophy className="w-5 h-5 text-amber-500" />,
  },
  {
    value: '< 3 Phút',
    label: 'Ghép đối thủ tức thì',
    desc: 'Thuật toán tìm bạn cùng sở thích đúng trình độ ELO',
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
    icon: <Flame className="w-6 h-6 text-amber-500" />,
    badge: 'Nhiệt huyết',
    title: 'Đam Mê Thể Thao Phong Trào',
    desc: 'Khởi nguồn từ tình yêu với từng đường cầu, cú smash và nhịp thở sôi động trên sân mỗi chiều tan ca.',
  },
  {
    icon: <Zap className="w-6 h-6 text-[#1E5AA8]" />,
    badge: 'Tốc độ',
    title: 'On-demand & Tức Thì',
    desc: 'Triệt tiêu cảm giác chờ đợi tìm người chơi. Một chạm mở app là có kèo sẵn sàng cùng bạn ra sân.',
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-500" />,
    badge: 'Uy tín',
    title: 'Công Bằng & Tôn Trọng',
    desc: 'Phân loại trình độ trung thực, minh bạch chi phí thuê sân và thúc đẩy tinh thần thể thao văn minh.',
  },
  {
    icon: <Activity className="w-6 h-6 text-indigo-600" />,
    badge: 'Số hóa',
    title: 'Tiêu Chuẩn Công Nghệ',
    desc: 'Đưa quy trình quản lý giải đấu chuyên nghiệp đến mọi giải phong trào: cấp mã VĐV, bốc thăm và vé điện tử.',
  },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  useGSAP(
    () => {
      // 1. Initialize GSAP ScrollSmoother (matching HomePage standard)
      let smoother: ScrollSmoother | null = null;
      try {
        smoother = ScrollSmoother.create({
          wrapper: '#about-smooth-wrapper',
          content: '#about-smooth-content',
          smooth: 1.15,
          effects: true,
          smoothTouch: 0.1,
        });
        smoother.scrollTop(0);
      } catch (e) {
        console.warn('ScrollSmoother notice:', e);
      }

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      // 2. Reveal Hero Header
      gsap.fromTo(
        '.reveal-hero',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out' }
      );

      // 3. Metrics Strip Animation
      gsap.fromTo(
        '.metric-box',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.metrics-strip',
            start: 'top 85%',
          },
        }
      );

      // 4. Reveal Blocks
      const sections = gsap.utils.toArray('.reveal-block');
      sections.forEach((section: any) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      return () => {
        if (smoother) smoother.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      id="about-smooth-wrapper"
      ref={containerRef}
      className="bg-[#F8FAFC] text-[#101828] selection:bg-[#1E5AA8]/20 selection:text-[#1E5AA8] w-full"
    >
      <div id="about-smooth-content" className="w-full">
        {/* ─── HERO SECTION ─── */}
        <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Subtle natural athletic ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-[#1E5AA8]/10 via-[#0077FF]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="reveal-hero inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E5AA8]/10 border border-[#1E5AA8]/20 text-[#1E5AA8] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#1E5AA8]" />
            <span>Hành trình kiến tạo CourtMate</span>
          </div>

          <h1 className="reveal-hero text-4xl sm:text-6xl lg:text-7xl font-black text-[#101828] tracking-tight leading-[1.15] max-w-4xl mb-6">
            Sinh ra từ sân đấu,<br />
            <span className="text-[#1E5AA8]">
              Dành cho người yêu thể thao.
            </span>
          </h1>

          <p className="reveal-hero text-base sm:text-lg text-[#475467] max-w-2xl font-normal leading-relaxed mb-8">
            CourtMate là nền tảng kết nối thể thao On-demand tiên phong tại miền Trung. Chúng tôi giúp người chơi tìm đối thủ đúng trình độ tức thì và tự động hóa toàn diện quy trình tổ chức giải đấu.
          </p>

          {/* Action Buttons */}
          <div className="reveal-hero flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tournaments"
              className="px-7 py-3.5 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#1E5AA8]/25 hover:shadow-xl hover:scale-105 active:scale-100 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Khám phá các giải đấu</span>
            </Link>

            <Link
              href="/matches"
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-bold text-sm sm:text-base shadow-xs hover:border-[#1E5AA8]/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#1E5AA8]" />
              <span>Tìm kèo giao lưu</span>
            </Link>
          </div>
        </section>

        {/* ─── METRICS STRIP ─── */}
        <section className="metrics-strip max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {METRICS.map((item, idx) => (
                <div key={idx} className="metric-box flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-[#1E5AA8]">
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

        {/* ─── PROBLEM & SOLUTION STORY ─── */}
        <section className="reveal-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-200/80 p-8 sm:p-14 shadow-sm overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#1E5AA8] border border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <span>Giải pháp cho thể thao phong trào</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-[#101828] tracking-tight leading-snug">
                  "Tại sao tìm một buổi chơi thể thao lại mất nhiều thời gian đến vậy?"
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  <p>
                    Tại Đà Nẵng, làn sóng người chơi <strong>Cầu lông</strong> và <strong>Pickleball</strong> bùng nổ mạnh mẽ. Nhưng việc tìm người ghép cặp và giữ sân vẫn phụ thuộc vào những nhóm chat tự phát, dễ dẫn đến lệch trình độ hoặc trôi mất thông tin.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#1E5AA8] mt-2 shrink-0" />
                      <p className="text-xs text-slate-700">
                        <strong>Ghép cặp ELO chuẩn xác:</strong> Lọc theo cấp độ Người mới, Trung bình, Khá đến Chuyên nghiệp để đảm bảo trận đấu luôn kịch tính.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <p className="text-xs text-slate-700">
                        <strong>Check-in QR tự động:</strong> Tham gia giải đấu và giữ slot thi đấu tức thì qua vé điện tử ngay trên điện thoại.
                      </p>
                    </div>
                  </div>
                  <p>
                    Đội ngũ 7 thành viên sáng lập CourtMate quyết định khảo sát thực tế <strong>hơn 50 cụm sân</strong> và số hóa quy trình tổ chức cho hàng chục giải thi đấu phong trào tại địa phương.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 group bg-slate-900 aspect-4/3 sm:aspect-square flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80"
                    alt="CourtMate Danang Sports"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Đà Nẵng • 2026</span>
                    </div>
                    <h4 className="text-lg font-black text-white">
                      Mạng lưới kết nối thể thao tức thì
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

        {/* ─── FOUNDERS SECTION (APPLYING CODE INTERACTION FROM IMAGE 1) ─── */}
        <section className="reveal-block py-20 bg-[#061226] text-white relative overflow-hidden">
          {/* Subtle Ambient Glows - Deep Court Atmosphere */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1E5AA8]/20 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E5AA8]/25 border border-[#1E5AA8]/40 text-sky-300 text-xs font-bold uppercase tracking-wider mb-4">
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

            {/* 7 FOUNDER CARDS ROW (Exact visual representation from Image 2 + Interactions from Image 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
              {FOUNDERS.map((founder) => (
                <div
                  key={founder.id}
                  className={`founder-card group relative rounded-[28px] overflow-hidden cursor-pointer border border-white/10 ${founder.borderHover} hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-400 flex flex-col justify-between`}
                  style={{ minHeight: '380px' }}
                >
                  {/* Background Card Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${founder.bgGradient} opacity-95 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-300" />

                  {/* Top Watermark Number (Sports jersey number aesthetic) */}
                  <div className="absolute top-4 right-4 text-5xl font-black text-white/5 select-none pointer-events-none group-hover:text-white/15 transition-colors">
                    {founder.number}
                  </div>

                  {/* ─── CARD TOP CONTENT ─── */}
                  <div className="relative p-5 z-10">
                    <div className="flex items-center justify-between">
                      {/* Profile Image / Monogram with SVG (Applies .profile-image > svg stroke rule) */}
                      <div className="profile-image w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-white text-base shadow-sm group-hover:scale-105 group-hover:border-sky-400/50 transition-all duration-300">
                        <span className="select-none">{founder.letter}</span>
                      </div>

                      {/* Badge Founder #XX */}
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 backdrop-blur-sm group-hover:text-white group-hover:border-white/20 transition-colors">
                        {founder.badge}
                      </span>
                    </div>
                  </div>

                  {/* ─── CARD BOTTOM CONTENT (Applies card-content title slide & hover reveal) ─── */}
                  <div className="card-content relative p-5 z-10 mt-auto">
                    {/* Subtle Indicator & Sport Tag */}
                    <div className="text-[10px] font-bold text-sky-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      <span className="line-clamp-1">{founder.tag}</span>
                    </div>

                    {/* Founder Name */}
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug group-hover:text-sky-200 transition-colors">
                      {founder.name}
                    </h3>

                    {/* Highlight Role Reveal: transforms from translateY(16px), opacity 0 -> 1 on hover */}
                    <div className="card-content-desc">
                      <div className="mt-2.5 pt-2.5 border-t border-white/15 flex items-center gap-2">
                        <div className="profile-image shrink-0 text-white group-hover:text-sky-300">
                          {founder.icon}
                        </div>
                        <p className="text-xs text-slate-200 font-medium leading-tight">
                          {founder.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Đồng hành cùng hơn 50+ sân đấu và các đơn vị đối tác tại TP. Đà Nẵng</span>
              </p>
            </div>
          </div>
        </section>

        {/* ─── CORE VALUES ─── */}
        <section className="reveal-block py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E5AA8]/10 text-[#1E5AA8] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Tiêu chuẩn CourtMate</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#101828] tracking-tight">
              Giá Trị Định Hình Nền Tảng
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Mỗi tính năng đều được tối ưu hóa để người chơi thể thao tiết kiệm thời gian và thăng hoa phong độ trên sân.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, idx) => (
              <div
                key={idx}
                className="p-8 rounded-[32px] bg-white border border-slate-200/90 hover:border-[#1E5AA8]/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-xs">
                    {val.icon}
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                    {val.badge}
                  </div>
                  <h4 className="text-lg font-bold text-[#101828] mb-2">{val.title}</h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CALL TO ACTION SECTION ─── */}
        <section className="reveal-block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="relative rounded-[36px] sm:rounded-[44px] bg-gradient-to-br from-[#1E5AA8] via-[#154687] to-slate-950 p-8 sm:p-16 text-white text-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-amber-300 shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>

              {isAuthenticated && user ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã đăng nhập với tư cách: {user.name}</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Chào mừng bạn, {user.name}! Sẵn sàng ra sân hôm nay?
                  </h2>

                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    Cộng đồng CourtMate luôn có những giải đấu sôi động và kèo giao lưu chờ đón bạn.
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
                    Đăng ký tài khoản trong 30 giây để nhận thông báo giải đấu mới nhất và kết nối cùng cộng đồng người chơi Cầu lông & Pickleball tại địa phương.
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
                      <span>Khám phá giải đấu</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
