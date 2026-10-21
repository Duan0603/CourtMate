'use client';

import React from 'react';
import { Search, Trophy, Users, RefreshCw, RotateCcw } from 'lucide-react';

interface DirectoryEmptyStateProps {
  kind: 'tournaments' | 'matches';
  filtered: boolean;
  onReset: () => void;
  onRefresh: () => void;
}

export function DirectoryEmptyState({
  kind,
  filtered,
  onReset,
  onRefresh,
}: DirectoryEmptyStateProps) {
  const Icon = filtered ? Search : kind === 'tournaments' ? Trophy : Users;
  const noun = kind === 'tournaments' ? 'giải đấu' : 'trận giao lưu';

  return (
    <div
      role="status"
      className="w-full max-w-xl mx-auto my-8 p-8 sm:p-12 text-center bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000] flex flex-col items-center justify-center transition-all"
    >
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-2xl bg-[#EBF3FA] text-primary border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center mb-5 shrink-0">
        <Icon className="w-8 h-8" />
      </div>

      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
        {filtered ? `Không tìm thấy ${noun} nào phù hợp` : `Hiện chưa có ${noun} nào`}
      </h2>

      {/* Description */}
      <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
        {filtered
          ? 'Không có kết quả nào khớp với bộ lọc bạn đang chọn. Hãy thử xóa bộ lọc hoặc tìm kiếm theo khu vực khác.'
          : `Các ${noun} mới sẽ được ban tổ chức cập nhật liên tục. Bạn có thể bấm nút bên dưới để tải lại dữ liệu mới nhất.`}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 w-full sm:w-auto">
        {filtered ? (
          <>
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white font-black text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-primary-dark transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xóa bộ lọc & xem tất cả</span>
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black font-black text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-slate-50 transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tải lại</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onRefresh}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-black text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-primary-dark transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tải lại danh sách</span>
          </button>
        )}
      </div>
    </div>
  );
}
