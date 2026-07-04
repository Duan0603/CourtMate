import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Tournament } from '../../infrastructure/persistence/tournament.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name) private readonly tournamentModel: Model<Tournament>,
  ) {}

  async findAll(filters?: {
    city?: string;
    sport?: string;
    includeHidden?: boolean;
  }): Promise<Tournament[]> {
    const query: FilterQuery<Tournament> = {};

    if (filters?.city) {
      query.city = filters.city;
    }

    if (filters?.sport) {
      query.sport = filters.sport;
    }

    if (!filters?.includeHidden) {
      query.isHidden = { $ne: true };
    }

    return this.tournamentModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournamentModel.findById(id).exec();
  }

  async findByCity(city: string): Promise<Tournament[]> {
    return this.tournamentModel
      .find({ city, isHidden: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async countByCity(city: string): Promise<number> {
    return this.tournamentModel.countDocuments({ city }).exec();
  }

  async countActiveByCityAndSport(city: string): Promise<Record<string, number>> {
    const results = await this.tournamentModel.aggregate([
      { $match: { city, isHidden: { $ne: true } } },
      { $group: { _id: '$sport', count: { $sum: 1 } } },
    ]);

    const bySport: Record<string, number> = {};
    for (const r of results) {
      bySport[r._id] = r.count;
    }
    return bySport;
  }

  async updateModeration(
    id: string,
    update: { isHidden?: boolean; isFeatured?: boolean },
  ): Promise<Tournament | null> {
    return this.tournamentModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .exec();
  }
}
