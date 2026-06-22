import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
