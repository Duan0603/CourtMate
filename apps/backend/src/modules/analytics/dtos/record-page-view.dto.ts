import { IsString, MinLength } from 'class-validator';

export class RecordPageViewDto {
  @IsString()
  @MinLength(1)
  route!: string;
}
