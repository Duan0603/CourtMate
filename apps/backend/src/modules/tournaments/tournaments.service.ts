import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament } from './tournament.schema';
import { CreateTournamentDto } from '@courtmate/shared';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
  ) {}

  async create(createDto: CreateTournamentDto, rulesFileUrl?: string, organizerInfo?: any): Promise<Tournament> {
    const createdTournament = new this.tournamentModel({
      ...createDto,
      rulesFileUrl,
      organizer: organizerInfo || {
        id: 'mock-organizer-id',
        name: 'Mock Organizer',
        isVerified: true
      }
    });
    return createdTournament.save();
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournamentModel.find({ isHidden: false }).exec();
  }

  async incrementReportCount(id: string): Promise<Tournament | null> {
    const tournament = await this.tournamentModel.findById(id);
    if (!tournament) {
      return null;
    }

    tournament.reportsCount += 1;
    
    // Auto-hide threshold
    if (tournament.reportsCount >= 5) {
      tournament.isHidden = true;
    }

    return tournament.save();
  }
}
