import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from './report.schema';
import { CreateReportDto } from '@courtmate/shared';
import { TournamentsService } from '../tournaments/tournaments.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    private readonly tournamentsService: TournamentsService,
  ) {}

  async create(createDto: CreateReportDto, userId: string): Promise<Report> {
    try {
      const report = new this.reportModel({
        ...createDto,
        userId,
      });
      const savedReport = await report.save();

      // Hook into targets to update their report counts
      if (createDto.targetType === 'TOURNAMENT') {
        await this.tournamentsService.incrementReportCount(createDto.targetId);
      } else if (createDto.targetType === 'FEED_ITEM') {
        // FeedItems not fully implemented yet, left as placeholder
      }

      return savedReport;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('You have already reported this item.');
      }
      throw new InternalServerErrorException('An error occurred while creating the report.');
    }
  }

  async findAll(): Promise<Report[]> {
    return this.reportModel.find().exec();
  }
}
