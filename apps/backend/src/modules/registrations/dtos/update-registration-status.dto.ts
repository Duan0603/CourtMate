import { IsEnum, IsNotEmpty } from 'class-validator';
import { RegistrationStatus } from '@courtmate/shared';

export class UpdateRegistrationStatusDto {
  @IsEnum(RegistrationStatus, {
    message: 'Trạng thái không hợp lệ (phải là PENDING, APPROVED, PAID, hoặc REJECTED)',
  })
  @IsNotEmpty()
  status!: RegistrationStatus;
}
