import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../../../modules/users/infrastructure/persistence/user.entity';

/**
 * Guard that checks user role against @Roles() decorator.
 *
 * Mock auth strategy: reads X-Mock-User-Id header to look up the user.
 * This is consistent with the project's "Mock Data" constraint.
 * Replace with real JWT validation when auth module is fully implemented.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if roles are required for this endpoint
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles() decorator, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Mock auth: look up user by header
    const userId = request.headers['x-mock-user-id'];
    if (!userId) {
      throw new UnauthorizedException(
        'Missing X-Mock-User-Id header. Provide a valid user ID for mock authentication.',
      );
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException(`User not found: ${userId}`);
    }

    // Attach user to request for @CurrentUser() decorator
    request.user = user;

    // Check if user has one of the required roles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role '${user.role}' is not authorized. Required: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
