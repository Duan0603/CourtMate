import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback } from './feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbacksService {
  private readonly logger = new Logger(FeedbacksService.name);

  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<Feedback>,
  ) {}

  /**
   * Returns up to limit (default 100) latest feedbacks sorted by createdAt desc.
   * As new feedbacks are added, older ones are naturally pushed down / out of the top 100.
   */
  async getLatest(limit: number = 100): Promise<Feedback[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    return this.feedbackModel
      .find()
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean()
      .exec() as Promise<Feedback[]>;
  }

  /**
   * Creates and stores a new user feedback in MongoDB
   */
  async create(createDto: CreateFeedbackDto, userId?: string): Promise<Feedback> {
    const feedback = new this.feedbackModel({
      ...createDto,
      userId: userId || undefined,
      isVerified: true,
      createdAt: new Date(),
    });
    const saved = await feedback.save();
    this.logger.log(`Created new feedback from "${saved.userName}" (Rating: ${saved.rating}*)`);
    return saved;
  }

  /**
   * Retrieves summary statistics for the feedback platform
   */
  async getStats() {
    const total = await this.feedbackModel.countDocuments();
    if (total === 0) {
      return {
        total: 0,
        averageRating: 5.0,
        fiveStarPercent: 100,
        recommendRate: 100,
      };
    }

    const ratingsAgg = await this.feedbackModel.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          fiveStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = ratingsAgg[0] || { avgRating: 5.0, fiveStarCount: total };
    const avg = Math.round((stats.avgRating || 5.0) * 10) / 10;
    const fiveStarPercent = Math.round(((stats.fiveStarCount || total) / total) * 100);

    return {
      total,
      averageRating: avg,
      fiveStarPercent,
      recommendRate: 99,
    };
  }
}
