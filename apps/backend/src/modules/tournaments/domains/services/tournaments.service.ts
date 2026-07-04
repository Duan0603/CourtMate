import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Tournament } from '../../infrastructure/persistence/tournament.entity';
import { SportType, TournamentStatus } from '@courtmate/shared';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name) private readonly tournamentModel: Model<Tournament>,
  ) {}

  async findAll(filters?: {
    city?: string;
    sport?: string;
    includeHidden?: boolean;
  }): Promise<Tournament[]> {
    const query: FilterQuery<Tournament> = {};

    if (filters?.city) {
      query.city = filters.city;
    }

    if (filters?.sport) {
      query.sport = filters.sport;
    }

    if (!filters?.includeHidden) {
      query.isHidden = { $ne: true };
    }

    return this.tournamentModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournamentModel.findById(id).exec();
  }

  async findByCity(city: string): Promise<Tournament[]> {
    return this.tournamentModel
      .find({ city, isHidden: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async countByCity(city: string): Promise<number> {
    return this.tournamentModel.countDocuments({ city }).exec();
  }

  async countActiveByCityAndSport(city: string): Promise<Record<string, number>> {
    const results = await this.tournamentModel.aggregate([
      { $match: { city, isHidden: { $ne: true } } },
      { $group: { _id: '$sport', count: { $sum: 1 } } },
    ]);

    const bySport: Record<string, number> = {};
    for (const r of results) {
      bySport[r._id] = r.count;
    }
    return bySport;
  }

  async updateModeration(
    id: string,
    update: { isHidden?: boolean; isFeatured?: boolean },
  ): Promise<Tournament | null> {
    return this.tournamentModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .exec();
  }

  async seedMockData() {
    const count = await this.tournamentModel.countDocuments();
    if (count > 0) return; // Already seeded

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const mockTournaments = [
      {
        title: 'Da Nang Badminton Open 2026',
        description: 'Giải cầu lông mở rộng lớn nhất Đà Nẵng',
        sport: SportType.BADMINTON,
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        location: 'Cung Thể thao Tiên Sơn',
        district: 'Hai Chau',
        city: 'Da Nang',
        organizer: {
          id: 'org1',
          name: 'Da Nang Sports Hub',
          isVerified: true,
        },
        status: TournamentStatus.OPEN,
        categories: [
          { name: "Men's Singles", fee: 150000 },
          { name: "Mixed Doubles", fee: 250000 },
        ],
        rules: 'Standard BWF rules apply. 1 set up to 21 points.',
        schedule: [
          '08:00 - Opening Ceremony',
          '09:00 - Qualification Rounds',
          '16:00 - Quarter Finals',
        ],
      },
      {
        title: 'Ho Chi Minh Pickleball Championship',
        description: 'Giải Pickleball chuyên nghiệp tại TP.HCM',
        sport: SportType.PICKLEBALL,
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
        location: 'Sân Pickleball Celadon',
        district: 'Tan Phu',
        city: 'Ho Chi Minh',
        organizer: {
          id: 'org2',
          name: 'HCM Pickleball Club',
          isVerified: true,
        },
        status: TournamentStatus.UPCOMING,
        categories: [
          { name: "Open Doubles", fee: 300000 },
        ],
        rules: 'Double elimination format.',
      },
      {
        title: 'Hanoi Football League',
        description: 'Giải bóng đá phong trào sân 7',
        sport: SportType.FOOTBALL,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Started last week
        endDate: nextMonth,
        location: 'Sân bóng Đại học Thủy Lợi',
        district: 'Dong Da',
        city: 'Ha Noi',
        organizer: {
          id: 'org3',
          name: 'Hanoi FC Amateurs',
          isVerified: false,
        },
        status: TournamentStatus.IN_PROGRESS,
        categories: [
          { name: "Men's 7v7", fee: 5000000 },
        ],
        rules: '7-a-side rules. 2 halves of 30 minutes.',
      }
    ];

    await this.tournamentModel.insertMany(mockTournaments);
    console.log('[Seed] Mock tournaments seeded successfully');
  }
}
