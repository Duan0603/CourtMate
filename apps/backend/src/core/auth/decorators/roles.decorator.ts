import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict endpoint access to specific UserRole values.
 * Usage: @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
