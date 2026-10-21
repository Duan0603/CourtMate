import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminStats, ModerationAction } from '@courtmate/shared';
import { Tournament } from '../../../tournaments/infrastructure/persistence/tournament.entity';
import { User } from '../../../users/infrastructure/persistence/user.entity';
import { TournamentsService } from '../../../tournaments/domains/services/tournaments.service';
import { UsersService } from '../../../users/domains/services/users.service';
import { MatchesService } from '../../../matches/matches.service';
import { NotificationsGateway } from '../../../notifications/notifications.gateway';
import { AnalyticsService } from '../../../analytics/domains/services/analytics.service';
import { ModerateTournamentDto } from '../../dtos/moderate-tournament.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly usersService: UsersService,
    private readonly matchesService: MatchesService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly analyticsService: AnalyticsService,
    @InjectModel('registrations') private readonly registrationModel: Model<any>,
  ) {}

  /**
   * Get nationwide dashboard overview: total users, live online users, total tournaments, total matches.
   */
  async getDashboardOverview() {
    const [totalUsers, totalTournaments, totalMatches] = await Promise.all([
      this.usersService.countAllUsers(),
      this.tournamentsService.countAll(),
      this.matchesService.countAll(),
    ]);

    const onlineUsers = Math.max(this.notificationsGateway.getOnlineUsersCount(), 1);

    return {
      totalUsers,
      onlineUsers,
      totalTournaments,
      totalMatches,
    };
  }

  /**
   * Get the live list of online users with their current page (for the admin dashboard).
   */
  getOnlineUsers() {
    return this.notificationsGateway.getOnlineUsersDetailed();
  }

  /**
   * Get most-visited routes across the site (last 30 days).
   */
  async getTopPages(limit = 10) {
    return this.analyticsService.getTopPages(limit);
  }

  /**
   * Get all users with real-time online status and permissions.
   */
  async getAllUsers() {
    const users = await this.usersService.findAllUsers();
    const onlineUserIds = new Set(this.notificationsGateway.getOnlineUserIds());

    return users.map((u: any) => ({
      id: String(u._id),
      name: u.name || 'Người dùng',
      email: u.email,
      role: u.role || 'PLAYER',
      status: u.status || 'active',
      location: u.preferences?.location || 'Đà Nẵng',
      createdAt: u.createdAt,
      isOnline: onlineUserIds.has(String(u._id)) || u.role === 'SUPER_ADMIN',
    }));
  }

  /**
   * Update role for a user.
   */
  async updateUserRole(userId: string, role: string) {
    const updated = await this.usersService.updateRoleByAdmin(userId, role);
    if (!updated) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return updated;
  }

  /**
   * Update status (lock/unlock) for a user.
   */
  async updateUserStatus(userId: string, status: string) {
    const updated = await this.usersService.updateStatusByAdmin(userId, status);
    if (!updated) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return updated;
  }

  /**
   * Get all tournaments nationwide for admin moderation.
   */
  async getAllTournamentsForAdmin() {
    return this.tournamentsService.findAll({ includeHidden: true } as any);
  }

  /**
   * Get all organizer registration requests.
   */
  async getOrganizerRequests() {
    return this.usersService.getOrganizerRequests();
  }

  /**
   * Approve an organizer application.
   */
  async approveOrganizer(userId: string) {
    const user = await this.usersService.approveOrganizer(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return user;
  }

  /**
   * Reject an organizer application.
   */
  async rejectOrganizer(userId: string, reason?: string) {
    const user = await this.usersService.rejectOrganizer(userId, reason);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return user;
  }

  /**
   * Get aggregated dashboard stats for a specific city.
   */
  async getDashboardStats(city: string): Promise<AdminStats> {
    const [
      totalTournaments,
      totalUsers,
      totalRegistrations,
      tournamentsBySport,
    ] = await Promise.all([
      this.tournamentsService.countByCity(city),
      this.usersService.countByCity(city),
      this.countRegistrationsByCity(city),
      this.tournamentsService.countActiveByCityAndSport(city),
    ]);

    // Count active (non-hidden) tournaments
    const activeTournaments = Object.values(tournamentsBySport).reduce(
      (sum: number, count: number) => sum + count,
      0,
    );

    return {
      city,
      totalTournaments,
      activeTournaments,
      totalUsers,
      totalRegistrations,
      pendingReports: 0, // Stub: Phase 7 report module not yet implemented
      tournamentsBySport,
    };
  }

  /**
   * Get all tournaments for a city including hidden ones (for admin moderation).
   */
  async getTournamentsForModeration(city: string): Promise<Tournament[]> {
    return this.tournamentsService.findAll({ city, includeHidden: true });
  }

  /**
   * Execute a moderation action on a tournament.
   */
  async moderateTournament(dto: ModerateTournamentDto): Promise<Tournament> {
    const { tournamentId, action } = dto;

    let update: { isHidden?: boolean; isFeatured?: boolean } = {};

    switch (action) {
      case ModerationAction.HIDE:
        update = { isHidden: true };
        break;
      case ModerationAction.UNHIDE:
        update = { isHidden: false };
        break;
      case ModerationAction.FEATURE:
        update = { isFeatured: true };
        break;
      case ModerationAction.UNFEATURE:
        update = { isFeatured: false };
        break;
      default:
        break;
    }

    const tournament = await this.tournamentsService.updateModeration(
      tournamentId,
      update,
    );

    if (!tournament) {
      throw new NotFoundException(`Tournament not found: ${tournamentId}`);
    }

    return tournament;
  }

  /**
   * Count registrations for tournaments in a given city.
   */
  private async countRegistrationsByCity(city: string): Promise<number> {
    // Join registrations to tournaments by city using aggregation
    const results = await this.registrationModel.aggregate([
      {
        $lookup: {
          from: 'tournaments',
          let: { tournamentId: { $toObjectId: '$tournamentId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$tournamentId'] } } },
            { $match: { city } },
          ],
          as: 'tournament',
        },
      },
      { $match: { tournament: { $ne: [] } } },
      { $count: 'total' },
    ]);

    return results[0]?.total || 0;
  }
}
