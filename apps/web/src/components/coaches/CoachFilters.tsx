import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Star } from 'lucide-react';
import { SportType } from '@courtmate/shared';
import { money } from '../../lib/coaches.mock';

export interface CoachFilterState {
  sport: string;
  district: string;
  budget: string;
  minRating: string;
  minExperience: string;
}

interface CoachFiltersProps {
  isOpen: boolean;
  initialFilters: CoachFilterState;
  districts: string[];
  tab?: string;
  onApply: (filters: CoachFilterState) => void;
  onClose: () => void;
}

export const CoachFilters: React.FC<CoachFiltersProps> = ({
  isOpen,
  initialFilters,
  districts,
  tab = 'coaches',
  onApply,
  onClose,
}) => {
  const [filters, setFilters] = useState<CoachFilterState>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const updateFilter = <K extends keyof CoachFilterState>(key: K, value: CoachFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      sport: '',
      district: '',
      budget: '',
      minRating: '',
      minExperience: '',
    });
  };

  const sports = [
    { value: '', label: 'Tất cả' },
    { value: SportType.BADMINTON, label: 'Cầu lông' },
    { value: SportType.PICKLEBALL, label: 'Pickleball' },
  ];

  const ratingOptions = [
    { value: '', label: 'Tất cả' },
    { value: '4', label: 'Từ 4.0 sao' },
    { value: '4.5', label: 'Từ 4.5 sao' },
    { value: '4.9', label: 'Từ 4.9 sao' },
  ];

  const expOptions = [
    { value: '', label: 'Tất cả' },
    { value: '5', label: 'Từ 5 năm' },
    { value: '10', label: 'Từ 10 năm' },
    { value: '15', label: 'Từ 15 năm' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink shrink-0">
        <h3 className="font-extrabold text-navy text-lg">Bộ lọc</h3>
        <button
          type="button"
          onClick={onClose}
          className="cm-button p-2 -mr-2 rounded-full hover:bg-white transition-colors text-muted"
          aria-label="Đóng bộ lọc"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Sport Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-muted block">
            Môn thể thao
          </label>
          <div className="flex flex-wrap gap-2.5">
            {sports.map((s) => {
              const isSelected = filters.sport === s.value || (!filters.sport && !s.value);
              return (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => updateFilter('sport', s.value)}
                  className={`cm-button px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-accent-baby text-primary border-primary/30'
                      : 'bg-white text-muted border-ink hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-muted block">
            Đánh giá của học viên
          </label>
          <div className="flex flex-wrap gap-2.5">
            {ratingOptions.map((opt) => {
              const isSelected = filters.minRating === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => updateFilter('minRating', opt.value)}
                  className={`cm-button flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-accent-baby text-primary border-primary/30'
                      : 'bg-white text-muted border-ink hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  {opt.value && <Star className="w-3.5 h-3.5 fill-primary text-primary" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Filter */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-muted block">
            Kinh nghiệm huấn luyện
          </label>
          <div className="flex flex-wrap gap-2.5">
            {expOptions.map((opt) => {
              const isSelected = filters.minExperience === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => updateFilter('minExperience', opt.value)}
                  className={`cm-button px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-accent-baby text-primary border-primary/30'
                      : 'bg-white text-muted border-ink hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* District Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-muted block">
            Khu vực (Đà Nẵng)
          </label>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => updateFilter('district', '')}
              className={`cm-button px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                !filters.district
                  ? 'bg-accent-baby text-primary border-primary/30'
                  : 'bg-white text-muted border-ink hover:border-primary/30 hover:bg-white'
              }`}
            >
              Tất cả các quận
            </button>
            {districts.map((d) => {
              const isSelected = filters.district === d;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => updateFilter('district', d)}
                  className={`cm-button px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-accent-baby text-primary border-primary/30'
                      : 'bg-white text-muted border-ink hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  Q. {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-ink">
          <div className="text-sm font-bold text-navy flex items-center justify-between">
            <span>{tab === 'courses' ? 'Học phí tối đa' : 'Học phí tối đa / giờ'}</span>
            <span className="text-primary font-bold">
              {filters.budget ? money(Number(filters.budget)) : 'Mọi mức giá'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500000"
            step="25000"
            value={filters.budget || '500000'}
            onChange={(e) =>
              updateFilter('budget', e.target.value === '500000' ? '' : e.target.value)
            }
            className="w-full accent-primary h-2 bg-white rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-muted font-semibold">
            <span>0đ</span>
            <span>250.000đ</span>
            <span>500.000đ+</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-ink flex items-center justify-between gap-3 shrink-0 bg-white">
        <button
          type="button"
          onClick={handleReset}
          className="cm-button flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-muted hover:text-navy hover:bg-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Đặt lại</span>
        </button>

        <button
          type="button"
          onClick={() => onApply(filters)}
          className="cm-button flex-1 py-3 px-6 rounded-full text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/20 text-center"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};
