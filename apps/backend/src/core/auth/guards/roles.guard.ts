import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../../../modules/users/infrastructure/persistence/user.entity';

/**
 * Guard that checks user role against @Roles() decorator.
 * Prioritizes verified JWT authentication.
 * Falls back to mock headers only in non-production environments.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Optional() private readonly jwtService?: JwtService,
    @Optional() private readonly configService?: ConfigService,
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
    let user = request.user;

    // 1. Try to authenticate via Bearer JWT token if user is not already attached
    if (!user && request.headers.authorization && this.jwtService) {
      const [type, token] = request.headers.authorization.split(' ');
      if (type === 'Bearer' && token) {
        try {
          const secret =
            this.configService?.get<string>('JWT_SECRET') ||
            process.env.JWT_SECRET ||
            'courtmate-secret-key-12345';
          const payload = await this.jwtService.verifyAsync(token, { secret });
          if (payload.sub) {
            user = await this.userModel.findById(payload.sub).exec();
          } else if (payload.email) {
            user = await this.userModel.findOne({ email: payload.email.toLowerCase() }).exec();
          }
        } catch {
          throw new UnauthorizedException('Token xác thực không hợp lệ hoặc đã hết hạn.');
        }
      }
    }

    // 2. Dev-only mock fallback (disabled in production)
    if (!user && process.env.NODE_ENV !== 'production') {
      const mockUserId = request.headers['x-mock-user-id'];
      if (mockUserId) {
        user = await this.userModel.findById(mockUserId).exec();
      }
    }

    if (!user) {
      throw new UnauthorizedException('Yêu cầu đăng nhập hợp lệ để truy cập tài nguyên này.');
    }

    // Attach user to request for @CurrentUser() decorator
    request.user = user;

    // Check if user has one of the required roles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Vai trò '${user.role}' không có quyền truy cập. Yêu cầu: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
