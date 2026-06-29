import { Controller, Get, Put, Body, UseGuards, Req, NotFoundException, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
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
  @Put('profile')
  async updateProfile(
    @Req() req: any,
    @Body()
    updateDto: {
      name?: string;
      role?: UserRole;
      preferences?: {
        sports?: any[];
        location?: string;
        skillLevel?: string;
        clubName?: string;
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
}
