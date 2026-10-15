'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Trophy,
  Users,
  ShieldCheck,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

// ─── 7 FOUNDERS DATA ────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    name: 'Hoàng Phúc',
    role: 'Product Lead',
    task: 'Định hướng sản phẩm & trải nghiệm người chơi',
    letter: 'P',
    color: 'bg-[#1E5AA8]',
  },
  {
    name: 'Xuân Thịnh',
    role: 'Technical Lead',
    task: 'Kiến trúc hệ thống, API & bảo mật dữ liệu',
    letter: 'T',
    color: 'bg-emerald-600',
  },
  {
    name: 'Anh Huân',
    role: 'Field Operations',
    task: 'Khảo sát thực địa & kết nối các cụm sân',
    letter: 'H',
    color: 'bg-indigo-600',
  },
  {
    name: 'Hà Đông',
    role: 'Community Growth',
    task: 'Kết nối các câu lạc bộ & truyền thông phong trào',
    letter: 'Đ',
    color: 'bg-amber-600',
  },
  {
    name: 'Hoàng Duẫn',
    role: 'Partnership',
    task: 'Phát triển mạng lưới sân bãi & đối tác địa phương',
    letter: 'D',
    color: 'bg-blue-600',
  },
  {
    name: 'Thảo Ngân',
    role: 'Player Experience',
    task: 'Hỗ trợ người dùng & hoàn thiện chất lượng dịch vụ',
    letter: 'N',
    color: 'bg-rose-600',
  },
  {
    name: 'Phương Thảo',
    role: 'UI/UX Design',
    task: 'Thiết kế giao diện & trải nghiệm thao tác một tay',
    letter: 'T',
    color: 'bg-violet-600',
  },
];

// ─── 3 REAL-WORLD PROBLEMS & SOLUTIONS (STACKED FLIP CARDS) ──────────────────
const CORE_PILLARS = [
  {
    id: 'skill',
    icon: Users,
    title: 'Giao lưu đúng trình độ',
    before: 'Nhắn tin hỏi dò trong hàng chục nhóm chat, đến sân gặp đối thủ lệch trình hoặc bị huỷ lịch phút chót.',
    solution: 'Lọc slot theo cấp độ thực tế (Mới chơi, Trung bình, Khá). Xem trước danh sách người tham gia và chia sẻ chi phí minh bạch.',
    tagBefore: 'THỰC TRẠNG',
    tagAfter: 'GIẢI PHÁP COURTMATE',
  },
  {
    id: 'tournaments',
    icon: Trophy,
    title: 'Số hoá giải phong trào',
    before: 'Bốc thăm giấy, tính điểm sổ tay, vận động viên ngồi chờ cả ngày không biết bao giờ tới lượt mình vào sân.',
    solution: 'Cây nhánh đấu tự động, lịch thi đấu rõ ràng và cập nhật tỉ số trực tiếp từng set đấu lên điện thoại theo thời gian thực.',
    tagBefore: 'THỰC TRẠNG',
    tagAfter: 'GIẢI PHÁP COURTMATE',
  },
  {
    id: 'transparency',
    icon: ShieldCheck,
    title: 'Minh bạch & Trực tiếp',
    before: 'Mập mờ giá giờ thuê sân, phụ phí đèn ban đêm hoặc tiền đặt cọc qua bên thứ ba không an tâm.',
    solution: 'Thông tin cụm sân công khai khắp Đà Nẵng, kết nối trực tiếp chủ sân. Người chơi chia đều chi phí tại chỗ, 0đ phụ phí.',
    tagBefore: 'THỰC TRẠNG',
    tagAfter: 'GIẢI PHÁP COURTMATE',
  },
];

// ─── KEY STATS ──────────────────────────────────────────────────────────────
const KEY_STATS = [
  { value: '06', label: 'Quận tại Đà Nẵng', sub: 'Phủ khắp các cụm sân địa phương' },
  { value: '02', label: 'Bộ môn trọng tâm', sub: 'Cầu lông và Pickleball phong trào' },
  { value: '0đ', label: 'Phí trung gian', sub: 'Chia đều tiền sân trực tiếp tại chỗ' },
];

// ─── 3 COMMITMENTS ──────────────────────────────────────────────────────────
const COMMITMENTS = [
  {
    title: 'Không tin ảo, không slot rác',
    desc: 'Mỗi tài khoản tham gia đều có lịch sử hoạt động và đánh giá uy tín rõ ràng.',
  },
  {
    title: 'Cập nhật thời gian thực',
    desc: 'Lịch thi đấu, tỉ số từng set và tình trạng slot trống đồng bộ tức thì, không độ trễ.',
  },
  {
    title: 'Vì cộng đồng thể thao phong trào',
    desc: 'Lắng nghe phản hồi từ từng người chơi để hoàn thiện ứng dụng thiết thực nhất.',
  },
];

// ─── STACKED FLIP CARD COMPONENT (IMAGE 2 STYLE) ─────────────────────────────
function StackedFlipCard({
  item,
  index,
}: {
  item: (typeof CORE_PILLARS)[number];
  index: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative group cursor-pointer select-none perspective-1000 min-h-[380px] w-full"
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Thẻ ${item.title}: chạm để ${isFlipped ? 'quay lại' : 'lật sang giải pháp'}`}
    >
      {/* ─── Layer 2 Behind (Bottom Card in Stack) ─── */}
      <div className="absolute inset-0 rounded-3xl bg-slate-200 border-2 border-slate-900 rotate-2 translate-y-2 translate-x-1.5 pointer-events-none transition-transform duration-300 group-hover:rotate-3 group-hover:translate-x-2.5 group-hover:translate-y-3" />

      {/* ─── Layer 1 Behind (Middle Card in Stack) ─── */}
      <div className="absolute inset-0 rounded-3xl bg-slate-100 border-2 border-slate-900 -rotate-1 -translate-y-1.5 -translate-x-1 pointer-events-none transition-transform duration-300 group-hover:-rotate-2 group-hover:-translate-x-2 group-hover:-translate-y-2" />

      {/* ─── Main 3D Flip Container ─── */}
      <div
        className={`relative w-full h-full min-h-[380px] transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ─── FRONT FACE (Thực trạng - Trước đây) ─── */}
        <div className="absolute inset-0 backface-hidden rounded-3xl bg-white border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
          {/* Subtle red margin line on the left (Notebook / index-card style) */}
          <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-rose-400/40 pointer-events-none" />

          {/* Top header row */}
          <div className="flex items-center justify-between pl-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                {item.tagBefore}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">0{index + 1} / 03</span>
          </div>

          {/* Center Content */}
          <div className="my-auto py-2 pl-4 text-center">
            {/* Center Pill Button (Direct match with Image 2) */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black tracking-wide shadow-sm mb-4 group-hover:bg-[#1E5AA8] transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>MẶT TRƯỚC · CHẠM ĐỂ LẬT</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-snug mb-3">
              {item.title}
            </h3>

            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed max-w-sm mx-auto">
              "{item.before}"
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="pl-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Vấn đề người chơi gặp phải</span>
            <span className="text-[#1E5AA8] font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Xem giải pháp <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* ─── BACK FACE (Giải pháp - Với CourtMate) ─── */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-[#0F172A] text-white border-2 border-slate-900 shadow-[6px_6px_0px_#1E5AA8] p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
          {/* Subtle cyan accent line */}
          <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-cyan-400/40 pointer-events-none" />

          {/* Top header row */}
          <div className="flex items-center justify-between pl-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                {item.tagAfter}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">0{index + 1} / 03</span>
          </div>

          {/* Center Content */}
          <div className="my-auto py-2 pl-4 text-center">
            {/* Center Pill Button */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1E5AA8] text-white text-xs font-black tracking-wide shadow-sm mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>GIẢI PHÁP · CHẠM ĐỂ QUAY LẠI</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug mb-3">
              {item.title}
            </h3>

            <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed max-w-sm mx-auto">
              {item.solution}
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="pl-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="text-emerald-400 font-bold">✓ Đã có trên CourtMate</span>
            <span className="text-slate-300 font-bold flex items-center gap-1">
              Quay lại <RotateCw className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ABOUT PAGE ────────────────────────────────────────────────────────
export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.reveal-hero', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      });

      gsap.from('.reveal-pillar', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.reveal-pillar-grid',
          start: 'top 85%',
        },
      });

      gsap.from('.reveal-member', {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.reveal-team-grid',
          start: 'top 85%',
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="bg-[#F8FAFC] text-[#101828] selection:bg-[#1E5AA8]/15 selection:text-[#1E5AA8] min-h-screen pb-24"
    >
      {/* ─── 3D PERSPECTIVE STYLES ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `,
        }}
      />

      {/* ─── 1. HERO MANIFESTO ─── */}
      <section className="page-container page-section text-center pt-16 pb-12">
        <h1 className="reveal-hero text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight mb-4">
          Chơi thể thao dễ dàng hơn.<br />
          <span className="text-[#1E5AA8]">Đúng người, đúng sân, đúng trình độ.</span>
        </h1>

        <p className="reveal-hero text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
          CourtMate sinh ra để giải quyết thực trạng quen thuộc của người chơi Cầu lông và Pickleball:
          muốn vung vợt nhưng thiếu người cùng trình, khó tìm sân trống và giải phong trào vẫn quản lý bằng giấy bút.
        </p>

        {/* Action CTAs */}
        <div className="reveal-hero flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/matches"
            className="px-7 py-3.5 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white font-black text-sm shadow-md shadow-[#1E5AA8]/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Users className="w-4 h-4" />
            <span>Tìm bạn giao lưu</span>
          </Link>
          <Link
            href="/tournaments"
            className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-900 font-black text-sm shadow-[3px_3px_0px_#0F172A] transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Trophy className="w-4 h-4 text-[#1E5AA8]" />
            <span>Khám phá giải đấu</span>
          </Link>
        </div>
      </section>

      {/* ─── 2. NUMBERS STRIP (BOLD HIGH-CONTRAST CARDS) ─── */}
      <section className="page-container mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {KEY_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border-2 border-slate-900 shadow-[5px_5px_0px_#0F172A] text-center flex flex-col justify-center"
            >
              <div className="text-4xl sm:text-5xl font-black text-[#1E5AA8] tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-base font-black text-slate-950">{stat.label}</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. PROBLEM & SOLUTION (STACKED FLIP CARDS LIKE IMAGE 2) ─── */}
      <section className="page-container mb-24">
        <div className="text-left mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 text-[#1E5AA8] text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trải nghiệm thực tế · Chạm thẻ để lật</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Chúng tôi thay đổi điều gì?
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1 max-w-xl">
            Bấm vào từng thẻ bên dưới để xem sự khác biệt giữa cách sinh hoạt thể thao truyền thống và giải pháp CourtMate mang lại.
          </p>
        </div>

        {/* Stacked Cards Grid */}
        <div className="reveal-pillar-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_PILLARS.map((item, idx) => (
            <div key={item.id} className="reveal-pillar">
              <StackedFlipCard item={item} index={idx} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. FOUNDERS TEAM (HIGH-CONTRAST BOLD CARDS) ─── */}
      <section className="page-container mb-20">
        <div className="text-left mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 text-slate-900 text-xs font-black uppercase tracking-wider mb-2">
            <span>Đội ngũ sáng lập</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Những người xây dựng dự án
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1 max-w-xl">
            7 thành viên cùng đam mê thể thao, chung tay phát triển nền tảng số hoá cho phong trào Cầu lông & Pickleball tại Đà Nẵng.
          </p>
        </div>

        <div className="reveal-team-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="reveal-member p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A] hover:shadow-[6px_6px_0px_#1E5AA8] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl ${member.color} text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm border border-slate-900`}
                  >
                    {member.letter}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-950 truncate">
                      {member.name}
                    </h3>
                    <span className="inline-block text-[11px] font-bold text-[#1E5AA8] bg-blue-100/80 px-2 py-0.5 rounded-md mt-0.5 border border-blue-200">
                      {member.role}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-700 leading-snug">
                  {member.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. THREE CORE COMMITMENTS (TACTILE BOLD CONTAINER) ─── */}
      <section className="page-container mb-16">
        <div className="p-7 sm:p-9 rounded-3xl bg-white border-2 border-slate-900 shadow-[6px_6px_0px_#1E5AA8]">
          <h3 className="text-lg sm:text-xl font-black text-slate-950 mb-6 tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1E5AA8]" />
            <span>Cam kết vận hành</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMITMENTS.map((c, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E5AA8]" />
                  <span>{c.title}</span>
                </div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed pl-4">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FINAL DIRECT CALLOUT ─── */}
      <section className="page-container">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-slate-900 shadow-[8px_8px_0px_#1E5AA8]">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Sẵn sàng cho trận đấu hôm nay?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-medium">
              Tham gia giao lưu cùng các tay vợt quanh khu vực hoặc đăng ký thử sức tại giải đấu phong trào gần bạn.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/matches"
              className="px-6 py-3 rounded-full bg-[#1E5AA8] hover:bg-[#154687] text-white font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Vào giao lưu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/tournaments"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/20 transition-colors"
            >
              Xem giải đấu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
