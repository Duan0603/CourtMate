import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard that verifies a REGIONAL_ADMIN is operating within their assigned city.
 *
 * Expects:
 * - req.user (attached by RolesGuard) with role and preferences.location
 * - req.params.city OR req.query.city OR req.body.city as the target city
 *
 * SUPER_ADMIN bypasses city check (can operate on any region).
 */
@Injectable()
export class RegionalAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // SUPER_ADMIN can operate on any city
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Extract target city from request
    const targetCity =
      request.params?.city ||
      request.query?.city ||
      request.body?.city;

    if (!targetCity) {
      throw new ForbiddenException('City parameter is required for regional admin operations');
    }

    const adminCity = user.preferences?.location;

    if (!adminCity || adminCity.toLowerCase() !== targetCity.toLowerCase()) {
      throw new ForbiddenException(
        `Regional admin for '${adminCity}' cannot operate on city '${targetCity}'`,
      );
    }

    return true;
  }
}
