import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UserRole } from '@courtmate/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(email: string, role: UserRole = UserRole.USER): Promise<User> {
    const newUser = new this.userModel({
      email: email.toLowerCase(),
      role,
      preferences: { sports: [] },
      isVerified: false,
    });
    return newUser.save();
  }

  async updateProfile(
    email: string,
    updateDto: {
      name?: string;
      role?: UserRole;
      preferences?: {
        sports?: any[];
        location?: string;
        skillLevel?: string;
        clubName?: string;
      };
    },
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    if (updateDto.name !== undefined) {
      user.name = updateDto.name;
    }

    if (updateDto.role !== undefined) {
      // D-02: Role is locked permanently at onboarding. So only allow setting it if it is USER (un-onboarded)
      if (user.role === UserRole.USER || user.role === undefined) {
        user.role = updateDto.role;
      }
    }

    if (updateDto.preferences) {
      const prefs = user.preferences || { sports: [] };
      if (updateDto.preferences.sports !== undefined) {
        prefs.sports = updateDto.preferences.sports;
      }
      if (updateDto.preferences.location !== undefined) {
        prefs.location = updateDto.preferences.location;
      }
      if (updateDto.preferences.skillLevel !== undefined) {
        prefs.skillLevel = updateDto.preferences.skillLevel;
      }
      if (updateDto.preferences.clubName !== undefined) {
        prefs.clubName = updateDto.preferences.clubName;
      }
      user.preferences = prefs;
    }

    user.isVerified = true;
    return user.save();
  }

  async addBookmark(email: string, tournamentId: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    if (!user.bookmarkedTournaments.includes(tournamentId)) {
      user.bookmarkedTournaments.push(tournamentId);
      return user.save();
    }
    return user;
  }

  async removeBookmark(email: string, tournamentId: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    user.bookmarkedTournaments = user.bookmarkedTournaments.filter(id => id !== tournamentId);
    return user.save();
  }
}
