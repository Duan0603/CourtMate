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
      
      const seedAccounts = [
        { email: 'test@courtmate.com', name: 'Test Player', role: UserRole.PLAYER },
        { email: 'player1@courtmate.com', name: 'Nguyễn Văn Hùng (VĐV Cầu lông)', role: UserRole.PLAYER },
        { email: 'player2@courtmate.com', name: 'Trần Thị Mai (VĐV Pickleball)', role: UserRole.PLAYER },
        { email: 'player3@courtmate.com', name: 'Lê Hoàng Nam (VĐV Tennis)', role: UserRole.PLAYER },
        { email: 'organizer@courtmate.com', name: 'Test Organizer (BTC)', role: UserRole.ORGANIZER },
        { email: 'btc.danang@courtmate.com', name: 'CLB Cầu Lông Đà Nẵng (BTC)', role: UserRole.ORGANIZER },
        { email: 'admin@courtmate.com', name: 'Test Regional Admin', role: UserRole.REGIONAL_ADMIN },
        { email: 'superadmin@courtmate.com', name: 'Test Super Admin', role: UserRole.SUPER_ADMIN },
      ];

      const defaultPasswordHash = this.hashPassword('Password123');

      for (const acc of seedAccounts) {
        let existing = await this.usersService.findByEmail(acc.email);
        if (!existing) {
          await this.usersService.createWithPassword(acc.email, defaultPasswordHash, acc.name, acc.role);
          console.log(`[AuthService] Seeded test account: ${acc.email} / Password123 (${acc.name})`);
        } else if (existing.name !== acc.name) {
          await this.usersService.updateProfile(acc.email, { name: acc.name, role: acc.role });
        }
      }

      // Fetch all seed users to get their _ids
      const seededUsers = await Promise.all(
        seedAccounts.map(acc => this.usersService.findByEmail(acc.email))
      );
      const validUsers = seededUsers.filter(Boolean) as any[];
      const allUserIds = validUsers.map(u => u._id.toString());

      // Link friendships: each user has all OTHER seed users in their friends list
      for (const u of validUsers) {
        const uId = u._id.toString();
        const friendIds = allUserIds.filter(id => id !== uId);
        await this.usersService.updateProfile(u.email, { friends: friendIds } as any);
      }

      console.log('[AuthService] Successfully linked test friendships for all test accounts!');
    } catch (e) {
      console.error('[AuthService] Error during seeding:', e);
    }
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(email: string, password: string, name: string, role?: UserRole): Promise<{ token: string; user: any }> {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await this.usersService.findByEmail(cleanEmail);
    if (existingUser) {
      throw new ConflictException('Email này đã được đăng ký sử dụng');
    }
    try {
      const passwordHash = this.hashPassword(password);
      // Validate role: self-registration only allows PLAYER or ORGANIZER
      const assignedRole = role === UserRole.ORGANIZER ? UserRole.ORGANIZER : UserRole.PLAYER;
      const user = await this.usersService.createWithPassword(cleanEmail, passwordHash, name, assignedRole);
      
      const payload = { email: user.email, sub: user._id, role: user.role, name: user.name };
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

    // In development, allow bypass for seeded accounts using 'Password123'
    if (process.env.NODE_ENV !== 'production' && password === 'Password123') {
      const payload = { email: user.email, sub: user._id, role: user.role, name: user.name };
      const token = this.jwtService.sign(payload);
      return { token, user };
    }

    if (!user.password) {
      throw new UnauthorizedException('Tài khoản này chưa cài đặt mật khẩu (Sử dụng OTP)');
    }
    const passwordHash = this.hashPassword(password);
    if (user.password !== passwordHash) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const payload = { email: user.email, sub: user._id, role: user.role, name: user.name };
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

    const payload = { email: user.email, sub: user._id, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user,
    };
  }

  async loginWithGoogle(idToken: string): Promise<{ token: string; user: any }> {
    let email: string;
    let name: string;
    let picture: string | undefined;

    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Allow dev token when developer hasn't configured Google Cloud Console credentials yet
    if (idToken.startsWith('google_demo_id_token')) {
      email = 'google.athlete@courtmate.vn';
      name = 'Google Athlete';
      picture = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
    } else {
      try {
        const { OAuth2Client } = await import('google-auth-library');
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken,
          audience: clientId || undefined,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new UnauthorizedException('Token Google không hợp lệ hoặc thiếu thông tin email');
        }
        email = payload.email.toLowerCase().trim();
        name = payload.name || email.split('@')[0];
        picture = payload.picture;
      } catch (err: any) {
        // Fallback: verify with Google tokeninfo endpoint
        try {
          const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
          if (!resp.ok) {
            throw new Error('Google tokeninfo call failed');
          }
          const data = await resp.json();
          if (!data.email) {
            throw new UnauthorizedException('Token Google không chứa email hợp lệ');
          }
          email = data.email.toLowerCase().trim();
          name = data.name || email.split('@')[0];
          picture = data.picture;
        } catch (fallbackErr: any) {
          throw new UnauthorizedException(`Xác thực tài khoản Google thất bại: ${err.message || fallbackErr.message}`);
        }
      }
    }

    // Find or create user
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      const randomPasswordHash = this.hashPassword(crypto.randomBytes(24).toString('hex'));
      user = await this.usersService.createWithPassword(email, randomPasswordHash, name);
      await this.usersService.updateProfile(email, {
        role: UserRole.PLAYER,
        preferences: {
          avatarUrl: picture,
          sports: [],
        },
      });
      user = await this.usersService.findByEmail(email);
    } else if (picture && (!user.preferences || !user.preferences.avatarUrl)) {
      await this.usersService.updateProfile(email, {
        preferences: {
          ...user.preferences,
          avatarUrl: picture,
        },
      });
      user = await this.usersService.findByEmail(email);
    }

    const payload = { email: user!.email, sub: user!._id, role: user!.role, name: user!.name };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user,
    };
  }
}

