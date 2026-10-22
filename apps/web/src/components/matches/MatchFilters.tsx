import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { SportType, BadmintonSkillLevel } from '@courtmate/shared';

export interface MatchFilterState {
  sport: SportType;
  district: string;
  skill: BadmintonSkillLevel | 'ALL';
}

interface MatchFiltersProps {
  isOpen: boolean;
  initialFilters: MatchFilterState;
  districts: string[];
  skillOptions: { value: BadmintonSkillLevel | 'ALL'; label: string }[];
  onApply: (filters: MatchFilterState) => void;
  onClose: () => void;
}

export const MatchFilters: React.FC<MatchFiltersProps> = ({
  isOpen,
  initialFilters,
  districts,
  skillOptions,
  onApply,
  onClose,
}) => {
  const [filters, setFilters] = useState<MatchFilterState>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const updateFilter = <K extends keyof MatchFilterState>(key: K, value: MatchFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      sport: SportType.BADMINTON,
      district: 'Tất cả',
      skill: 'ALL',
    });
  };

  const sports = [
    { value: SportType.BADMINTON, label: 'Cầu lông' },
    { value: SportType.PICKLEBALL, label: 'Pickleball' },
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
            {sports.map((sport) => {
              const isSelected = filters.sport === sport.value;
              return (
                <button
                  type="button"
                  key={sport.value}
                  onClick={() => updateFilter('sport', sport.value)}
                  className={`cm-button px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-accent-baby text-primary border-primary/30'
                      : 'bg-white text-muted border-ink hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  {sport.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Level Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-muted block">
            Trình độ yêu cầu
          </label>
          <div className="flex flex-wrap gap-2.5">
            {skillOptions.map((opt) => {
              const isSelected = filters.skill === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => updateFilter('skill', opt.value)}
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
                  {d === 'Tất cả' ? 'Tất cả các quận' : `Q. ${d}`}
                </button>
              );
            })}
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
