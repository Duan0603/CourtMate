'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { GuestActionModal } from '../../../../components/shared/GuestActionModal';
import { useParams, useRouter } from 'next/navigation';
import {
  Trophy,
  ArrowLeft,
  CreditCard,
  User,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Tournament, TournamentStatus, SkillLevel } from '@courtmate/shared';
import { getTournamentStatus } from '../../../../lib/tournament-status';
import { tournamentsApi } from '../../../../lib/tournaments.api';
import { registrationsApi } from '../../../../lib/registrations.api';
import { paymentsApi, PaymentProvider } from '../../../../lib/payments.api';
import { useAuth } from '../../../../context/AuthContext';

export default function TournamentRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Form Fields
  const [playerName, setPlayerName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState((user as any)?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [partnerName, setPartnerName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.INTERMEDIATE);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('PAYOS');
  const [agreeTerms, setAgreeTerms] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowLoginPrompt(true);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user) {
      if (user.name) setPlayerName(user.name);
      if (user.email) setEmail(user.email);
      if ((user as any)?.phone) setContactPhone((user as any).phone);
    }
  }, [user]);

  useEffect(() => {
    async function loadTournament() {
      if (!tournamentId) return;
      try {
        const data = await tournamentsApi.getTournamentDetails(tournamentId);
        setTournament(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTournament();
  }, [tournamentId]);

  const selectedCategory = tournament?.categories?.[selectedCategoryIndex] || {
    name: tournament?.title ? 'Nội dung tiêu chuẩn' : 'Hạng mục thi đấu',
    fee: tournament?.registrationFee || 0,
  };

  // Only display partner name input when a doubles category is chosen
  const isDoublesCategory = useMemo(() => {
    if (!selectedCategory?.name) return false;
    const lower = selectedCategory.name.toLowerCase();
    return (
      lower.includes('đôi') ||
      lower.includes('doi') ||
      lower.includes('doubles') ||
      lower.includes('cặp') ||
      lower.includes('cap') ||
      (selectedCategory as any)?.type === 'DOUBLES' ||
      (selectedCategory as any)?.isDoubles === true
    );
  }, [selectedCategory]);

  useEffect(() => {
    if (!isDoublesCategory) {
      setPartnerName('');
    }
  }, [isDoublesCategory]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    if (!tournament || getTournamentStatus(tournament) !== TournamentStatus.OPEN || new Date(tournament.startDate).getTime() <= Date.now()) {
      alert('Giải đấu đã đóng đăng ký hoặc đã bắt đầu thi đấu.');
      return;
    }
    if (isDoublesCategory && !partnerName.trim()) {
      alert('Vui lòng nhập họ và tên vận động viên cùng cặp.');
      return;
    }
    if (!agreeTerms) {
      alert('Vui lòng đồng ý với điều lệ thi đấu.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create registration record
      const resolvedPlayerId = user?.id || (user as any)?._id || '';
      const reg = await registrationsApi.create(
        {
          tournamentId,
          playerName,
          email,
          partnerName: isDoublesCategory ? partnerName : undefined,
          categoryName: selectedCategory.name,
          contactPhone,
          skillLevel,
        },
        resolvedPlayerId
      );

      // 2. Create payment session if applicable
      const targetRegId = (reg as any)?.id || (reg as any)?._id;
      if (targetRegId) {
        try {
          const payment = await paymentsApi.create(targetRegId, paymentProvider);
          if (payment?.payUrl && (payment.payUrl.startsWith('http://') || payment.payUrl.startsWith('https://'))) {
            window.location.href = payment.payUrl;
            return;
          }
        } catch (payErr) {
          console.warn('Payment notice:', payErr);
        }
      }

      // 3. Immediately redirect to electronic ticket!
      router.push(`/ticket/${tournamentId}?registered=true`);
    } catch (err: any) {
      alert(err.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-muted text-sm font-semibold">Đang chuẩn bị hồ sơ đăng ký...</p>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* ─── BREADCRUMB & BACK NAV (Standard Page Container) ─── */}
      <div className="page-container pt-6 pb-4">
        <Link
          href={`/tournaments/${tournamentId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại chi tiết giải</span>
        </Link>
      </div>

      {/* ─── MAIN CONTENT CONTAINER (Full Standard 1280px Grid) ─── */}
      <div className="page-container">
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Đăng ký giải đấu
          </h1>
          <p className="text-sm font-semibold text-muted mt-1">
            {tournament?.title}
          </p>
        </div>

        {/* 2-Column Form & Summary */}
        <form onSubmit={handleRegister} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column (2/3): Form Inputs */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Athlete Information */}
            <div className="bg-surface shadow-card rounded-3xl border border-ink p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-ink">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-ink text-base">Thông tin vận động viên</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                    Họ và tên người thi đấu <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="cm-control w-full px-3.5 py-2.5 text-sm bg-white border border-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                    Số điện thoại liên hệ (Zalo) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="cm-control w-full px-3.5 py-2.5 text-sm bg-white border border-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                    Email nhận vé điện tử <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cm-control w-full px-3.5 py-2.5 text-sm bg-white border border-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Category & Skill Level */}
            <div className="bg-surface shadow-card rounded-3xl border border-ink p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-ink">
                <Trophy className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-ink text-base">Hạng mục & Trình độ</h3>
              </div>

              {/* Categories list radio */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">
                  Chọn nội dung thi đấu <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {tournament?.categories?.map((cat, idx) => (
                    <label
                      key={cat.id || idx}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                        selectedCategoryIndex === idx
                          ? 'border-primary bg-accent-baby ring-2 ring-primary/20'
                          : 'border-ink bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategoryIndex === idx}
                          onChange={() => setSelectedCategoryIndex(idx)}
                          className="cm-control text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-extrabold text-ink">{cat.name}</span>
                      </div>
                      <span className="text-sm font-black text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cat.fee)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skill level */}
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                  Trình độ thi đấu tự khai
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="cm-control w-full px-3.5 py-2.5 text-sm bg-white border border-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-ink font-semibold"
                >
                  <option value={SkillLevel.BEGINNER}>Mới chơi / Phong trào (Beginner)</option>
                  <option value={SkillLevel.INTERMEDIATE}>Trung bình khá (Intermediate 3.0 - 4.0)</option>
                  <option value={SkillLevel.ADVANCED}>Nâng cao / Bán chuyên (Advanced 4.5+)</option>
                </select>
              </div>

              {/* Partner Name ONLY when doubles category is selected */}
              {isDoublesCategory && (
                <div className="animate-in fade-in duration-200 pt-2 border-t border-ink/15">
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                    Họ và tên vận động viên cùng cặp <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lê Hoàng Nam"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="cm-control w-full px-3.5 py-2.5 text-sm bg-white border border-ink rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-semibold"
                  />
                  <p className="text-[11px] text-muted font-medium mt-1">
                    * Nội dung Đôi yêu cầu khai báo tên vận động viên đồng đội để ban tổ chức xếp lịch thi đấu.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Payment Gateway Choice (NO MoMo) */}
            <div className="bg-surface shadow-card rounded-3xl border border-ink p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-ink">
                <CreditCard className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-ink text-base">Phương thức thanh toán</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'PAYOS',
                    name: 'Quét mã VietQR (PayOS)',
                    desc: 'Chuyển khoản miễn phí 24/7 từ mọi app ngân hàng',
                  },
                  {
                    id: 'VNPAY',
                    name: 'Cổng VNPAY',
                    desc: 'Thanh toán thẻ ATM nội địa & thẻ quốc tế Visa/Mastercard',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                      paymentProvider === item.id
                        ? 'border-primary bg-accent-baby ring-2 ring-primary/20'
                        : 'border-ink bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentProvider === item.id}
                          onChange={() => setPaymentProvider(item.id as PaymentProvider)}
                          className="cm-control text-primary focus:ring-primary"
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-ink/20 text-muted">
                          {item.id}
                        </span>
                      </div>
                      <strong className="block text-sm font-black text-ink">{item.name}</strong>
                    </div>
                    <span className="text-xs text-muted mt-2 block font-medium leading-relaxed">{item.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="p-4 rounded-2xl bg-white border border-ink flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="cm-control mt-1 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-muted font-medium leading-relaxed cursor-pointer">
                Tôi cam kết thông tin khai báo là hoàn toàn chính xác, cam kết tuân thủ Điều lệ giải đấu và chịu trách nhiệm về tình trạng sức khỏe khi tham gia thi đấu.
              </label>
            </div>

          </div>

          {/* Right Column (1/3): Sticky Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface shadow-card rounded-3xl border border-ink p-6 sm:p-7 sticky top-24 space-y-6">

              <h3 className="font-extrabold text-ink text-base pb-3 border-b border-ink">
                Tóm tắt đăng ký
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm text-muted">
                <div className="flex justify-between items-start gap-2">
                  <span className="shrink-0">Hạng mục:</span>
                  <strong className="text-ink font-bold text-right">{selectedCategory.name}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lệ phí thi đấu:</span>
                  <span className="text-ink font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCategory.fee)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Phí tiện ích CourtMate:</span>
                  <span className="text-primary font-bold">Miễn phí 0đ</span>
                </div>
              </div>

              <div className="pt-4 border-t border-ink">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">Tổng tiền thanh toán:</span>
                  <span className="text-2xl font-black text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCategory.fee)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="cm-button w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold text-base text-center flex items-center justify-center gap-2 shadow-lg shadow-black transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Đang xử lý giao dịch...</span>
                ) : (
                  <>
                    <span>Thanh toán ngay</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="p-3.5 rounded-2xl bg-white border border-ink flex items-center gap-2.5 text-xs text-muted">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">
                  Vé điện tử &amp; mã QR sẽ được gửi qua email từ BTC{' '}
                  <strong className="text-ink">
                    {tournament?.organizer?.name || 'Giải đấu'}
                    {tournament?.organizer?.email ? ` (${tournament.organizer.email})` : ''}
                  </strong>{' '}
                  ngay sau khi thanh toán
                </span>
              </div>

            </div>
          </div>

        </form>
      </div>

      <GuestActionModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} redirectUrl={`/tournaments/${tournamentId}/register`} />
    </div>
  );
}
