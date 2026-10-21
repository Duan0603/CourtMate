import { Controller, Get, Put, Body, UseGuards, Req, NotFoundException, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './domains/services/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '@courtmate/shared';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findByEmail(req.user.email);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends')
  async getFriends(@Req() req: any) {
    return this.usersService.getFriends(req.user.email);
  }

  /** People search for starting a direct chat. Returns public fields only. */
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(@Req() req: any, @Query('q') q?: string) {
    return this.usersService.searchByName(q || '', String(req.user.sub));
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: any,
    @Body()
    updateDto: {
      name?: string;
      role?: UserRole;
      avatarUrl?: string;
      preferences?: {
        sports?: any[];
        location?: string;
        skillLevel?: string;
        clubName?: string;
        avatarUrl?: string;
      };
    },
  ) {
    const user = await this.usersService.updateProfile(req.user.email, updateDto);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('bookmarks/:id')
  async addBookmark(@Req() req: any, @Param('id') tournamentId: string) {
    const user = await this.usersService.addBookmark(req.user.email, tournamentId);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('bookmarks/:id')
  async removeBookmark(@Req() req: any, @Param('id') tournamentId: string) {
    const user = await this.usersService.removeBookmark(req.user.email, tournamentId);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('coach-bookmarks/:id')
  async addCoachBookmark(@Req() req: any, @Param('id') coachId: string) {
    const user = await this.usersService.addCoachBookmark(req.user.email, coachId);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('coach-bookmarks/:id')
  async removeCoachBookmark(@Req() req: any, @Param('id') coachId: string) {
    const user = await this.usersService.removeCoachBookmark(req.user.email, coachId);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('re-apply-organizer')
  async reApplyOrganizer(
    @Req() req: any,
    @Body() body: { name?: string; certificateUrl?: string; sports?: string[] },
  ) {
    const user = await this.usersService.reApplyOrganizer(req.user.email, body);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }
}
