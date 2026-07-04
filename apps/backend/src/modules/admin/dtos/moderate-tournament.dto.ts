import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ModerationAction } from '@courtmate/shared';

export class ModerateTournamentDto {
  @IsString()
  @IsNotEmpty()
  tournamentId!: string;

  @IsEnum(ModerationAction)
  action!: ModerationAction;

  @IsString()
  @IsOptional()
  reason?: string;
}
