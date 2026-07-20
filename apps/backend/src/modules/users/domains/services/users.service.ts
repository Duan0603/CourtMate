import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../infrastructure/persistence/user.entity';
import { UserRole } from '@courtmate/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    const clean = email.toLowerCase().trim();
    return this.userModel.findOne({
      $or: [
        { email: clean },
        { identifier: clean }
      ]
    }).exec();
  }

  async findByCity(city: string): Promise<User[]> {
    return this.userModel.find({ 'preferences.location': city }).exec();
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userModel.find({ role }).exec();
  }

  async findAdminsByCity(city: string): Promise<User[]> {
    return this.userModel
      .find({ role: 'REGIONAL_ADMIN', 'preferences.location': city })
      .exec();
  }

  async countByCity(city: string): Promise<number> {
    return this.userModel.countDocuments({ 'preferences.location': city }).exec();
  }

  async create(email: string, role: UserRole = UserRole.USER): Promise<User> {
    const newUser = new this.userModel({
      email: email.toLowerCase(),
      identifier: email.toLowerCase(),
      role,
      preferences: { sports: [] },
      isVerified: false,
    });
    return newUser.save();
  }

  async createWithPassword(email: string, passwordHash: string, name: string = ''): Promise<User> {
    const newUser = new this.userModel({
      email: email.toLowerCase(),
      identifier: email.toLowerCase(),
      password: passwordHash,
      name,
      role: UserRole.USER,
      preferences: { sports: [] },
      isVerified: true,
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
        avatarUrl?: string;
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
      if (updateDto.preferences.avatarUrl !== undefined) {
        (prefs as any).avatarUrl = updateDto.preferences.avatarUrl;
      }
      user.preferences = prefs as any;
    }

    if ((updateDto as any).friends !== undefined) {
      user.friends = (updateDto as any).friends;
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

  async getFriends(email: string): Promise<User[]> {
    const user = await this.findByEmail(email);
    if (!user || !user.friends) return [];
    return this.userModel.find({ _id: { $in: user.friends } }).exec();
  }
}
