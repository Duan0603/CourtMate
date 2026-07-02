import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from '../../domains/services/admin.service';
import { RegionService } from '../../domains/services/region.service';
import { ModerateTournamentDto } from '../../dtos/moderate-tournament.dto';
import { RolesGuard } from '../../../../core/auth/guards/roles.guard';
import { RegionalAdminGuard } from '../../guards/regional-admin.guard';
import { Roles } from '../../../../core/auth/decorators/roles.decorator';
import { CurrentUser } from '../../../../core/auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly regionService: RegionService,
  ) {}

  /**
   * GET /admin/regions
   * List all supported regions and their config.
   * Accessible to any admin role.
   */
  @Get('regions')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  getRegions() {
    return this.regionService.getActiveRegions();
  }

  /**
   * GET /admin/dashboard/:city
   * Get aggregated dashboard stats for a specific city.
   * REGIONAL_ADMIN can only access their assigned city.
   */
  @Get('dashboard/:city')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  @UseGuards(RegionalAdminGuard)
  async getDashboard(@Param('city') city: string) {
    const normalized = this.regionService.normalizeCity(city);
    return this.adminService.getDashboardStats(normalized || city);
  }

  /**
   * GET /admin/tournaments/:city
   * List all tournaments (including hidden) for moderation.
   */
  @Get('tournaments/:city')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  @UseGuards(RegionalAdminGuard)
  async getTournaments(@Param('city') city: string) {
    const normalized = this.regionService.normalizeCity(city);
    return this.adminService.getTournamentsForModeration(normalized || city);
  }

  /**
   * POST /admin/moderate
   * Execute a moderation action on a tournament.
   */
  @Post('moderate')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  async moderate(@Body() dto: ModerateTournamentDto) {
    return this.adminService.moderateTournament(dto);
  }
}
