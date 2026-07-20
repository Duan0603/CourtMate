import * as crypto from 'crypto';
import { Injectable, UnauthorizedException, OnModuleInit, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/domains/services/users.service';
import { UserRole } from '@courtmate/shared';

@Injectable()
export class AuthService implements OnModuleInit {
  // Map to store email -> { otp: string, expiresAt: number }
  private otpStorage = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    try {
      console.log('[AuthService] Checking & seeding test accounts...');
      
      const testUserEmail = 'test@courtmate.com';
      const testUserPasswordHash = this.hashPassword('Password123');
      const existingUser = await this.usersService.findByEmail(testUserEmail);
      if (!existingUser) {
        await this.usersService.createWithPassword(testUserEmail, testUserPasswordHash, 'Test Player');
        console.log(`[AuthService] Seeded test player account: ${testUserEmail} / Password123`);
      }

      const testOrgEmail = 'organizer@courtmate.com';
      const testOrgPasswordHash = this.hashPassword('Password123');
      const existingOrg = await this.usersService.findByEmail(testOrgEmail);
      if (!existingOrg) {
        await this.usersService.createWithPassword(testOrgEmail, testOrgPasswordHash, 'Test Organizer');
        await this.usersService.updateProfile(testOrgEmail, { role: UserRole.ORGANIZER });
        console.log(`[AuthService] Seeded test organizer account: ${testOrgEmail} / Password123`);
      }

      const testAdminEmail = 'admin@courtmate.com';
      const testAdminPasswordHash = this.hashPassword('Password123');
      const existingAdmin = await this.usersService.findByEmail(testAdminEmail);
      if (!existingAdmin) {
        await this.usersService.createWithPassword(testAdminEmail, testAdminPasswordHash, 'Test Regional Admin');
        await this.usersService.updateProfile(testAdminEmail, { role: UserRole.REGIONAL_ADMIN, preferences: { location: 'Da Nang', sports: [] } });
        console.log(`[AuthService] Seeded test admin account: ${testAdminEmail} / Password123`);
      }

      const testSuperEmail = 'superadmin@courtmate.com';
      const testSuperPasswordHash = this.hashPassword('Password123');
      const existingSuper = await this.usersService.findByEmail(testSuperEmail);
      if (!existingSuper) {
        await this.usersService.createWithPassword(testSuperEmail, testSuperPasswordHash, 'Test Super Admin');
        await this.usersService.updateProfile(testSuperEmail, { role: UserRole.SUPER_ADMIN });
        console.log(`[AuthService] Seeded test superadmin account: ${testSuperEmail} / Password123`);
      }

      // Link friendships
      const player = await this.usersService.findByEmail('test@courtmate.com');
      const organizer = await this.usersService.findByEmail('organizer@courtmate.com');
      const admin = await this.usersService.findByEmail('admin@courtmate.com');
      const superadmin = await this.usersService.findByEmail('superadmin@courtmate.com');
      // Link friendships sequentially to avoid VersionError
      if (player && organizer && admin && superadmin) {
        await this.usersService.updateProfile('test@courtmate.com', { friends: [organizer._id.toString(), admin._id.toString()] } as any);
        await this.usersService.updateProfile('organizer@courtmate.com', { friends: [player._id.toString(), superadmin._id.toString()] } as any);
        await this.usersService.updateProfile('admin@courtmate.com', { friends: [player._id.toString()] } as any);
        await this.usersService.updateProfile('superadmin@courtmate.com', { friends: [organizer._id.toString()] } as any);

        console.log('[AuthService] Successfully linked test friendships!');
      }
    } catch (e) {
      console.error('[AuthService] Error during seeding:', e);
    }
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await this.usersService.findByEmail(cleanEmail);
    if (existingUser) {
      throw new ConflictException('Email này đã được đăng ký sử dụng');
    }
    try {
      const passwordHash = this.hashPassword(password);
      const user = await this.usersService.createWithPassword(cleanEmail, passwordHash, name);
      
      const payload = { email: user.email, sub: user._id };
      const token = this.jwtService.sign(payload);
      return { token, user };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Email này đã được đăng ký sử dụng');
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(cleanEmail);
    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }
    if (!user.password) {
      throw new UnauthorizedException('Tài khoản này chưa cài đặt mật khẩu (Sử dụng OTP)');
    }
    const passwordHash = this.hashPassword(password);
    if (user.password !== passwordHash) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  async generateOtp(email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    
    // Generate 6-digit random number string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    this.otpStorage.set(cleanEmail, { otp, expiresAt });

    // D-07: Print development console banner with the 6-digit code
    console.log('\n=============================================');
    console.log(`[DEV ONLY] OTP code for ${cleanEmail} is: ${otp}`);
    console.log('=============================================\n');
  }

  async verifyOtp(email: string, otp: string): Promise<{ token: string; user: any }> {
    const cleanEmail = email.toLowerCase().trim();
    const record = this.otpStorage.get(cleanEmail);

    if (!record) {
      throw new UnauthorizedException('No OTP request found for this email');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStorage.delete(cleanEmail);
      throw new UnauthorizedException('OTP has expired');
    }

    if (record.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // OTP verified successfully, clear it
    this.otpStorage.delete(cleanEmail);

    // Look up or create user (default to PLAYER)
    let user = await this.usersService.findByEmail(cleanEmail);
    if (!user) {
      user = await this.usersService.create(cleanEmail, UserRole.USER);
    }

    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user,
    };
  }
}
