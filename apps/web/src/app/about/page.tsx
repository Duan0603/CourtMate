'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ComparisonDeck } from '../../components/about/ComparisonDeck';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Trophy,
  Users,
  ShieldCheck,
  ArrowRight,
  RotateCw,
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
    color: 'bg-primary',
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

// ─── MAIN ABOUT PAGE ────────────────────────────────────────────────────────
export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from('.reveal-hero', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
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
      className="bg-canvas text-ink selection:bg-primary/15 selection:text-primary min-h-screen pb-24"
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
          <span className="text-primary">Đúng người, đúng sân, đúng trình độ.</span>
        </h1>

        <p className="reveal-hero text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
          CourtMate sinh ra để giải quyết thực trạng quen thuộc của người chơi Cầu lông và Pickleball:
          muốn vung vợt nhưng thiếu người cùng trình, khó tìm sân trống và giải phong trào vẫn quản lý bằng giấy bút.
        </p>

        {/* Action CTAs */}
        <div className="reveal-hero flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/matches"
            className="cm-action px-7 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-black text-sm shadow-md  transition-all flex items-center gap-2  "
          >
            <Users className="w-4 h-4" />
            <span>Tìm bạn giao lưu</span>
          </Link>
          <Link
            href="/tournaments"
            className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 border border-surface-border font-black text-sm shadow-card transition-all flex items-center gap-2  "
          >
            <Trophy className="w-4 h-4 text-primary" />
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
              className="p-6 rounded-3xl bg-white border border-surface-border shadow-card text-center flex flex-col justify-center"
            >
              <div className="text-4xl sm:text-5xl font-black text-primary tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-base font-black text-slate-950">{stat.label}</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container mb-24 overflow-x-clip" aria-labelledby="comparison-heading">
        <div className="grid grid-cols-1 lg:grid-cols-[.85fr_1.15fr] gap-10 lg:gap-20 items-center">
          <div className="lg:pb-12">
            <h2 id="comparison-heading" className="text-3xl sm:text-4xl lg:text-[42px] font-black text-ink tracking-tight leading-[1.15] max-w-[12ch]">
              Chúng tôi thay đổi điều gì?
            </h2>
            <p className="text-base text-muted mt-6 leading-relaxed max-w-[40ch]">
              Bấm vào từng thẻ để xem sự khác biệt giữa cách sinh hoạt thể thao truyền thống và giải pháp CourtMate mang lại.
            </p>
            <p className="text-sm text-primary font-semibold mt-6 flex items-center gap-2">
              <RotateCw className="w-4 h-4 shrink-0" aria-hidden="true" /> Bấm để lật. Kéo để khám phá thẻ tiếp theo.
            </p>
          </div>
          <ComparisonDeck items={CORE_PILLARS} />
        </div>
      </section>

      {/* ─── 4. FOUNDERS TEAM (HIGH-CONTRAST BOLD CARDS) ─── */}
      <section className="page-container mb-20">
        <div className="text-left mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Đội ngũ sáng lập
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1 max-w-xl">
            7 thành viên cùng đam mê thể thao, chung tay phát triển nền tảng số hoá cho phong trào Cầu lông & Pickleball tại Đà Nẵng.
          </p>
        </div>

        <div className="reveal-team-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="reveal-member p-4 sm:p-5 rounded-2xl bg-white border border-surface-border shadow-card hover:shadow-card transition-all flex flex-col justify-between"
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
                    <span className="inline-block text-[11px] font-bold text-primary bg-blue-100/80 px-2 py-0.5 rounded-md mt-0.5 border border-blue-200">
                      {member.role}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-700 leading-snug">
                  {member.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. THREE CORE COMMITMENTS (TACTILE BOLD CONTAINER) ─── */}
      <section className="page-container mb-16">
        <div className="p-7 sm:p-9 rounded-3xl bg-white border border-surface-border shadow-card">
          <h3 className="text-lg sm:text-xl font-black text-slate-950 mb-6 tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span>Cam kết vận hành</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMITMENTS.map((c, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>{c.title}</span>
                </div>
                <p className="text-sm font-medium text-slate-700 leading-relaxed pl-4">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FINAL DIRECT CALLOUT ─── */}
      <section className="page-container">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-surface-border shadow-card">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Sẵn sàng cho trận đấu hôm nay?
            </h2>
            <p className="text-sm sm:text-sm text-slate-300 max-w-lg font-medium">
              Tham gia giao lưu cùng các tay vợt quanh khu vực hoặc đăng ký thử sức tại giải đấu phong trào gần bạn.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/matches"
              className="cm-action px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm"
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
