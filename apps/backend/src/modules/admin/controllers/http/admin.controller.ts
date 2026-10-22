import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
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
   * GET /admin/dashboard-overview
   * Nationwide overview stats: total users, online users, tournaments, matches.
   */
  @Get('dashboard-overview')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  async getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  /**
   * GET /admin/online-users
   * Live list of who's online right now and which page they're viewing.
   */
  @Get('online-users')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  async getOnlineUsers() {
    return this.adminService.getOnlineUsers();
  }

  /**
   * GET /admin/top-pages
   * Most-visited routes across the site (last 30 days).
   */
  @Get('top-pages')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  async getTopPages() {
    return this.adminService.getTopPages();
  }

  /**
   * GET /admin/users
   * Full user management list with role & online status.
   */
  @Get('users')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  /**
   * PUT /admin/users/:id/role
   * Role management / assignment.
   */
  @Put('users/:id/role')
  @Roles('SUPER_ADMIN')
  async updateUserRole(@Param('id') userId: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(userId, role);
  }

  /**
   * PUT /admin/users/:id/status
   * Lock / unlock account.
   */
  @Put('users/:id/status')
  @Roles('SUPER_ADMIN')
  async updateUserStatus(@Param('id') userId: string, @Body('status') status: string) {
    return this.adminService.updateUserStatus(userId, status);
  }

  /**
   * GET /admin/tournaments
   * All tournaments nationwide for moderation.
   */
  @Get('tournaments')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  async getAllTournaments() {
    return this.adminService.getAllTournamentsForAdmin();
  }

  /**
   * GET /admin/organizer-requests
   * All organizer applications.
   */
  @Get('organizer-requests')
  @Roles('REGIONAL_ADMIN', 'SUPER_ADMIN')
  async getOrganizerRequests() {
    return this.adminService.getOrganizerRequests();
  }

  /**
   * PUT /admin/organizers/:id/approve
   * Approve organizer application.
   */
  @Put('organizers/:id/approve')
  @Roles('SUPER_ADMIN')
  async approveOrganizer(@Param('id') userId: string) {
    return this.adminService.approveOrganizer(userId);
  }

  /**
   * PUT /admin/organizers/:id/reject
   * Reject organizer application.
   */
  @Put('organizers/:id/reject')
  @Roles('SUPER_ADMIN')
  async rejectOrganizer(@Param('id') userId: string, @Body('reason') reason?: string) {
    return this.adminService.rejectOrganizer(userId, reason);
  }

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
