import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminStats, ModerationAction } from '@courtmate/shared';
import { Tournament } from '../../../tournaments/infrastructure/persistence/tournament.entity';
import { User } from '../../../users/infrastructure/persistence/user.entity';
import { TournamentsService } from '../../../tournaments/domains/services/tournaments.service';
import { UsersService } from '../../../users/domains/services/users.service';
import { ModerateTournamentDto } from '../../dtos/moderate-tournament.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly usersService: UsersService,
    @InjectModel('registrations') private readonly registrationModel: Model<any>,
  ) {}

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
