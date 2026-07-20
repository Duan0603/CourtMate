import { IsEnum, IsMongoId } from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  registrationId!: string;

  @IsEnum(['PAYOS', 'MOMO'])
  provider!: 'PAYOS' | 'MOMO';
}
