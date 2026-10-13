import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import {
  BadmintonSkillLevel,
  CreateMatchDto,
  MatchFilterDto,
} from '@courtmate/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * Tạo kèo mới (cần đăng nhập)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createMatch(@Request() req: any, @Body() dto: CreateMatchDto) {
    const user = {
      id: req.user.userId || req.user.id || req.user._id,
      name: req.user.name || req.user.username || 'Người chơi',
      avatarUrl: req.user.avatarUrl,
      phone: req.user.phone,
    };
    return await this.matchesService.createMatch(user, dto);
  }

  /**
   * Lấy danh sách kèo (công khai)
   */
  @Get()
  async getMatches(@Query() query: MatchFilterDto) {
    const data = await this.matchesService.getMatches(query);
    return {
      data,
      meta: { total: data.length },
    };
  }

  /**
   * Xem chi tiết kèo theo ID hoặc ShareCode (công khai)
   */
  @Get(':idOrCode')
  async getMatchDetails(@Param('idOrCode') idOrCode: string) {
    return await this.matchesService.getMatchById(idOrCode);
  }

  /**
   * Tham gia kèo (cần đăng nhập)
   */
  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async joinMatch(
    @Request() req: any,
    @Param('id') id: string,
    @Body('skillLevel') skillLevel?: BadmintonSkillLevel,
  ) {
    const user = {
      id: req.user.userId || req.user.id || req.user._id,
      name: req.user.name || req.user.username || 'Người chơi',
      avatarUrl: req.user.avatarUrl,
      phone: req.user.phone,
    };
    return await this.matchesService.joinMatch(user, id, skillLevel);
  }

  /**
   * Rút lui khỏi kèo (cần đăng nhập)
   */
  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveMatch(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user._id;
    return await this.matchesService.leaveMatch(userId, id);
  }

  /**
   * Hủy kèo (chủ kèo)
   */
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelMatch(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user._id;
    return await this.matchesService.cancelMatch(userId, id);
  }
}
