import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { normalizeName } from '../../normalize-name';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../infrastructure/persistence/user.entity';
import { UserRole } from '@courtmate/shared';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /** Fills `nameNormalized` for users created before it existed or inserted by raw seed scripts. */
  async onModuleInit() {
    try {
      const missing = await this.userModel
        .find({ $or: [{ nameNormalized: { $exists: false } }, { nameNormalized: '', name: { $nin: ['', null] } }] })
        .select('name')
        .lean()
        .exec();
      if (missing.length === 0) return;
      await this.userModel.bulkWrite(
        missing.map((u: any) => ({
          updateOne: { filter: { _id: u._id }, update: { $set: { nameNormalized: normalizeName(u.name) } } },
        })),
      );
      this.logger.log(`Backfilled nameNormalized for ${missing.length} users`);
    } catch (e) {
      this.logger.error('Failed to backfill nameNormalized', e as Error);
    }
  }

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

  async createWithPassword(email: string, passwordHash: string, name: string = '', role: UserRole = UserRole.USER): Promise<User> {
    const newUser = new this.userModel({
      email: email.toLowerCase(),
      identifier: email.toLowerCase(),
      password: passwordHash,
      name,
      role,
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
        // SECURITY: Prevent privilege escalation. Only allow self-assigning PLAYER or ORGANIZER.
        if (updateDto.role === UserRole.PLAYER || updateDto.role === UserRole.ORGANIZER) {
          user.role = updateDto.role;
        } else {
          throw new BadRequestException('Chỉ được chọn vai trò Vận động viên (PLAYER) hoặc Ban tổ chức (ORGANIZER)');
        }
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
    return this.userModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() }, { $addToSet: { bookmarkedTournaments: tournamentId } }, { new: true },
    ).exec();
  }

  async removeBookmark(email: string, tournamentId: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() }, { $pull: { bookmarkedTournaments: tournamentId } }, { new: true },
    ).exec();
  }

  async addCoachBookmark(email: string, coachId: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() }, { $addToSet: { bookmarkedCoaches: coachId } }, { new: true },
    ).exec();
  }

  async removeCoachBookmark(email: string, coachId: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() }, { $pull: { bookmarkedCoaches: coachId } }, { new: true },
    ).exec();
  }

  /** Users whose name contains `query`, ignoring case and accents, excluding the caller. */
  async searchByName(query: string, excludeId: string, limit = 10) {
    // Compare accent-free on both sides: "nguyen" and "Nguyễn" both find "Nguyễn Văn A"
    const q = normalizeName(query).slice(0, 50);
    if (q.length < 2) return [];

    const filter: Record<string, unknown> = {
      nameNormalized: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    };
    if (Types.ObjectId.isValid(excludeId)) filter._id = { $ne: excludeId };

    const users = await this.userModel
      .find(filter)
      .select('name role preferences.avatarUrl')
      .limit(limit)
      .lean()
      .exec();
    return users.map((u: any) => ({
      id: String(u._id),
      name: u.name || 'Người dùng',
      role: u.role,
      avatarUrl: u.preferences?.avatarUrl,
    }));
  }

  async getFriends(email: string): Promise<User[]> {
    const user = await this.findByEmail(email);
    if (!user || !user.friends) return [];
    return this.userModel.find({ _id: { $in: user.friends } }).exec();
  }
}
