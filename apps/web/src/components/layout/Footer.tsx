import React from 'react';
import Link from 'next/link';
import { Trophy, Heart, Shield, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white pt-16 pb-12 border-t border-navy-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white shadow-md">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                Court<span className="text-primary-light">Mate</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Nền tảng thể thao kết nối người chơi, tìm kiếm đối thủ on-demand và tổ chức giải đấu chuyên nghiệp số 1 tại Việt Nam.
            </p>
            <div className="flex items-center gap-4 text-slate-400 text-xs pt-2">
              <span className="inline-flex items-center gap-1.5 bg-navy-light/60 px-2.5 py-1 rounded-full border border-white/10">
                <Shield className="w-3.5 h-3.5 text-primary-light" />
                Bảo mật chuẩn quốc tế
              </span>
              <span className="inline-flex items-center gap-1.5 bg-navy-light/60 px-2.5 py-1 rounded-full border border-white/10">
                <Trophy className="w-3.5 h-3.5 text-court-orange" />
                Hơn 500+ giải đấu
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Khám phá</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/tournaments?sport=BADMINTON" className="hover:text-white transition">Giải Cầu Lông</Link>
              </li>
              <li>
                <Link href="/tournaments?sport=PICKLEBALL" className="hover:text-white transition">Giải Pickleball</Link>
              </li>
              <li>
                <Link href="/tournaments?sport=TENNIS" className="hover:text-white transition">Giải Quần Vợt</Link>
              </li>
              <li>
                <Link href="/tournaments?sport=FOOTBALL" className="hover:text-white transition">Giải Bóng Đá Mini</Link>
              </li>
              <li>
                <Link href="/tournaments" className="hover:text-white transition">Tất cả giải đấu</Link>
              </li>
            </ul>
          </div>

          {/* For Organizers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Dành cho BTC</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/tournaments/create" className="hover:text-white transition">Đăng ký giải đấu mới</Link>
              </li>
              <li>
                <Link href="/organizer" className="hover:text-white transition">Bảng quản trị giải</Link>
              </li>
              <li>
                <Link href="/organizer#courts" className="hover:text-white transition">Quản lý lịch sân</Link>
              </li>
              <li>
                <Link href="/organizer#reports" className="hover:text-white transition">Báo cáo tài chính & doanh thu</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Liên hệ & Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-light shrink-0" />
                <span>Sơn Trà, TP. Đà Nẵng</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-light shrink-0" />
                <span>support@courtmate.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-light shrink-0" />
                <span>1900 6868 (8:00 - 21:00)</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-navy-light/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CourtMate Inc. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-400 transition">Điều khoản sử dụng</Link>
            <Link href="#" className="hover:text-slate-400 transition">Chính sách bảo mật</Link>
            <Link href="#" className="hover:text-slate-400 transition">Quy chế hoạt động</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
