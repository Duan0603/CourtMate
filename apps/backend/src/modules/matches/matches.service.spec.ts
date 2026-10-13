import { MatchesService } from './matches.service';
import { BadmintonSkillLevel, MatchStatus, SportType } from '@courtmate/shared';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('MatchesService (Unit Test)', () => {
  let service: MatchesService;
  let mockMatchModel: any;

  beforeEach(() => {
    // Mock Mongoose Model constructor and methods
    mockMatchModel = function (dto: any) {
      return {
        ...dto,
        _id: 'match_123',
        save: jest.fn().mockResolvedValue({
          ...dto,
          _id: 'match_123',
        }),
      };
    };
    mockMatchModel.find = jest.fn();
    mockMatchModel.findById = jest.fn();
    mockMatchModel.findOne = jest.fn();

    service = new MatchesService(mockMatchModel as any);
  });

  const mockUser = {
    id: 'user_host_1',
    name: 'Nguyễn Văn Host',
    avatarUrl: 'https://avatar.com/host.png',
    phone: '0905123456',
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(21, 0, 0, 0);

  describe('createMatch', () => {
    it('1. should successfully create a match with valid badminton skill levels', async () => {
      const dto = {
        sport: SportType.BADMINTON,
        title: 'Giao lưu cầu lông đôi nam tối thứ 5',
        venueName: 'Sân Cầu Lông Kỳ Đồng',
        venueAddress: '20 Kỳ Đồng, Thanh Khê, Đà Nẵng',
        district: 'Thanh Khê',
        city: 'Da Nang',
        courtNumber: 'Sân 3',
        startTime: tomorrow.toISOString(),
        endTime: tomorrowEnd.toISOString(),
        totalSlots: 4,
        minSkillLevel: BadmintonSkillLevel.TBY,
        maxSkillLevel: BadmintonSkillLevel.TB_PLUS,
        estimatedCostText: 'Chia đều tiền sân tại chỗ ~40k/người',
      };

      const result = await service.createMatch(mockUser, dto);
      expect(result).toBeDefined();
      expect(result.hostId).toBe(mockUser.id);
      expect(result.status).toBe(MatchStatus.OPEN);
      expect(result.joinedCount).toBe(1);
      expect(result.players).toHaveLength(1);
      expect(result.players[0].userId).toBe(mockUser.id);
      expect(result.minSkillLevel).toBe(BadmintonSkillLevel.TBY);
      expect(result.maxSkillLevel).toBe(BadmintonSkillLevel.TB_PLUS);
      expect(result.shareCode).toMatch(/^CM-[A-Z0-9]{4}$/);
    });

    it('2. should reject match creation if start time is in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const dto = {
        sport: SportType.BADMINTON,
        title: 'Kèo quá khứ',
        venueName: 'Sân Test',
        venueAddress: 'Địa chỉ',
        district: 'Hải Châu',
        startTime: yesterday.toISOString(),
        endTime: tomorrow.toISOString(),
        totalSlots: 4,
        minSkillLevel: BadmintonSkillLevel.TB,
        maxSkillLevel: BadmintonSkillLevel.TB,
      };

      await expect(service.createMatch(mockUser, dto)).rejects.toThrow(BadRequestException);
    });

    it('3. should reject match creation if totalSlots < 2 or > 20', async () => {
      const dto = {
        sport: SportType.BADMINTON,
        title: 'Kèo sai slot',
        venueName: 'Sân Test',
        venueAddress: 'Địa chỉ',
        district: 'Hải Châu',
        startTime: tomorrow.toISOString(),
        endTime: tomorrowEnd.toISOString(),
        totalSlots: 1, // Invalid
        minSkillLevel: BadmintonSkillLevel.TB,
        maxSkillLevel: BadmintonSkillLevel.TB,
      };

      await expect(service.createMatch(mockUser, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('joinMatch', () => {
    it('4. should successfully join an open match and increase joinedCount', async () => {
      const existingMatch = {
        _id: 'match_123',
        status: MatchStatus.OPEN,
        totalSlots: 4,
        joinedCount: 1,
        players: [{ userId: 'host_id', name: 'Host' }],
        minSkillLevel: BadmintonSkillLevel.TBY,
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this);
        }),
      };

      mockMatchModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingMatch),
      });

      const guestUser = { id: 'guest_user_2', name: 'Trần Văn Khách' };
      const updated = await service.joinMatch(guestUser, 'match_123', BadmintonSkillLevel.TB);

      expect(updated.joinedCount).toBe(2);
      expect(updated.players).toHaveLength(2);
      expect(updated.status).toBe(MatchStatus.OPEN);
      expect(existingMatch.save).toHaveBeenCalled();
    });

    it('5. should automatically transition status to FULL when last slot is joined', async () => {
      const existingMatch = {
        _id: 'match_123',
        status: MatchStatus.OPEN,
        totalSlots: 2,
        joinedCount: 1,
        players: [{ userId: 'host_id', name: 'Host' }],
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this);
        }),
      };

      mockMatchModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingMatch),
      });

      const secondUser = { id: 'guest_user_2', name: 'Người Thứ Hai' };
      const updated = await service.joinMatch(secondUser, 'match_123');

      expect(updated.joinedCount).toBe(2);
      expect(updated.status).toBe(MatchStatus.FULL);
    });

    it('6. should reject duplicate join from the same user', async () => {
      const existingMatch = {
        _id: 'match_123',
        status: MatchStatus.OPEN,
        totalSlots: 4,
        joinedCount: 2,
        players: [
          { userId: 'host_id', name: 'Host' },
          { userId: 'guest_user_2', name: 'Trần Văn Khách' },
        ],
      };

      mockMatchModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingMatch),
      });

      const sameUser = { id: 'guest_user_2', name: 'Trần Văn Khách' };
      await expect(service.joinMatch(sameUser, 'match_123')).rejects.toThrow(ConflictException);
    });
  });

  describe('leaveMatch', () => {
    it('7. should allow participant to leave and revert status from FULL to OPEN', async () => {
      const farFutureStart = new Date();
      farFutureStart.setDate(farFutureStart.getDate() + 3);

      const existingMatch = {
        _id: 'match_123',
        hostId: 'host_id',
        status: MatchStatus.FULL,
        totalSlots: 2,
        joinedCount: 2,
        startTime: farFutureStart,
        players: [
          { userId: 'host_id', name: 'Host' },
          { userId: 'guest_user_2', name: 'Khách' },
        ],
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this);
        }),
      };

      mockMatchModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingMatch),
      });

      const updated = await service.leaveMatch('guest_user_2', 'match_123');
      expect(updated.joinedCount).toBe(1);
      expect(updated.players).toHaveLength(1);
      expect(updated.status).toBe(MatchStatus.OPEN);
    });

    it('8. should prevent host from leaving their own match', async () => {
      const existingMatch = {
        _id: 'match_123',
        hostId: 'host_id',
        startTime: tomorrow,
        players: [{ userId: 'host_id', name: 'Host' }],
      };

      mockMatchModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingMatch),
      });

      await expect(service.leaveMatch('host_id', 'match_123')).rejects.toThrow(BadRequestException);
    });
  });
});
