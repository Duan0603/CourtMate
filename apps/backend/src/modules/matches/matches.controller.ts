import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
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
   * Trích xuất thông tin người dùng từ JWT an toàn
   * Hỗ trợ đầy đủ các dạng payload: sub (chuẩn JWT), userId, id, _id
   */
  private extractUser(req: any) {
    const u = req.user || {};
    const id = u.sub || u.userId || u.id || u._id;
    if (!id) {
      throw new UnauthorizedException('Không tìm thấy định danh người dùng trong token');
    }
    return {
      id: String(id),
      name: u.name || u.username || 'Người chơi',
      avatarUrl: u.avatarUrl || '',
      phone: u.phone || '',
    };
  }

  /**
   * Tạo kèo mới (cần đăng nhập)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createMatch(@Request() req: any, @Body() dto: CreateMatchDto) {
    const user = this.extractUser(req);
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
   * Lấy kèo đấu mà user hiện tại đang tham gia (cần đăng nhập)
   */
  @Get('user/my-active')
  @UseGuards(JwtAuthGuard)
  async getMyActiveMatch(@Request() req: any) {
    const user = this.extractUser(req);
    const match = await this.matchesService.getUserActiveMatch(user.id);
    return { data: match };
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
    const user = this.extractUser(req);
    return await this.matchesService.joinMatch(user, id, skillLevel);
  }

  /**
   * Rút lui khỏi kèo (cần đăng nhập)
   */
  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveMatch(@Request() req: any, @Param('id') id: string) {
    const user = this.extractUser(req);
    return await this.matchesService.leaveMatch(user.id, id);
  }

  /**
   * Hủy kèo (chủ kèo)
   */
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelMatch(@Request() req: any, @Param('id') id: string) {
    const user = this.extractUser(req);
    return await this.matchesService.cancelMatch(user.id, id);
  }
}
