import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageView } from '../../infrastructure/persistence/page-view.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(PageView.name) private readonly pageViewModel: Model<PageView>,
  ) {}

  async recordPageView(route: string): Promise<void> {
    await this.pageViewModel.create({ route });
  }

  /**
   * Top visited routes, most recent 30 days, ranked by view count.
   */
  async getTopPages(limit = 10): Promise<{ route: string; views: number }[]> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const results = await this.pageViewModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$route', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]);

    return results.map((r) => ({ route: r._id, views: r.views }));
  }
}
