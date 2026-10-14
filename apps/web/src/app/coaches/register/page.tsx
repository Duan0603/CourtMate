'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SportType } from '@courtmate/shared';
import { coachesApi } from '../../../lib/coaches.api';
import { useAuth } from '../../../context/AuthContext';
import { GuestActionModal } from '../../../components/shared/GuestActionModal';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function RegisterCoachPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  const [fullName, setFullName] = useState(user?.name || '');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState('Đà Nẵng');
  const [districts, setDistricts] = useState('Hải Châu, Sơn Trà');
  const [preferredCourts, setPreferredCourts] = useState('CLB Tiên Sơn, Sân Quân Khu 5');
  const [sports, setSports] = useState<SportType[]>([SportType.BADMINTON]);
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [hourlyRate, setHourlyRate] = useState<number>(250000);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Certificates list
  const [certificates, setCertificates] = useState<
    { title: string; issuedBy: string; year: number }[]
  >([{ title: '', issuedBy: '', year: 2023 }]);

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        '.gsap-form-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    },
    { scope: formRef }
  );

  const toggleSport = (sport: SportType) => {
    if (sports.includes(sport)) {
      if (sports.length > 1) {
        setSports(sports.filter((s) => s !== sport));
      }
    } else {
      setSports([...sports, sport]);
    }
  };

  const addCertificate = () => {
    setCertificates([...certificates, { title: '', issuedBy: '', year: 2024 }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: string, val: any) => {
    const updated = [...certificates];
    (updated[index] as any)[field] = val;
    setCertificates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsGuestModalOpen(true);
      return;
    }
    if (!headline || !bio) {
      toast.error('Vui lòng điền đầy đủ thông tin tiêu đề và giới thiệu');
      return;
    }

    setSubmitting(true);
    try {
      await coachesApi.registerAsCoach({
        userId: user?.id,
        fullName,
        headline,
        phone,
        email,
        city,
        districts: districts.split(',').map((d) => d.trim()),
        preferredCourts: preferredCourts.split(',').map((c) => c.trim()),
        sports,
        experienceYears,
        hourlyRate,
        bio,
        avatarUrl,
        certificates: certificates.filter((c) => c.title.trim()),
      });

      setSubmittedSuccess(true);
      toast.success('Hồ sơ của bạn đã được gửi thành công!');
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi gửi hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={formRef} className="min-h-screen bg-[#F8FAFC] pb-24 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/coaches"
          className="inline-block text-xs font-bold text-slate-500 hover:text-[#1E5AA8] mb-4 transition-colors"
        >
          ← Quay lại danh bạ Huấn luyện viên
        </Link>

        {/* Guest Guard: If Guest, prompt login to register */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold">Yêu cầu đăng nhập:</span> Bạn cần đăng nhập tài khoản CourtMate trước khi nộp hồ sơ đăng ký làm Huấn luyện viên.
            </div>
            <button
              type="button"
              onClick={() => setIsGuestModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#1E5AA8] text-white font-bold text-xs hover:bg-[#154687] transition-colors shrink-0 text-center cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {submittedSuccess ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Hồ sơ đăng ký đã được tiếp nhận
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Quản trị viên CourtMate sẽ xác thực bằng cấp và thông tin của bạn trong vòng 24 giờ. Bạn sẽ nhận thông báo khi hồ sơ được phê duyệt.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/coaches"
                className="px-5 py-2.5 bg-[#1E5AA8] text-white rounded-xl text-xs font-bold hover:bg-[#154687] transition-colors"
              >
                Về danh bạ Huấn luyện viên
              </Link>
            </div>
          </div>
        ) : (
          <div className="gsap-form-card bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-[#1E5AA8] uppercase tracking-wider block mb-1">
              Đối tác Huấn Luyện Viên
            </span>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Đăng ký trở thành Huấn luyện viên
            </h1>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Điền thông tin chuyên môn, kinh nghiệm giảng dạy môn Cầu lông / Pickleball và mức học phí để kết nối cùng học viên thể thao.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Họ tên & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAuthenticated}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={!isAuthenticated}
                    placeholder="VD: 0905123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề chuyên môn *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAuthenticated}
                  placeholder="VD: HLV Cầu lông Cấp 1 Quốc Gia - Chuyên chỉnh bộ di chuyển & smash"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Môn giảng dạy: CHỈ CẦU LÔNG VÀ PICKLEBALL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Môn thể thao nhận dạy *
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: SportType.BADMINTON, label: 'Cầu lông' },
                    { id: SportType.PICKLEBALL, label: 'Pickleball' },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      disabled={!isAuthenticated}
                      onClick={() => toggleSport(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        sports.includes(s.id)
                          ? 'bg-[#1E5AA8] text-white border-[#1E5AA8]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kinh nghiệm & Học phí */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số năm kinh nghiệm *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    disabled={!isAuthenticated}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mức học phí theo giờ (VND) *
                  </label>
                  <input
                    type="number"
                    step={10000}
                    disabled={!isAuthenticated}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Khu vực */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thành phố hoạt động *
                  </label>
                  <select
                    value={city}
                    disabled={!isAuthenticated}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Các quận nhận dạy
                  </label>
                  <input
                    type="text"
                    disabled={!isAuthenticated}
                    value={districts}
                    onChange={(e) => setDistricts(e.target.value)}
                    placeholder="VD: Hải Châu, Sơn Trà"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bằng cấp */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Chứng chỉ / Bằng cấp thể thao
                  </span>
                  <button
                    type="button"
                    disabled={!isAuthenticated}
                    onClick={addCertificate}
                    className="text-xs font-bold text-[#1E5AA8] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    + Thêm chứng chỉ
                  </button>
                </div>

                <div className="space-y-2.5">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        disabled={!isAuthenticated}
                        placeholder="Tên chứng chỉ (VD: Bằng HLV Quốc Tế IPTPA)"
                        value={cert.title}
                        onChange={(e) => updateCertificate(idx, 'title', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100"
                      />
                      <input
                        type="text"
                        disabled={!isAuthenticated}
                        placeholder="Nơi cấp"
                        value={cert.issuedBy}
                        onChange={(e) => updateCertificate(idx, 'issuedBy', e.target.value)}
                        className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100"
                      />
                      <input
                        type="number"
                        disabled={!isAuthenticated}
                        placeholder="Năm"
                        value={cert.year}
                        onChange={(e) => updateCertificate(idx, 'year', Number(e.target.value))}
                        className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8]"
                      />
                      {certificates.length > 1 && (
                        <button
                          type="button"
                          disabled={!isAuthenticated}
                          onClick={() => removeCertificate(idx)}
                          className="px-2 py-1 text-rose-600 text-xs font-bold hover:bg-rose-50 rounded cursor-pointer"
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giới thiệu bản thân & Triết lý huấn luyện *
                </label>
                <textarea
                  rows={4}
                  required
                  disabled={!isAuthenticated}
                  placeholder="Mô tả phong cách giảng dạy, thành tích học viên đã đạt được..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E5AA8] disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit Button */}
              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#1E5AA8] text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-[#154687] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ đăng ký Huấn luyện viên'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(true)}
                  className="w-full py-3 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-300 transition-all cursor-pointer"
                >
                  Đăng nhập để gửi hồ sơ
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      <GuestActionModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title="Đăng ký làm Huấn luyện viên"
        description="Khách chưa đăng nhập không thể nộp đơn làm HLV. Vui lòng đăng nhập tài khoản để gửi hồ sơ xét duyệt."
        redirectUrl="/coaches/register"
      />
    </div>
  );
}
