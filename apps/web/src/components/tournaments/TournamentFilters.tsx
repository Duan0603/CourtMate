import React from 'react';
import { Filter, RotateCcw, MapPin, Activity, Tag } from 'lucide-react';
import { SportType, TournamentStatus } from '@courtmate/shared';

interface TournamentFiltersProps {
  selectedSport?: string;
  onSelectSport: (sport?: string) => void;
  selectedCity?: string;
  onSelectCity: (city?: string) => void;
  selectedStatus?: string;
  onSelectStatus: (status?: string) => void;
  onReset: () => void;
}

export const TournamentFilters: React.FC<TournamentFiltersProps> = ({
  selectedSport,
  onSelectSport,
  selectedCity,
  onSelectCity,
  selectedStatus,
  onSelectStatus,
  onReset,
}) => {
  const sports = [
    { value: '', label: 'Tất cả môn đấu' },
    { value: SportType.BADMINTON, label: '🏸 Cầu lông' },
    { value: SportType.PICKLEBALL, label: '🏓 Pickleball' },
    { value: SportType.TENNIS, label: '🎾 Quần vợt' },
    { value: SportType.FOOTBALL, label: '⚽ Bóng đá mini' },
  ];

  const cities = [
    { value: '', label: 'Tất cả khu vực' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Ha Noi', label: 'Hà Nội' },
    { value: 'Ho Chi Minh', label: 'TP. Hồ Chí Minh' },
  ];

  const statuses = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: TournamentStatus.OPEN, label: 'Đang mở đăng ký' },
    { value: TournamentStatus.UPCOMING, label: 'Sắp diễn ra' },
    { value: TournamentStatus.FULL, label: 'Đã đủ số lượng' },
    { value: TournamentStatus.IN_PROGRESS, label: 'Đang diễn ra' },
  ];

  const hasActiveFilters = !!selectedSport || !!selectedCity || !!selectedStatus;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-navy text-sm">Bộ lọc tìm kiếm</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* Sport Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          Môn thể thao
        </label>
        <div className="space-y-1">
          {sports.map((sport) => {
            const isSelected = selectedSport === sport.value || (!selectedSport && !sport.value);
            return (
              <button
                key={sport.value}
                onClick={() => onSelectSport(sport.value || undefined)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
                }`}
              >
                <span>{sport.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* City Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Tỉnh / Thành phố
        </label>
        <div className="grid grid-cols-1 gap-1">
          {cities.map((city) => {
            const isSelected = selectedCity === city.value || (!selectedCity && !city.value);
            return (
              <button
                key={city.value}
                onClick={() => onSelectCity(city.value || undefined)}
                className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-navy text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
                }`}
              >
                {city.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          Trạng thái giải đấu
        </label>
        <div className="space-y-1">
          {statuses.map((status) => {
            const isSelected = selectedStatus === status.value || (!selectedStatus && !status.value);
            return (
              <button
                key={status.value}
                onClick={() => onSelectStatus(status.value || undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
