'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  User, 
  Phone, 
  Mail, 
  Users, 
  Award,
  ChevronRight
} from 'lucide-react';
import { Tournament, SkillLevel } from '@courtmate/shared';
import { tournamentsApi } from '../../../../lib/tournaments.api';
import { registrationsApi } from '../../../../lib/registrations.api';
import { paymentsApi, PaymentProvider } from '../../../../lib/payments.api';
import { useAuth } from '../../../../context/AuthContext';

export default function TournamentRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { user } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Vui lòng đồng ý với điều lệ thi đấu');
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
          partnerName: partnerName || undefined,
          contactPhone,
          skillLevel,
        },
        resolvedPlayerId
      );

      // 2. Create payment session
      const targetRegId = (reg as any)?.id || (reg as any)?._id;
      if (!targetRegId) {
        throw new Error('Không lấy được mã hồ sơ đăng ký');
      }
      const payment = await paymentsApi.create(targetRegId, paymentProvider);

      // 3. Navigate to payment gateway or return page
      if (payment.payUrl) {
        if (payment.payUrl.startsWith('http://') || payment.payUrl.startsWith('https://')) {
          window.location.href = payment.payUrl;
        } else {
          router.push(payment.payUrl);
        }
      } else {
        router.push(`/payment/return?orderId=${payment.orderId}&status=PAID&tournamentId=${tournamentId}`);
      }
    } catch (err: any) {
      alert(err.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Đang chuẩn bị hồ sơ đăng ký...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href={`/tournaments/${tournamentId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại chi tiết giải</span>
        </Link>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
            Đăng Ký Tham Gia Giải Đấu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {tournament?.title}
          </p>
        </div>

        {/* 2-Column Form & Summary */}
        <form onSubmit={handleRegister} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3): Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Athlete Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-navy text-sm">Thông tin vận động viên</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Họ và tên VĐV chính <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Số điện thoại liên hệ (Zalo) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Địa chỉ Email nhận vé QR <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                  />
                </div>
              </div>
            </div>

            {/* 2. Category & Skill Level */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Trophy className="w-4 h-4 text-court-orange" />
                <h3 className="font-bold text-navy text-sm">Hạng mục & Trình độ</h3>
              </div>

              {/* Categories list radio */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Chọn nội dung thi đấu <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {tournament?.categories?.map((cat, idx) => (
                    <label
                      key={cat.id || idx}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                        selectedCategoryIndex === idx
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategoryIndex === idx}
                          onChange={() => setSelectedCategoryIndex(idx)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-semibold text-navy">{cat.name}</span>
                      </div>
                      <span className="text-sm font-bold text-navy">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cat.fee)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skill level */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Trình độ thi đấu tự khai
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                >
                  <option value={SkillLevel.BEGINNER}>Mới chơi / Phong trào (Beginner)</option>
                  <option value={SkillLevel.INTERMEDIATE}>Trung bình khá (Intermediate 3.0 - 4.0)</option>
                  <option value={SkillLevel.ADVANCED}>Nâng cao / Bán chuyên (Advanced 4.5+)</option>
                </select>
              </div>

              {/* Partner Name if double */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Họ tên vận động viên cùng cặp (Nếu thi đấu nội dung Đôi)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lê Hoàng Nam"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
              </div>
            </div>

            {/* 3. Payment Gateway Choice */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-navy text-sm">Phương thức thanh toán</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'PAYOS', name: 'Quét mã VietQR (PayOS)', desc: 'Chuyển khoản miễn phí 24/7' },
                  { id: 'MOMO', name: 'Ví MoMo', desc: 'Thanh toán qua app MoMo' },
                  { id: 'VNPAY', name: 'Cổng VNPAY', desc: 'Thẻ ATM & Visa/Mastercard' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                      paymentProvider === item.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentProvider === item.id}
                        onChange={() => setPaymentProvider(item.id as PaymentProvider)}
                        className="text-primary focus:ring-primary mb-2"
                      />
                      <strong className="block text-sm text-navy">{item.name}</strong>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 block">{item.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                Tôi cam kết thông tin khai báo là hoàn toàn chính xác, cam kết tuân thủ Điều lệ giải đấu và chịu trách nhiệm về tình trạng sức khỏe khi tham gia thi đấu.
              </label>
            </div>

          </div>

          {/* Right Column (1/3): Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
              
              <h3 className="font-bold text-navy text-sm pb-3 border-b border-slate-100">
                Tóm tắt đăng ký
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Hạng mục:</span>
                  <strong className="text-navy font-semibold">{selectedCategory.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Lệ phí thi đấu:</span>
                  <span className="text-navy">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCategory.fee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí tiện ích CourtMate:</span>
                  <span className="text-emerald-600 font-semibold">Miễn phí 0đ</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Tổng tiền thanh toán:</span>
                  <span className="text-xl font-extrabold text-navy">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCategory.fee)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting ? (
                  <span>Đang xử lý giao dịch...</span>
                ) : (
                  <>
                    <span>Tiến hành thanh toán</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Giao dịch mã hóa SSL 256-bit an toàn</span>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
