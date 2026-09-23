'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { SportType, CreateTournamentDto } from '@courtmate/shared';
import { tournamentsApi } from '../../../lib/tournaments.api';

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<SportType>(SportType.BADMINTON);
  const [city, setCity] = useState('Đà Nẵng');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('2026-10-20');
  const [endDate, setEndDate] = useState('2026-10-22');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80');

  // Categories
  const [categories, setCategories] = useState<Array<{ name: string; fee: number; maxParticipants: number }>>([
    { name: 'Đơn Nam Nâng Cao', fee: 250000, maxParticipants: 32 },
    { name: 'Đôi Nam Nữ Phong Trào', fee: 400000, maxParticipants: 24 },
  ]);

  const [rulesText, setRulesText] = useState(
    '1. VĐV có mặt trước giờ thi đấu 20 phút.\n2. Thể thức loại trực tiếp chạm 21 điểm.\n3. Tuân thủ quyết định của tổ trọng tài.'
  );

  const addCategory = () => {
    setCategories([...categories, { name: 'Hạng mục mới', fee: 200000, maxParticipants: 16 }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const updateCategory = (index: number, field: string, val: any) => {
    const updated = [...categories];
    (updated[index] as any)[field] = val;
    setCategories(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dto: CreateTournamentDto = {
        title,
        description,
        sport,
        time: `${startDate} - ${endDate}`,
        location,
        city,
        categories,
        registrationFee: categories[0]?.fee || 200000,
        slotsLimit: categories.reduce((sum, c) => sum + (c.maxParticipants || 0), 0) || 50,
        rulesText,
        coverImage,
      };

      const created = await tournamentsApi.createTournament(dto);
      alert('Tạo giải đấu thành công!');
      router.push(`/tournaments/${created.id}`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo giải đấu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Link>

        {/* Wizard Steps Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
            Tạo & Khởi Chạy Giải Đấu Mới
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập thông tin, phân hạng mục thi đấu và mở cổng đăng ký cho các VĐV
          </p>

          <div className="mt-6 flex items-center justify-between relative">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-slate-200 -z-0" />
            {[
              { num: 1, label: 'Thông tin chung' },
              { num: 2, label: 'Hạng mục & Lệ phí' },
              { num: 3, label: 'Điều lệ & Hoàn tất' },
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
                    step >= s.num
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {s.num}
                </button>
                <span className="text-xs font-semibold text-navy mt-1.5 hidden sm:block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* STEP 1: General Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-navy pb-3 border-b border-slate-100">
                1. Thông tin giải đấu cơ bản
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Tên giải đấu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giải Cầu Lông Mùa Hè Đà Nẵng Open 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Môn thể thao <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value as SportType)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                  >
                    <option value={SportType.BADMINTON}>🏸 Cầu lông</option>
                    <option value={SportType.PICKLEBALL}>🏓 Pickleball</option>
                    <option value={SportType.TENNIS}>🎾 Quần vợt</option>
                    <option value={SportType.FOOTBALL}>⚽ Bóng đá mini</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Thành phố / Tỉnh <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                  >
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Ha Noi">Hà Nội</option>
                    <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Địa điểm thi đấu cụ thể (Tên nhà thi đấu / cụm sân) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cung Thể thao Tiên Sơn, Phan Đăng Lưu, Hải Châu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Ngày bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Ngày kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Mô tả & Giới thiệu giải đấu
                </label>
                <textarea
                  rows={3}
                  placeholder="Giới thiệu về mục đích, đối tượng tham gia và các giải thưởng hấp dẫn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!title || !location}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  <span>Tiếp tục: Hạng mục</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Categories */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-navy">
                  2. Thiết lập nội dung & Hạng mục thi đấu
                </h2>
                <button
                  type="button"
                  onClick={addCategory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm hạng mục</span>
                </button>
              </div>

              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy uppercase tracking-wider">
                        Hạng mục {idx + 1}
                      </span>
                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCategory(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Tên hạng mục
                        </label>
                        <input
                          type="text"
                          required
                          value={cat.name}
                          onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-navy"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Lệ phí (VNĐ)
                        </label>
                        <input
                          type="number"
                          required
                          value={cat.fee}
                          onChange={(e) => updateCategory(idx, 'fee', Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-navy"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Giới hạn VĐV / Đôi
                        </label>
                        <input
                          type="number"
                          required
                          value={cat.maxParticipants}
                          onChange={(e) => updateCategory(idx, 'maxParticipants', Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-navy"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Quay lại
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center gap-2 transition"
                >
                  <span>Tiếp tục: Điều lệ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Rules & Media */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-navy pb-3 border-b border-slate-100">
                3. Điều lệ giải đấu & Ảnh bìa
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  URL Ảnh bìa giải đấu (Banner)
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy"
                />
                {coverImage && (
                  <div className="mt-2 h-36 w-full rounded-xl overflow-hidden border border-slate-200">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Điều lệ thi đấu chính thức
                </label>
                <textarea
                  rows={6}
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-navy font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition"
                >
                  {submitting ? (
                    <span>Đang khởi tạo giải đấu...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xuất bản giải đấu ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
