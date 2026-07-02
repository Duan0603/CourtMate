import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches } from 'class-validator';
import { SkillLevel } from '@courtmate/shared';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  tournamentId!: string;

  @IsString()
  @IsNotEmpty()
  playerName!: string;

  @IsString()
  @IsOptional()
  partnerName?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/(^0[3|5|7|8|9][0-9]{8}$)/, {
    message: 'Số điện thoại không hợp lệ (định dạng Việt Nam, ví dụ: 0905123456)',
  })
  contactPhone!: string;

  @IsEnum(SkillLevel, {
    message: 'Trình độ không hợp lệ (phải là BEGINNER, INTERMEDIATE, hoặc ADVANCED)',
  })
  skillLevel!: SkillLevel;
}
