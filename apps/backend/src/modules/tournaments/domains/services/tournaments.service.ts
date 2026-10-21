import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Tournament } from '../../infrastructure/persistence/tournament.entity';
import { SportType, TournamentStatus, CreateTournamentDto } from '@courtmate/shared';
import { NotificationsService } from '../../../notifications/notifications.service';

@Injectable()
export class TournamentsService {
  private async refreshStatuses(): Promise<void> {
    const now = new Date();
    await this.tournamentModel.updateMany(
      { status: { $in: ['OPEN', 'UPCOMING', 'FULL', 'IN_PROGRESS'] }, endDate: { $lte: now } },
      { $set: { status: TournamentStatus.COMPLETED } },
    ).exec();
    await this.tournamentModel.updateMany(
      { status: { $in: ['OPEN', 'UPCOMING', 'FULL'] }, startDate: { $lte: now }, endDate: { $gt: now } },
      { $set: { status: TournamentStatus.IN_PROGRESS } },
    ).exec();
  }
  constructor(
    @InjectModel(Tournament.name) private readonly tournamentModel: Model<Tournament>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createDto: CreateTournamentDto, rulesFileUrl?: string, organizerInfo?: any): Promise<Tournament> {
    const createdTournament = new this.tournamentModel({
      ...createDto,
      rulesFileUrl: rulesFileUrl || createDto.rulesFileUrl,
      organizer: organizerInfo || {
        id: 'mock-organizer-id',
        name: 'Mock Organizer',
        isVerified: true
      }
    });
    const saved = await createdTournament.save();

    // Broadcast notification when tournament is publicly visible
    try {
      const status = saved.status as string;
      if (!saved.isHidden && (status === TournamentStatus.UPCOMING || status === TournamentStatus.OPEN)) {
        await this.notificationsService.send({
          type: 'TOURNAMENT_LAUNCHED',
          title: 'Giải đấu mới',
          body: saved.title,
          link: `/tournaments/${saved._id}`,
        });
      }
    } catch (error) {
      console.error('[Notifications] Broadcast error:', error);
    }

    return saved;
  }

  async incrementReportCount(id: string): Promise<Tournament | null> {
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

  async findByOrganizerId(organizerId: string): Promise<Tournament[]> {
    await this.refreshStatuses();
    return this.tournamentModel
      .find({ 'organizer.id': organizerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByIds(ids: string[]): Promise<Tournament[]> {
    await this.refreshStatuses();
    return this.tournamentModel
      .find({ _id: { $in: ids }, isHidden: { $ne: true } })
      .exec();
  }

  async findAll(filters?: {
    city?: string;
    sport?: string;
    status?: string;
    keyword?: string;
    minFee?: number;
    maxFee?: number;
    includeHidden?: boolean;
  }): Promise<Tournament[]> {
    await this.refreshStatuses();
    let filterObj: any = {};
    
    if (!filters?.includeHidden) {
      filterObj.isHidden = { $ne: true };
    }
    
    if (filters) {
      if (filters.city) {
        if (/hà nội|ha noi/i.test(filters.city)) {
          filterObj.city = { $regex: 'Hà Nội|Ha Noi', $options: 'i' };
        } else if (/hồ chí minh|tp\.? hcm|ho chi minh|sài gòn/i.test(filters.city)) {
          filterObj.city = { $regex: 'TP\\.? HCM|Hồ Chí Minh|Ho Chi Minh|Sài Gòn|HCM', $options: 'i' };
        } else if (/đà nẵng|da nang/i.test(filters.city)) {
          filterObj.city = { $regex: 'Đà Nẵng|Da Nang', $options: 'i' };
        } else {
          filterObj.city = { $regex: filters.city, $options: 'i' };
        }
      }
      if (filters.sport) filterObj.sport = filters.sport;
      if (filters.status) filterObj.status = filters.status;
      
      if (filters.keyword) {
        filterObj.$or = [
          { title: { $regex: filters.keyword, $options: 'i' } },
          { 'organizer.name': { $regex: filters.keyword, $options: 'i' } },
          { location: { $regex: filters.keyword, $options: 'i' } }
        ];
      }

      if (filters.minFee !== undefined || filters.maxFee !== undefined) {
        const feeQuery: any = {};
        if (filters.minFee !== undefined) feeQuery.$gte = Number(filters.minFee);
        if (filters.maxFee !== undefined) feeQuery.$lte = Number(filters.maxFee);
        filterObj.categories = { $elemMatch: { fee: feeQuery } };
      }
    }

    let tournaments = await this.tournamentModel
      .find(filterObj)
      .sort({ startDate: 1 })
      .exec();

    // Sort to prioritize Open For Registration
    return tournaments.sort((a, b) => {
      const aIsOpen = a.status === TournamentStatus.OPEN ? -1 : 1;
      const bIsOpen = b.status === TournamentStatus.OPEN ? -1 : 1;
      if (aIsOpen !== bIsOpen) return aIsOpen - bIsOpen;
      return 0; // maintain chronological order for same status
    });
  }

  async findById(id: string): Promise<Tournament> {
    await this.refreshStatuses();
    const tournament = await this.tournamentModel.findById(id).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
  }

  async findByCity(city: string): Promise<Tournament[]> {
    await this.refreshStatuses();
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
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const fromNow = (days: number) => new Date(now.getTime() + days * day);

    const mockTournaments = [
      {
        title: 'CourtMate Pickleball Open Đà Nẵng',
        description: 'Giải đấu cộng đồng dành cho các cặp vận động viên tại Đà Nẵng.',
        sport: SportType.PICKLEBALL,
        coverImage: '/tournaments/pickleball-1.jpg',
        startDate: fromNow(5),
        endDate: fromNow(7),
        location: 'Khu thể thao Tuyên Sơn, Đà Nẵng',
        district: 'Hải Châu',
        city: 'Da Nang',
        organizer: {
          id: 'seed-org-courtmate-pb',
          name: 'CourtMate',
          isVerified: true,
        },
        status: TournamentStatus.IN_PROGRESS,
        categories: [
          { id: 'cat-pb-open', name: 'Mở rộng', fee: 150000, maxParticipants: 32 },
        ],
        joinedSlots: 24,
        slotsLimit: 32,
        isFeatured: true,
        matchDates: [fromNow(5), fromNow(6)],
      },
      {
        title: 'Cúp Cầu lông Phong trào Hải Châu',
        description: 'Sân chơi phong trào dành cho vận động viên cầu lông khu vực Hải Châu.',
        sport: SportType.BADMINTON,
        coverImage: '/tournaments/badminton-1.jpg',
        startDate: fromNow(15),
        endDate: fromNow(17),
        location: 'Nhà thi đấu Phan Châu Trinh, Đà Nẵng',
        district: 'Hải Châu',
        city: 'Da Nang',
        organizer: {
          id: 'seed-org-hc-bm',
          name: 'Đà Nẵng Sports',
          isVerified: false,
        },
        status: TournamentStatus.OPEN,
        categories: [
          { id: 'cat-bm-phongtrao', name: 'Phong trào', fee: 100000, maxParticipants: 24 },
        ],
        joinedSlots: 12,
        slotsLimit: 24,
        matchDates: [fromNow(15), fromNow(16), fromNow(17)],
      },
      {
        title: 'Cúp Cầu lông CourtMate Đà Nẵng 2026',
        description: 'Giải cầu lông phong trào dành cho người chơi tại Đà Nẵng, thi đấu các nội dung đơn nam, đôi nam và đôi nam nữ.',
        sport: SportType.BADMINTON,
        coverImage: '/tournaments/badminton-2.jpg',
        startDate: fromNow(7),
        endDate: fromNow(9),
        location: 'Cung Thể thao Tiên Sơn',
        district: 'Hải Châu',
        city: 'Da Nang',
        organizer: {
          id: 'seed-org-danang-sports',
          name: 'Đà Nẵng Sports Hub',
          isVerified: true,
        },
        status: TournamentStatus.OPEN,
        categories: [
          { id: 'mens-singles', name: 'Đơn nam phong trào', fee: 5000, maxParticipants: 32 },
          { id: 'mixed-doubles', name: 'Đôi nam nữ', fee: 5000, maxParticipants: 24 },
        ],
        rules: 'Áp dụng luật BWF, mỗi trận đấu 3 hiệp 21 điểm.',
        schedule: ['07:30 - Check-in', '08:00 - Vòng bảng', '15:30 - Chung kết'],
        isFeatured: true,
        matchDates: [fromNow(7), fromNow(8), fromNow(9)],
      },
      {
        title: 'Sơn Trà Pickleball Open 2026',
        description: 'Sân chơi giao lưu pickleball cuối tuần với nhiều trình độ, phù hợp cả người mới và vận động viên bán chuyên.',
        sport: SportType.PICKLEBALL,
        coverImage: '/tournaments/pickleball-2.jpg',
        startDate: fromNow(12),
        endDate: fromNow(13),
        location: 'Sân Pickleball Sơn Trà',
        district: 'Sơn Trà',
        city: 'Da Nang',
        organizer: {
          id: 'seed-org-sontra-pickleball',
          name: 'Sơn Trà Pickleball Club',
          isVerified: true,
        },
        status: TournamentStatus.OPEN,
        categories: [{ id: 'open-doubles', name: 'Đôi mở rộng', fee: 300000, maxParticipants: 32 }],
        rules: 'Vòng bảng tính điểm, các đội dẫn đầu vào vòng loại trực tiếp.',
        matchDates: [fromNow(12), fromNow(13)],
      },
      {
        title: 'Liên Chiểu Badminton Rookie Cup',
        description: 'Giải cầu lông dành riêng cho người mới chơi dưới hai năm, tạo môi trường thi đấu thân thiện và công bằng.',
        sport: SportType.BADMINTON,
        coverImage: '/tournaments/badminton-1.jpg',
        startDate: fromNow(25),
        endDate: fromNow(26),
        location: 'Nhà thi đấu quận Liên Chiểu',
        district: 'Liên Chiểu',
        city: 'Da Nang',
        organizer: { id: 'seed-org-lienchieu-badminton', name: 'Liên Chiểu Badminton Community', isVerified: false },
        status: TournamentStatus.UPCOMING,
        categories: [{ id: 'rookie-doubles', name: 'Đôi phong trào mới', fee: 120000, maxParticipants: 40 }],
        rules: 'Vận động viên chưa từng đạt giải cấp thành phố được đăng ký.',
      },
      {
        title: 'CourtMate Pickleball Night Challenge',
        description: 'Chuỗi trận pickleball buổi tối với thể thức ngắn, phù hợp người chơi văn phòng sau giờ làm.',
        sport: SportType.PICKLEBALL,
        coverImage: '/tournaments/pickleball-1.jpg',
        startDate: fromNow(3),
        endDate: fromNow(3),
        location: 'CourtMate Arena Tuyên Sơn',
        district: 'Hải Châu',
        city: 'Da Nang',
        organizer: { id: 'seed-org-courtmate', name: 'CourtMate Community', isVerified: true },
        status: TournamentStatus.OPEN,
        categories: [{ id: 'night-doubles', name: 'Đôi hỗn hợp 3.0–3.5', fee: 180000, maxParticipants: 20 }],
        rules: 'Mỗi trận một game 15 điểm, đổi sân khi một đội đạt 8 điểm.',
        isFeatured: true,
        matchDates: [fromNow(3), fromNow(4)],
      },
      {
        title: 'Huế Badminton Friendship Games',
        description: 'Giải giao hữu cầu lông miền Trung với các nội dung đôi phong trào và đôi gia đình.',
        sport: SportType.BADMINTON,
        coverImage: '/tournaments/badminton-2.jpg',
        startDate: fromNow(45),
        endDate: fromNow(46),
        location: 'Trung tâm Thể thao tỉnh Thừa Thiên Huế',
        district: 'Phú Nhuận',
        city: 'Hue',
        organizer: { id: 'seed-org-hue-badminton', name: 'Huế Badminton Association', isVerified: true },
        status: TournamentStatus.UPCOMING,
        categories: [
          { id: 'friendship-doubles', name: 'Đôi phong trào', fee: 160000, maxParticipants: 32 },
          { id: 'family-doubles', name: 'Đôi gia đình', fee: 120000, maxParticipants: 16 },
        ],
        rules: 'Thi đấu ba hiệp 15 điểm, vòng bảng chọn hai đội đứng đầu.',
      },
      {
        title: 'Women in Sport Pickleball Cup',
        description: 'Giải pickleball dành cho nữ nhằm kết nối cộng đồng và khuyến khích lối sống năng động.',
        sport: SportType.PICKLEBALL,
        coverImage: '/tournaments/pickleball-2.jpg',
        startDate: fromNow(16),
        endDate: fromNow(16),
        location: 'Cụm sân Pickleball Hòa Xuân',
        district: 'Cẩm Lệ',
        city: 'Da Nang',
        organizer: { id: 'seed-org-women-sport', name: 'Women in Sport Đà Nẵng', isVerified: false },
        status: TournamentStatus.OPEN,
        categories: [{ id: 'women-doubles', name: 'Đôi nữ 2.5–3.5', fee: 200000, maxParticipants: 32 }],
        rules: 'Vòng bảng một game 15 điểm, vòng loại trực tiếp ba game 11 điểm.',
      },
      {
        title: 'PPA Tour Asia – MB Vietnam Open 2025',
        description: 'Giải pickleball quốc tế thuộc hệ thống PPA Tour Asia, quy tụ các vận động viên hàng đầu tại Đà Nẵng.',
        sport: SportType.PICKLEBALL,
        coverImage: '/tournaments/pickleball-1.jpg',
        startDate: new Date('2025-09-30T00:00:00+07:00'),
        endDate: new Date('2025-10-04T23:59:59+07:00'),
        location: 'Cung thể thao Tiên Sơn và Khu thể thao Tuyên Sơn',
        district: 'Hải Châu',
        city: 'Da Nang',
        organizer: { id: 'facebook-mb-ppa-tour', name: 'PPA Tour Asia & MB', isVerified: false },
        status: TournamentStatus.COMPLETED,
        categories: [{ id: 'ppa-professional', name: 'Chuyên nghiệp quốc tế', fee: 0, maxParticipants: 32 }],
        rules: 'Thông tin được tổng hợp từ bài đăng công khai của ban tổ chức.',
        sourceName: 'MBBank trên Facebook',
        sourceUrl: 'https://www.facebook.com/VietnamMBBank/posts/1187972316708466/',
      },
    ];

    // Set all fees to 5000 as requested
    mockTournaments.forEach(t => {
      if (t.categories) {
        t.categories.forEach(c => c.fee = 5000);
      }
    });

    const result = await this.tournamentModel.bulkWrite(
      mockTournaments.map((tournament) => ({
        updateOne: {
          filter: { title: tournament.title },
          update: { $set: tournament },
          upsert: true,
        },
      })),
    );

    console.log(`[Seed] Added or updated ${result.upsertedCount + result.modifiedCount} tournament posts`);
    if (result.upsertedCount > 0) {
      console.log(`[Seed] Added ${result.upsertedCount} tournament posts`);
    }
  }
}
