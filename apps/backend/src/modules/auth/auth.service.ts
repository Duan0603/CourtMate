import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '@courtmate/shared';

@Injectable()
export class AuthService {
  // Map to store email -> { otp: string, expiresAt: number }
  private otpStorage = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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
