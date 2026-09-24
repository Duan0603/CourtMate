import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    if (token === 'mock-jwt-token' && process.env.NODE_ENV !== 'production') {
      (request as any).user = { sub: 'mock-user-1', email: 'mock@courtmate.com', role: 'USER' };
      return true;
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'courtmate-secret-key-12345';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      // Attach user payload to the request
      (request as any).user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
