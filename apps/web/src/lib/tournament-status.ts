import { TournamentStatus } from '@courtmate/shared';

export function getTournamentStatus(tournament: { status: TournamentStatus; startDate: Date | string; endDate?: Date | string }, now = Date.now()): TournamentStatus {
  if (['CANCELLED', TournamentStatus.COMPLETED].includes(tournament.status)) return tournament.status;
  const end = tournament.endDate ? new Date(tournament.endDate).getTime() : NaN;
  if (end <= now) return TournamentStatus.COMPLETED;
  if (new Date(tournament.startDate).getTime() <= now) return TournamentStatus.IN_PROGRESS;
  return tournament.status;
}

export const tournamentStatusLabel: Record<TournamentStatus | 'CANCELLED', string> = {
  [TournamentStatus.OPEN]: 'Đang mở đăng ký',
  [TournamentStatus.UPCOMING]: 'Sắp diễn ra',
  [TournamentStatus.FULL]: 'Đã đủ số lượng',
  [TournamentStatus.IN_PROGRESS]: 'Đang thi đấu',
  [TournamentStatus.COMPLETED]: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};
