import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsEmail } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @IsOptional()
  @IsString()
  userAvatar?: string;

  @IsOptional()
  @IsString()
  userRole?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsNotEmpty()
  comment!: string;

  @IsOptional()
  @IsString()
  category?: string;
}
