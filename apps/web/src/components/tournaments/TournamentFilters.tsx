import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Activity, Tag, Users, Wallet, X } from 'lucide-react';
import { SportType, TournamentStatus } from '@courtmate/shared';

export interface TournamentFilterState {
  sport: string;
  status: string;
  level: string;
  maxFee: number | undefined;
  isFreeOnly: boolean;
}

interface TournamentFiltersProps {
  isOpen: boolean;
  initialFilters: TournamentFilterState;
  onApply: (filters: TournamentFilterState) => void;
  onClose: () => void;
}

export const TournamentFilters: React.FC<TournamentFiltersProps> = ({
  isOpen,
  initialFilters,
  onApply,
  onClose,
}) => {
  const [filters, setFilters] = useState<TournamentFilterState>(initialFilters);

  // Sync local state when the drawer opens
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const updateFilter = (key: keyof TournamentFilterState, value: any) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Reset level if sport changes
      if (key === 'sport') {
        next.level = '';
      }
      return next;
    });
  };

  const handleReset = () => {
    setFilters({
      sport: '',
      status: '',
      level: '',
      maxFee: undefined,
      isFreeOnly: false,
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  const sports = [
    { value: '', label: 'Tất cả' },
    { value: SportType.BADMINTON, label: 'Cầu lông' },
    { value: SportType.PICKLEBALL, label: 'Pickleball' },
  ];

  const statuses = [
    { value: '', label: 'Tất cả' },
    { value: TournamentStatus.OPEN, label: 'Mở đăng ký' },
    { value: TournamentStatus.UPCOMING, label: 'Sắp diễn ra' },
    { value: TournamentStatus.FULL, label: 'Đã đủ số lượng' },
    { value: TournamentStatus.IN_PROGRESS, label: 'Đang diễn ra' },
  ];

  const badmintonLevels = [
    { value: '', label: 'Tất cả' },
    { value: 'newbie', label: 'Newbie' },
    { value: 'tb_yeu', label: 'TB Yếu' },
    { value: 'tb', label: 'Trung Bình' },
    { value: 'tb_kha', label: 'TB Khá' },
    { value: 'kha', label: 'Khá' },
  ];

  const pickleballLevels = [
    { value: '', label: 'Tất cả' },
    { value: '1.0-2.0', label: '1.0 - 2.0' },
    { value: '2.0-3.0', label: '2.0 - 3.0' },
    { value: '3.0-4.0', label: '3.0 - 4.0' },
    { value: '4.0-5.0', label: '4.0 - 5.0' },
    { value: '5.5+', label: '5.5+' },
  ];

  const currentLevels = 
    filters.sport === SportType.PICKLEBALL ? pickleballLevels : 
    filters.sport === SportType.BADMINTON ? badmintonLevels : [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h3 className="font-extrabold text-navy text-lg">Bộ lọc</h3>
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Sport Selector */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Môn thể thao
          </label>
          <div className="flex flex-wrap gap-2.5">
            {sports.map((sport) => {
              const isSelected = filters.sport === sport.value || (!filters.sport && !sport.value);
              return (
                <button
                  key={sport.value}
                  onClick={() => updateFilter('sport', sport.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#1E5AA8]/10 text-[#1E5AA8] border-[#1E5AA8]/30'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#1E5AA8]/30 hover:bg-slate-50'
                  }`}
                >
                  {sport.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Selector - Only show if a sport is selected */}
        {filters.sport && currentLevels.length > 0 && (
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Trình độ
            </label>
            <div className="flex flex-wrap gap-2.5">
              {currentLevels.map((level) => {
                const isSelected = filters.level === level.value || (!filters.level && !level.value);
                return (
                  <button
                    key={level.value}
                    onClick={() => updateFilter('level', level.value)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                      isSelected
                        ? 'bg-[#1E5AA8]/10 text-[#1E5AA8] border-[#1E5AA8]/30'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#1E5AA8]/30 hover:bg-slate-50'
                    }`}
                  >
                    {level.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fee Slider Selector */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Lệ phí tham gia
          </label>
          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="text-sm font-bold text-navy flex items-center justify-between">
              <span>Chi phí tối đa</span>
              <span className="text-[#1E5AA8]">
                {filters.isFreeOnly 
                  ? 'Miễn phí' 
                  : (filters.maxFee === undefined || filters.maxFee >= 1000) 
                    ? 'Mọi giá' 
                    : `≤ ${filters.maxFee}k`}
              </span>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer w-max">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer w-5 h-5 rounded-md border-2 border-slate-300 text-[#1E5AA8] focus:ring-[#1E5AA8] transition-all cursor-pointer"
                  checked={filters.isFreeOnly || false}
                  onChange={(e) => {
                     const checked = e.target.checked;
                     updateFilter('isFreeOnly', checked);
                     if (checked) {
                       updateFilter('maxFee', 0);
                     } else {
                       updateFilter('maxFee', 1000);
                     }
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-700">Chỉ buổi miễn phí</span>
            </label>

            <div className={`pt-2 transition-opacity duration-300 ${filters.isFreeOnly ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={filters.maxFee ?? 1000}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateFilter('maxFee', val);
                  if (val > 0 && filters.isFreeOnly) {
                    updateFilter('isFreeOnly', false);
                  }
                }}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1E5AA8]"
              />
              <div className="flex justify-between text-xs font-semibold text-slate-400 mt-3">
                <span>0k</span>
                <span>500k</span>
                <span>1000k+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Selector */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Trạng thái giải đấu
          </label>
          <div className="flex flex-wrap gap-2.5">
            {statuses.map((status) => {
              const isSelected = filters.status === status.value || (!filters.status && !status.value);
              return (
                <button
                  key={status.value}
                  onClick={() => updateFilter('status', status.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#1E5AA8]/10 text-[#1E5AA8] border-[#1E5AA8]/30'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#1E5AA8]/30 hover:bg-slate-50'
                  }`}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="shrink-0 p-4 border-t border-slate-100 bg-white grid grid-cols-3 gap-3">
        <button
          onClick={handleReset}
          className="col-span-1 py-3 px-4 rounded-full text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-center"
        >
          Đặt lại
        </button>
        <button
          onClick={handleApply}
          className="col-span-2 py-3 px-4 rounded-full text-sm font-bold text-white bg-[#1E5AA8] hover:bg-[#154687] transition-colors shadow-sm text-center"
        >
          Áp dụng
        </button>
      </div>

    </div>
  );
};
