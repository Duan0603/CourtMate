'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Heart, Zap, Shield, TrendingUp, Users, Flag, Trophy, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const sections = gsap.utils.toArray('.reveal-section');
    
    sections.forEach((section: any) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Story text reveal
    gsap.fromTo(
      '.story-text',
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
          trigger: '.story-container',
          start: 'top 70%',
        }
      }
    );

    // Founders stagger
    gsap.fromTo(
      '.founder-card',
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.founders-grid',
          start: 'top 75%',
        }
      }
    );
    
    // Milestones line
    gsap.fromTo(
      '.milestone-line',
      { height: 0 },
      {
        height: '100%',
        duration: 2,
        ease: 'none',
        scrollTrigger: {
          trigger: '.milestones-container',
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: 1,
        }
      }
    );
    
    // Milestones items
    gsap.fromTo(
      '.milestone-item',
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.5,
        duration: 1,
        scrollTrigger: {
          trigger: '.milestones-container',
          start: 'top 60%',
          end: 'bottom 80%',
          scrub: 1,
        }
      }
    );

  }, { scope: container });

  const founders = [
    { name: 'Hoàng Phúc', role: 'Co-founder & CEO' },
    { name: 'Xuân Thịnh', role: 'Co-founder & CTO' },
    { name: 'Anh Huân', role: 'Co-founder & COO' },
    { name: 'Hà Đông', role: 'Co-founder & CMO' },
    { name: 'Hoàng Duẫn', role: 'Co-founder & CFO' },
    { name: 'Thảo Ngân', role: 'Co-founder & Head of Product' },
    { name: 'Phương Thảo', role: 'Co-founder & Head of Design' },
  ];

  const values = [
    { icon: <Heart className="w-6 h-6 text-rose-500" />, title: 'Đam Mê', desc: 'Lấy ngọn lửa đam mê thể thao làm kim chỉ nam trong mọi hành động.' },
    { icon: <Zap className="w-6 h-6 text-amber-500" />, title: 'Tốc Độ', desc: 'Kết nối nhanh chóng, giải quyết tức thì mọi nhu cầu tìm sân, ghép kèo.' },
    { icon: <Shield className="w-6 h-6 text-emerald-500" />, title: 'Tin Cậy', desc: 'Xây dựng một cộng đồng minh bạch, uy tín và văn minh.' },
    { icon: <TrendingUp className="w-6 h-6 text-blue-500" />, title: 'Đổi Mới', desc: 'Không ngừng cải tiến công nghệ để mang lại trải nghiệm tối ưu nhất.' },
  ];

  const milestones = [
    { year: '2023', title: 'Ý tưởng khởi nguồn', desc: 'Bắt đầu từ những buổi chiều không tìm được sân cầu lông, nhóm 7 người bạn đã ấp ủ dự án CourtMate.' },
    { year: 'Q1 2024', title: 'Hoàn thiện bản Prototype', desc: 'Ra mắt phiên bản thử nghiệm giới hạn cho 500 người dùng đầu tiên tại Đà Nẵng.' },
    { year: 'Q3 2024', title: 'Mở rộng thị trường', desc: 'Chính thức có mặt tại 3 thành phố lớn: Đà Nẵng, Hà Nội, TP.HCM với hơn 10,000 thành viên.' },
    { year: '2025', title: 'Khát vọng vươn xa', desc: 'Mục tiêu kết nối 1 triệu người đam mê thể thao trên toàn quốc và tích hợp AI.' },
  ];

  return (
    <div ref={container} className="bg-white min-h-screen text-[#101828] overflow-hidden">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#1E5AA8]/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        <span className="text-[#1E5AA8] font-bold tracking-widest uppercase text-sm mb-4 reveal-section">Về CourtMate</span>
        <h1 className="text-4xl md:text-6xl font-black text-navy leading-tight mb-6 reveal-section">
          Kết nối đam mê,<br/> <span className="text-[#1E5AA8]">Kiến tạo cộng đồng.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl reveal-section">
          Hành trình từ những người yêu thể thao đến sứ mệnh số hoá và kết nối hàng triệu người chơi trên toàn quốc.
        </p>
      </section>

      {/* ─── BRAND STORY ─── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="story-container space-y-6">
              <h2 className="text-3xl font-extrabold text-navy story-text">Câu Chuyện Thương Hiệu</h2>
              <p className="text-slate-600 leading-relaxed story-text">
                Mọi thứ bắt đầu từ một buổi chiều cuối tuần của năm 2023. Bảy người bạn trẻ mang trong mình ngọn lửa đam mê với Cầu lông và Pickleball gặp chung một rắc rối lớn: <strong className="text-navy">Không thể tìm được sân trống và thiếu người chơi cùng cấp độ.</strong>
              </p>
              <p className="text-slate-600 leading-relaxed story-text">
                Việc phải gọi điện thoại cho từng chủ sân, đăng bài lên các nhóm Facebook chờ đợi mòn mỏi đã cản trở niềm vui thể thao. Chúng tôi nhận ra, không chỉ chúng tôi mà hàng vạn người khác cũng đang đối mặt với sự bất tiện này mỗi ngày.
              </p>
              <p className="text-slate-600 leading-relaxed story-text">
                Và thế là <strong className="text-[#1E5AA8]">CourtMate</strong> ra đời – một giải pháp "On-demand Matchmaking" như Grab dành riêng cho giới thể thao, giúp bất kỳ ai cũng có thể tìm sân và đối thủ chỉ với vài cú chạm.
              </p>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden reveal-section shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="CourtMate Story" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent flex items-end p-8">
                <p className="text-white text-lg font-medium italic">"Chơi thể thao không nên là một trở ngại."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VISION & MISSION ─── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-[#1E5AA8] rounded-3xl p-10 text-white reveal-section shadow-xl transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Tầm Nhìn</h3>
            <p className="text-white/80 leading-relaxed">
              Trở thành nền tảng công nghệ số 1 Đông Nam Á trong việc kết nối cộng đồng người chơi thể thao nghiệp dư và quản lý sân bãi thông minh.
            </p>
          </div>
          
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-10 reveal-section shadow-xl transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-[#1E5AA8]/10 rounded-2xl flex items-center justify-center mb-6">
              <Flag className="w-7 h-7 text-[#1E5AA8]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-navy">Sứ Mệnh</h3>
            <p className="text-slate-600 leading-relaxed">
              Phá bỏ mọi rào cản tiếp cận thể thao bằng cách cung cấp thông tin minh bạch, kết nối nhanh chóng và tạo ra môi trường giao lưu văn minh, công bằng cho tất cả mọi người.
            </p>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT / SERVICE ─── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-navy mb-16 reveal-section">Giải Pháp Của Chúng Tôi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { title: 'Tìm kiếm on-demand', desc: 'Hiển thị các buổi chơi đang thiếu người xung quanh bạn theo thời gian thực. Đăng ký tham gia chỉ với 1 chạm.' },
              { title: 'Quản lý giải đấu', desc: 'Từ việc tạo giải, xếp lịch thi đấu tự động đến cập nhật kết quả trực tuyến chuyên nghiệp.' },
              { title: 'Hồ sơ người chơi (Level)', desc: 'Hệ thống đánh giá trình độ ELO giúp ghép cặp công bằng, tránh tình trạng chênh lệch quá lớn khi giao lưu.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 reveal-section">
                <CheckCircle2 className="w-8 h-8 text-[#1E5AA8] mb-4" />
                <h4 className="text-lg font-bold text-navy mb-3">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CORE VALUES ─── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal-section">
          <h2 className="text-3xl font-extrabold text-navy">Giá Trị Cốt Lõi</h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">Văn hoá tại CourtMate được định hình bởi 4 nguyên tắc không bao giờ thay đổi.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 reveal-section text-center">
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                {val.icon}
              </div>
              <h4 className="text-xl font-bold text-navy mb-3">{val.title}</h4>
              <p className="text-slate-500 text-sm">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TEAM (FOUNDERS) ─── */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E5AA8]/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 reveal-section">
            <h2 className="text-3xl font-extrabold mb-4">Đội Ngũ Sáng Lập</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Bảy mảnh ghép, một chung một nhịp đập đam mê.</p>
          </div>
          
          <div className="founders-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {founders.map((founder, idx) => (
              <div key={idx} className="founder-card text-center group">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-slate-800 group-hover:ring-[#1E5AA8] transition-all duration-300">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name)}&background=1E5AA8&color=ffffff&size=256&bold=true`}
                    alt={founder.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h4 className="text-lg font-bold">{founder.name}</h4>
                <p className="text-sm text-[#1E5AA8] font-medium mt-1">{founder.role}</p>
              </div>
            ))}
            
            {/* The 8th slot just for symmetry if needed, or an overall team box */}
            <div className="founder-card text-center group flex flex-col justify-center items-center p-6 bg-slate-800 rounded-3xl">
              <Users className="w-10 h-10 text-slate-400 mb-3" />
              <h4 className="text-base font-bold text-slate-300">Và hàng trăm Đối tác</h4>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MILESTONES ─── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 reveal-section">
          <h2 className="text-3xl font-extrabold text-navy">Chặng Đường Phát Triển</h2>
          <p className="mt-4 text-slate-500">Những cột mốc đánh dấu sự trưởng thành của CourtMate.</p>
        </div>
        
        <div className="milestones-container relative max-w-3xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 w-1 bg-slate-100 h-full -translate-x-1/2 rounded-full overflow-hidden">
            <div className="milestone-line w-full bg-[#1E5AA8] rounded-full" />
          </div>
          
          <div className="space-y-12">
            {milestones.map((ms, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`milestone-item relative flex items-center justify-start md:justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  {/* Dot */}
                  <div className="absolute left-[20px] md:left-1/2 w-4 h-4 rounded-full border-4 border-white bg-[#1E5AA8] -translate-x-1/2 shadow-md z-10" />
                  
                  {/* Content */}
                  <div className={`w-full pl-12 md:pl-0 md:w-[45%] ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <span className="text-[#1E5AA8] font-bold text-sm tracking-wider uppercase mb-2 block">{ms.year}</span>
                      <h4 className="text-lg font-bold text-navy mb-2">{ms.title}</h4>
                      <p className="text-slate-500 text-sm">{ms.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-gradient-to-br from-[#1E5AA8] to-navy text-white text-center px-4">
        <div className="max-w-3xl mx-auto reveal-section">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black mb-6">Gia nhập cộng đồng CourtMate ngay hôm nay</h2>
          <p className="text-white/80 text-lg mb-10">Đừng để việc thiếu người chơi cản trở niềm đam mê của bạn.</p>
          <a href="/register" className="inline-block bg-white text-navy font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-xl">
            Tạo tài khoản miễn phí
          </a>
        </div>
      </section>
      
    </div>
  );
}
