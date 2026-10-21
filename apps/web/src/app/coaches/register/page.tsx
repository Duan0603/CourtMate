'use client';

import { FormContainer } from '../../../components/layout/PageContainer';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SportType } from '@courtmate/shared';
import { coachesApi } from '../../../lib/coaches.api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { emitUserNotification } from '../../../lib/notifications-api';
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

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
      router.push('/login?redirect=%2Fcoaches%2Fregister');
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
      void emitUserNotification({ type: 'COACH_REGISTERED', title: 'Đã gửi hồ sơ huấn luyện viên', body: 'Hồ sơ của bạn đã được gửi thành công!', link: '/profile' });
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi gửi hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={formRef} className="min-h-screen bg-canvas page-section">
      <FormContainer>
        <Link
          href="/coaches"
          className="cm-link inline-block text-xs font-bold text-muted hover:text-primary mb-4 transition-colors"
        >
          ← Quay lại danh bạ Huấn luyện viên
        </Link>

        {/* Guest Guard: If Guest, prompt login to register */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-xl bg-accent-tan border border-ink text-primary text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold">Yêu cầu đăng nhập:</span> Bạn cần đăng nhập tài khoản CourtMate trước khi nộp hồ sơ đăng ký làm Huấn luyện viên.
            </div>
            <button
              type="button"
              onClick={() => router.push('/login?redirect=%2Fcoaches%2Fregister')}
              className="cm-action cm-button px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-colors shrink-0 text-center cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {submittedSuccess ? (
          <div className="bg-surface shadow-card rounded-2xl p-8 sm:p-10  border border-ink text-center">
            <h2 className="text-xl sm:text-2xl font-black text-ink">
              Đã nhận hồ sơ
            </h2>
            <p className="text-sm sm:text-sm text-muted mt-2 max-w-md mx-auto leading-relaxed">
              Bạn sẽ nhận thông báo khi hồ sơ được phê duyệt.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/coaches"
                className="cm-action px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
              >
                Về danh bạ Huấn luyện viên
              </Link>
            </div>
          </div>
        ) : (
          <div className="gsap-form-card bg-surface shadow-card rounded-2xl p-6 sm:p-8  border border-ink">

            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Đăng ký huấn luyện viên
            </h1>
            <p className="text-sm text-muted mt-1 mb-6">
              Điền thông tin và gửi hồ sơ để xét duyệt.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Họ tên & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAuthenticated}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={!isAuthenticated}
                    placeholder="VD: 0905123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1">
                  Chuyên môn *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAuthenticated}
                  placeholder="VD: HLV Cầu lông Cấp 1 Quốc Gia - Chuyên chỉnh bộ di chuyển & smash"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                />
              </div>

              {/* Môn giảng dạy: CHỈ CẦU LÔNG VÀ PICKLEBALL */}
              <div>
                <label className="block text-sm font-bold text-muted mb-1.5">
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
                      className={`cm-button px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        sports.includes(s.id)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-muted border-ink hover:border-ink'
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
                  <label className="block text-sm font-bold text-muted mb-1">
                    Số năm kinh nghiệm *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    disabled={!isAuthenticated}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">
                    Mức học phí theo giờ (VND) *
                  </label>
                  <input
                    type="number"
                    step={10000}
                    disabled={!isAuthenticated}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Khu vực */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">
                    Thành phố hoạt động *
                  </label>
                  <select
                    value={city}
                    disabled={!isAuthenticated}
                    onChange={(e) => setCity(e.target.value)}
                    className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm font-medium text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                  >
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">
                    Các quận nhận dạy
                  </label>
                  <input
                    type="text"
                    disabled={!isAuthenticated}
                    value={districts}
                    onChange={(e) => setDistricts(e.target.value)}
                    placeholder="VD: Hải Châu, Sơn Trà"
                    className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bằng cấp */}
              <div className="p-4 bg-white rounded-xl border border-ink">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-ink uppercase tracking-wide">
                    Chứng chỉ / Bằng cấp thể thao
                  </span>
                  <button
                    type="button"
                    disabled={!isAuthenticated}
                    onClick={addCertificate}
                    className="cm-button text-xs font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    + Thêm chứng chỉ
                  </button>
                </div>

                <div className="space-y-2.5">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:flex gap-2 items-center">
                      <input
                        type="text"
                        disabled={!isAuthenticated}
                        placeholder="Tên chứng chỉ (VD: Bằng HLV Quốc Tế IPTPA)"
                        value={cert.title}
                        onChange={(e) => updateCertificate(idx, 'title', e.target.value)}
                        className="cm-control min-w-0 w-full flex-1 px-3 py-1.5 bg-white border border-ink rounded-lg text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white"
                      />
                      <input
                        type="text"
                        disabled={!isAuthenticated}
                        placeholder="Nơi cấp"
                        value={cert.issuedBy}
                        onChange={(e) => updateCertificate(idx, 'issuedBy', e.target.value)}
                        className="cm-control min-w-0 w-full sm:w-32 px-3 py-1.5 bg-white border border-ink rounded-lg text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white"
                      />
                      <input
                        type="number"
                        disabled={!isAuthenticated}
                        placeholder="Năm"
                        value={cert.year}
                        onChange={(e) => updateCertificate(idx, 'year', Number(e.target.value))}
                        className="cm-control min-w-0 w-full sm:w-20 px-3 py-1.5 bg-white border border-ink rounded-lg text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {certificates.length > 1 && (
                        <button
                          type="button"
                          disabled={!isAuthenticated}
                          onClick={() => removeCertificate(idx)}
                          className="cm-button px-2 py-1 text-primary text-xs font-bold hover:bg-accent-tan rounded cursor-pointer"
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
                <label className="block text-sm font-bold text-muted mb-1">
                  Giới thiệu bản thân & Triết lý huấn luyện *
                </label>
                <textarea
                  rows={4}
                  required
                  disabled={!isAuthenticated}
                  placeholder="Mô tả phong cách giảng dạy, thành tích học viên đã đạt được..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="cm-control w-full px-3 py-2 bg-white border border-ink rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-white disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit Button */}
              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="cm-action cm-button w-full py-3 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-primary-dark transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ đăng ký Huấn luyện viên'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/login?redirect=%2Fcoaches%2Fregister')}
                  className="cm-button w-full py-3 bg-white text-muted rounded-xl font-bold text-xs sm:text-sm hover:bg-white transition-all cursor-pointer"
                >
                  Đăng nhập để gửi hồ sơ
                </button>
              )}
            </form>
          </div>
        )}
      </FormContainer>

    </div>
  );
}
