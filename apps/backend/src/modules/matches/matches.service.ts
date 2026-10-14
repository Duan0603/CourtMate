import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './match.schema';
import {
  BadmintonSkillLevel,
  CreateMatchDto,
  MatchFilterDto,
  MatchStatus,
  SportType,
} from '@courtmate/shared';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  /**
   * Tạo một kèo mới (Host tạo phòng)
   */
  async createMatch(
    user: { id: string; name: string; avatarUrl?: string; phone?: string },
    dto: CreateMatchDto,
  ): Promise<Match> {
    const startDate = new Date(dto.startTime);
    const endDate = new Date(dto.endTime);
    const now = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu hoặc kết thúc không hợp lệ');
    }

    if (startDate < now) {
      throw new BadRequestException('Thời gian bắt đầu trận đấu không thể ở quá khứ');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
    }

    if (dto.totalSlots < 2 || dto.totalSlots > 20) {
      throw new BadRequestException('Tổng số người tham gia phải từ 2 đến 20 người');
    }

    // Sinh share code ngẫu nhiên ngắn gọn (ví dụ: CM-7K9Q)
    const shareCode = `CM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newMatch = new this.matchModel({
      hostId: user.id,
      hostName: user.name,
      hostAvatar: user.avatarUrl || '',
      hostPhone: user.phone || '',
      sport: dto.sport || SportType.BADMINTON,
      title: dto.title,
      venueId: dto.venueId || '',
      venueName: dto.venueName,
      venueAddress: dto.venueAddress,
      district: dto.district,
      city: dto.city || 'Da Nang',
      courtNumber: dto.courtNumber || '',
      startTime: startDate,
      endTime: endDate,
      totalSlots: dto.totalSlots,
      joinedCount: 1, // Chủ kèo tự động là 1 slot
      players: [
        {
          userId: user.id,
          name: user.name,
          phone: user.phone || '',
          avatarUrl: user.avatarUrl || '',
          skillLevel: dto.minSkillLevel || BadmintonSkillLevel.TB,
          joinedAt: new Date(),
        },
      ],
      minSkillLevel: dto.minSkillLevel || BadmintonSkillLevel.TBY,
      maxSkillLevel: dto.maxSkillLevel || BadmintonSkillLevel.TB_PLUS,
      estimatedCostText: dto.estimatedCostText || 'Chia đều tiền sân tại chỗ',
      notes: dto.notes || '',
      shuttleType: dto.shuttleType || 'Cầu Thành Công / Hải Yến',
      status: MatchStatus.OPEN,
      shareCode,
    });

    return await newMatch.save();
  }

  /**
   * Lấy danh sách kèo theo bộ lọc (quận, môn, trình độ, ngày)
   */
  async getMatches(filters?: MatchFilterDto): Promise<Match[]> {
    const query: any = {};

    if (filters?.sport) {
      query.sport = filters.sport;
    }

    if (filters?.city && filters.city !== 'Tất cả') {
      query.city = filters.city;
    }

    if (filters?.district && filters.district !== 'Tất cả') {
      query.district = filters.district;
    }

    if (filters?.status) {
      query.status = filters.status;
    } else {
      // Mặc định hiển thị các kèo OPEN hoặc FULL sắp diễn ra
      query.status = { $in: [MatchStatus.OPEN, MatchStatus.FULL] };
    }

    if (filters?.skillLevel) {
      // Tìm kèo mà skillLevel của user nằm trong khoảng [minSkillLevel, maxSkillLevel]
      // Hoặc min/max khớp với skillLevel
      query.$or = [
        { minSkillLevel: filters.skillLevel },
        { maxSkillLevel: filters.skillLevel },
      ];
    }

    if (filters?.keyword) {
      const regex = new RegExp(filters.keyword, 'i');
      query.$or = [
        { title: regex },
        { venueName: regex },
        { venueAddress: regex },
        { district: regex },
      ];
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    return await this.matchModel.find(query).sort({ startTime: 1 }).exec();
  }

  /**
   * Chi tiết kèo theo ID hoặc ShareCode
   */
  async getMatchById(idOrShareCode: string): Promise<Match> {
    let match: MatchDocument | null = null;
    if (idOrShareCode.startsWith('CM-')) {
      match = await this.matchModel.findOne({ shareCode: idOrShareCode }).exec();
    } else {
      try {
        match = await this.matchModel.findById(idOrShareCode).exec();
      } catch {
        match = await this.matchModel.findOne({ shareCode: idOrShareCode }).exec();
      }
    }

    if (!match) {
      throw new NotFoundException('Không tìm thấy thông tin trận đấu');
    }
    return match;
  }

  /**
   * Người chơi tham gia kèo (1-chạm)
   */
  async joinMatch(
    user: { id: string; name: string; avatarUrl?: string; phone?: string },
    matchId: string,
    skillLevel?: BadmintonSkillLevel,
  ): Promise<Match> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException('Kèo đấu không tồn tại');
    }

    if (match.status !== MatchStatus.OPEN) {
      throw new BadRequestException('Kèo đấu này đã đủ người hoặc không còn nhận thêm');
    }

    // Kiểm tra xem đã join chưa
    const alreadyJoined = match.players.some((p) => p.userId === user.id);
    if (alreadyJoined) {
      throw new ConflictException('Bạn đã tham gia vào kèo đấu này rồi');
    }

    // Kiểm tra xem user_id đã tham gia slot ở kèo đấu khác chưa kết thúc chưa
    const now = new Date();
    const existingActiveMatch = await this.matchModel
      .findOne({
        _id: { $ne: match._id },
        'players.userId': user.id,
        status: { $in: [MatchStatus.OPEN, MatchStatus.FULL] },
        endTime: { $gte: now },
      })
      .exec();

    if (existingActiveMatch) {
      throw new BadRequestException(
        `Bạn đã tham gia một slot thi đấu khác ("${existingActiveMatch.title}" tại ${existingActiveMatch.venueName}). Mỗi người chơi chỉ được tham gia 1 slot tại một thời điểm để đảm bảo lịch trình!`,
      );
    }

    if (match.joinedCount >= match.totalSlots) {
      throw new BadRequestException('Kèo đấu đã đủ số lượng người tham gia');
    }

    // Thêm người chơi mới
    match.players.push({
      userId: user.id,
      name: user.name,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      skillLevel: skillLevel || match.minSkillLevel,
      joinedAt: new Date(),
    });

    match.joinedCount = match.players.length;

    // Nếu đã đủ số lượng slot thì tự động đổi sang FULL
    if (match.joinedCount >= match.totalSlots) {
      match.status = MatchStatus.FULL;
    }

    return await match.save();
  }

  /**
   * Lấy kèo đấu hiện tại hoặc sắp tới mà user đang tham gia
   */
  async getUserActiveMatch(userId: string): Promise<Match | null> {
    const now = new Date();
    return await this.matchModel
      .findOne({
        'players.userId': userId,
        status: { $in: [MatchStatus.OPEN, MatchStatus.FULL] },
        endTime: { $gte: now },
      })
      .sort({ startTime: 1 })
      .exec();
  }

  /**
   * Rút lui khỏi kèo (Hủy slot)
   */
  async leaveMatch(userId: string, matchId: string): Promise<Match> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException('Kèo đấu không tồn tại');
    }

    if (match.hostId === userId) {
      throw new BadRequestException(
        'Chủ kèo không thể rút lui. Vui lòng chọn Hủy kèo nếu không thể tổ chức.',
      );
    }

    const playerIndex = match.players.findIndex((p) => p.userId === userId);
    if (playerIndex === -1) {
      throw new NotFoundException('Bạn chưa tham gia kèo đấu này');
    }

    // Kiểm tra thời gian rút lui: Phải trước giờ đánh tối thiểu 2 tiếng
    const now = new Date();
    const hoursBefore = (new Date(match.startTime).getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursBefore < 2) {
      throw new BadRequestException(
        'Không thể rút lui khi trận đấu sắp diễn ra trong vòng 2 tiếng. Vui lòng liên hệ trực tiếp chủ kèo!',
      );
    }

    // Xóa player
    match.players.splice(playerIndex, 1);
    match.joinedCount = match.players.length;

    // Nếu trước đó đang FULL thì mở lại OPEN
    if (match.status === MatchStatus.FULL && match.joinedCount < match.totalSlots) {
      match.status = MatchStatus.OPEN;
    }

    return await match.save();
  }

  /**
   * Hủy kèo (chỉ dành cho Chủ Kèo)
   */
  async cancelMatch(userId: string, matchId: string): Promise<Match> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException('Kèo đấu không tồn tại');
    }

    if (match.hostId !== userId) {
      throw new ForbiddenException('Chỉ chủ kèo mới có quyền hủy kèo này');
    }

    match.status = MatchStatus.CANCELLED;
    return await match.save();
  }
}
