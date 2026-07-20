import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Tournament } from '../../infrastructure/persistence/tournament.entity';
import { SportType, TournamentStatus, CreateTournamentDto } from '@courtmate/shared';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name) private readonly tournamentModel: Model<Tournament>,
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
    return createdTournament.save();
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
    return this.tournamentModel
      .find({ 'organizer.id': organizerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByIds(ids: string[]): Promise<Tournament[]> {
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
    let filterObj: any = {};
    
    if (!filters?.includeHidden) {
      filterObj.isHidden = { $ne: true };
    }
    
    if (filters) {
      if (filters.city) filterObj.city = filters.city;
      if (filters.sport) filterObj.sport = filters.sport;
      if (filters.status) filterObj.status = filters.status;
      
      if (filters.keyword) {
        filterObj.$or = [
          { title: { $regex: filters.keyword, $options: 'i' } },
          { 'organizer.name': { $regex: filters.keyword, $options: 'i' } }
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

    // Fallback to national view (all cities) if local city is empty and no other strict filters applied
    if (tournaments.length === 0 && filters?.city && !filters.keyword && !filters.sport) {
      const fallbackQuery: any = {};
      if (!filters?.includeHidden) {
        fallbackQuery.isHidden = { $ne: true };
      }
      tournaments = await this.tournamentModel
        .find(fallbackQuery)
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

  async findById(id: string): Promise<Tournament> {
    const tournament = await this.tournamentModel.findById(id).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
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
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const fromNow = (days: number) => new Date(now.getTime() + days * day);

    const mockTournaments = [
      {
        title: 'CourtMate Pickleball Open Đà Nẵng',
        description: 'Giải đấu cộng đồng dành cho các cặp vận động viên tại Đà Nẵng.',
        sport: SportType.PICKLEBALL,
        coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85',
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
        coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85',
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
        coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85',
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
        coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85',
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
        title: 'Hải Châu Football League S7',
        description: 'Giải bóng đá sân 7 dành cho các câu lạc bộ và doanh nghiệp tại khu vực Hải Châu.',
        sport: SportType.FOOTBALL,
        coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85',
        startDate: fromNow(-7),
        endDate: fromNow(21),
        location: 'Sân bóng đá Chuyên Việt',
        district: 'Hải Châu',
        city: 'Da Nang',
        organizer: {
          id: 'seed-org-haichau-football',
          name: 'Liên đoàn Bóng đá phong trào Đà Nẵng',
          isVerified: false,
        },
        status: TournamentStatus.IN_PROGRESS,
        categories: [{ id: 'mens-7v7', name: 'Bóng đá nam 7 người', fee: 3500000, maxParticipants: 16 }],
        rules: 'Thi đấu sân 7, hai hiệp 30 phút theo luật bóng đá phong trào.',
      },
      {
        title: 'Tennis Summer Cup Ngũ Hành Sơn',
        description: 'Giải tennis mùa hè dành cho hội viên phong trào, tổ chức nội dung đơn và đôi theo nhóm tuổi.',
        sport: SportType.TENNIS,
        coverImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=85',
        startDate: fromNow(18),
        endDate: fromNow(20),
        location: 'Cụm sân Tennis Tuyên Sơn',
        district: 'Ngũ Hành Sơn',
        city: 'Da Nang',
        organizer: { id: 'seed-org-danang-tennis', name: 'Hội Tennis Đà Nẵng', isVerified: true },
        status: TournamentStatus.OPEN,
        categories: [
          { id: 'tennis-singles', name: 'Đơn nam 18+', fee: 250000, maxParticipants: 32 },
          { id: 'tennis-doubles', name: 'Đôi nam 35+', fee: 400000, maxParticipants: 24 },
        ],
        rules: 'Thi đấu một set 6 game, tie-break khi tỷ số 6-6.',
        matchDates: [fromNow(18), fromNow(19), fromNow(20)],
      },
      {
        title: 'Liên Chiểu Badminton Rookie Cup',
        description: 'Giải cầu lông dành riêng cho người mới chơi dưới hai năm, tạo môi trường thi đấu thân thiện và công bằng.',
        sport: SportType.BADMINTON,
        coverImage: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be9?auto=format&fit=crop&w=1200&q=85',
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
        coverImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=85',
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
        title: 'Thanh Khê Futsal Community Cup',
        description: 'Giải futsal cộng đồng quy tụ các đội trẻ và câu lạc bộ phong trào tại Thanh Khê.',
        sport: SportType.FOOTBALL,
        coverImage: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=85',
        startDate: fromNow(30),
        endDate: fromNow(37),
        location: 'Nhà thi đấu đa năng Thanh Khê',
        district: 'Thanh Khê',
        city: 'Da Nang',
        organizer: { id: 'seed-org-thanhkhe-futsal', name: 'Thanh Khê Futsal', isVerified: true },
        status: TournamentStatus.UPCOMING,
        categories: [{ id: 'futsal-open', name: 'Futsal nam mở rộng', fee: 2500000, maxParticipants: 12 }],
        rules: 'Thi đấu vòng tròn bảng, mỗi trận hai hiệp 20 phút.',
      },
      {
        title: 'Hội An Heritage Tennis Open',
        description: 'Giải tennis giao hữu kết nối người chơi Đà Nẵng và Quảng Nam trong không gian thể thao Hội An.',
        sport: SportType.TENNIS,
        coverImage: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=85',
        startDate: fromNow(40),
        endDate: fromNow(41),
        location: 'Hội An Tennis Center',
        district: 'Cẩm Châu',
        city: 'Quang Nam',
        organizer: { id: 'seed-org-hoian-tennis', name: 'Hội An Tennis Club', isVerified: true },
        status: TournamentStatus.UPCOMING,
        categories: [{ id: 'heritage-doubles', name: 'Đôi nam nữ mở rộng', fee: 350000, maxParticipants: 24 }],
        rules: 'Thi đấu loại trực tiếp, một set chạm 6 game.',
      },
      {
        title: 'Huế Badminton Friendship Games',
        description: 'Giải giao hữu cầu lông miền Trung với các nội dung đôi phong trào và đôi gia đình.',
        sport: SportType.BADMINTON,
        coverImage: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be9?auto=format&fit=crop&w=1200&q=85',
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
        title: 'Da Nang Junior Football Festival U15',
        description: 'Ngày hội bóng đá trẻ dành cho các học viện và đội bóng cộng đồng lứa tuổi dưới 15.',
        sport: SportType.FOOTBALL,
        coverImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=85',
        startDate: fromNow(50),
        endDate: fromNow(52),
        location: 'Làng Thể thao Tuyên Sơn',
        district: 'Hải Châu',
        city: 'Da Nang',
        organizer: { id: 'seed-org-junior-football', name: 'Học viện Bóng đá trẻ Đà Nẵng', isVerified: true },
        status: TournamentStatus.UPCOMING,
        categories: [{ id: 'u15-7v7', name: 'Bóng đá U15 sân 7', fee: 0, maxParticipants: 16 }],
        rules: 'Cầu thủ sinh từ năm 2011 trở về sau, mỗi đội đăng ký tối đa 14 cầu thủ.',
      },
      {
        title: 'Women in Sport Pickleball Cup',
        description: 'Giải pickleball dành cho nữ nhằm kết nối cộng đồng và khuyến khích lối sống năng động.',
        sport: SportType.PICKLEBALL,
        coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85',
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
        title: 'University Tennis Championship 2026',
        description: 'Giải tennis sinh viên mở rộng dành cho các trường đại học khu vực miền Trung.',
        sport: SportType.TENNIS,
        coverImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=85',
        startDate: fromNow(60),
        endDate: fromNow(62),
        location: 'Sân Tennis Đại học Đà Nẵng',
        district: 'Ngũ Hành Sơn',
        city: 'Da Nang',
        organizer: { id: 'seed-org-university-sport', name: 'Đại học Đà Nẵng', isVerified: true },
        status: TournamentStatus.UPCOMING,
        categories: [
          { id: 'student-singles', name: 'Đơn sinh viên', fee: 80000, maxParticipants: 48 },
          { id: 'student-doubles', name: 'Đôi sinh viên', fee: 120000, maxParticipants: 32 },
        ],
        rules: 'Người tham dự cần xuất trình thẻ sinh viên còn hiệu lực khi check-in.',
      },
      {
        title: 'PPA Tour Asia – MB Vietnam Open 2025',
        description: 'Giải pickleball quốc tế thuộc hệ thống PPA Tour Asia, quy tụ các vận động viên hàng đầu tại Đà Nẵng.',
        sport: SportType.PICKLEBALL,
        coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85',
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
      {
        title: 'Giải Hạng Nhất Quốc gia 2025/26',
        description: 'Mùa giải có 13 đội thi đấu vòng tròn hai lượt; hai đội đầu bảng giành quyền lên V.League 2026/27.',
        sport: SportType.FOOTBALL,
        coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85',
        startDate: new Date('2025-09-19T00:00:00+07:00'),
        endDate: new Date('2026-06-20T23:59:59+07:00'),
        location: 'Thi đấu sân nhà và sân khách trên toàn quốc',
        city: 'Viet Nam',
        organizer: { id: 'facebook-vff-vleague2', name: 'Liên đoàn Bóng đá Việt Nam', isVerified: false },
        status: TournamentStatus.COMPLETED,
        categories: [{ id: 'vleague2-clubs', name: 'Câu lạc bộ chuyên nghiệp', fee: 0, maxParticipants: 13 }],
        rules: 'Thông tin được tổng hợp từ bài đăng công khai của VFF.',
        sourceName: 'VFF trên Facebook',
        sourceUrl: 'https://www.facebook.com/vietnamesefootball/posts/1086250497042196/',
      },
      {
        title: 'Vòng loại U23 châu Á 2026 – Bảng C',
        description: 'U23 Việt Nam thi đấu cùng Bangladesh, Singapore và Yemen để cạnh tranh vé dự vòng chung kết.',
        sport: SportType.FOOTBALL,
        coverImage: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1200&q=85',
        startDate: new Date('2025-09-03T00:00:00+07:00'),
        endDate: new Date('2025-09-09T23:59:59+07:00'),
        location: 'Việt Nam',
        city: 'Viet Nam',
        organizer: { id: 'facebook-vff-u23', name: 'Liên đoàn Bóng đá Việt Nam', isVerified: false },
        status: TournamentStatus.COMPLETED,
        categories: [{ id: 'u23-national-teams', name: 'Đội tuyển U23 quốc gia', fee: 0, maxParticipants: 4 }],
        rules: 'Thông tin được tổng hợp từ bài đăng công khai của VFF.',
        sourceName: 'VFF trên Facebook',
        sourceUrl: 'https://www.facebook.com/vietnamesefootball/posts/1100652048935374/',
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
