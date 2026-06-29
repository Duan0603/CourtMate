import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament, TournamentDocument } from './tournament.schema';
import { SportType, TournamentStatus, CreateTournamentDto } from '@courtmate/shared';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<TournamentDocument>,
  ) {}

  async create(createDto: CreateTournamentDto, rulesFileUrl?: string, organizerInfo?: any): Promise<TournamentDocument> {
    const createdTournament = new this.tournamentModel({
      ...createDto,
      rulesFileUrl,
      organizer: organizerInfo || {
        id: 'mock-organizer-id',
        name: 'Mock Organizer',
        isVerified: true
      }
    });
    return createdTournament.save();
  }

  async incrementReportCount(id: string): Promise<TournamentDocument | null> {
    const tournament = await this.tournamentModel.findById(id);
    if (!tournament) {
      return null;
    }

    tournament.reportsCount += 1;
    
    // Auto-hide threshold
    if (tournament.reportsCount >= 5) {
      tournament.isHidden = true;
    }

    return tournament.save();
  }

  async findByOrganizerId(organizerId: string): Promise<TournamentDocument[]> {
    return this.tournamentModel
      .find({ 'organizer.id': organizerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByIds(ids: string[]): Promise<TournamentDocument[]> {
    return this.tournamentModel
      .find({ _id: { $in: ids }, isHidden: false })
      .exec();
  }

  async findAll(city?: string): Promise<TournamentDocument[]> {
    // 1. If a specific city is provided, try fetching tournaments for that city
    let filter: any = { isHidden: false };
    if (city) {
      filter.city = city;
    }

    let tournaments = await this.tournamentModel
      .find(filter)
      // Custom sort: open for registration first, then chronological
      .sort({ startDate: 1 })
      .exec();

    // 2. Fallback to national view (all cities) if local city is empty
    if (tournaments.length === 0 && city) {
      tournaments = await this.tournamentModel
        .find({ isHidden: false })
        .sort({ startDate: 1 })
        .exec();
    }

    // Sort to prioritize Open For Registration
    return tournaments.sort((a, b) => {
      const aIsOpen = a.status === TournamentStatus.OPEN ? -1 : 1;
      const bIsOpen = b.status === TournamentStatus.OPEN ? -1 : 1;
      if (aIsOpen !== bIsOpen) return aIsOpen - bIsOpen;
      return 0; // maintain chronological order for same status
    });
  }

  async findById(id: string): Promise<TournamentDocument> {
    const tournament = await this.tournamentModel.findById(id).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
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
