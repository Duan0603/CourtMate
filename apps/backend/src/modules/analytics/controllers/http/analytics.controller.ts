import { Controller, Post, Body } from '@nestjs/common';
import { AnalyticsService } from '../../domains/services/analytics.service';
import { RecordPageViewDto } from '../../dtos/record-page-view.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * POST /analytics/page-view
   * Public endpoint: records a page view for traffic analytics.
   */
  @Post('page-view')
  async recordPageView(@Body() dto: RecordPageViewDto): Promise<{ ok: true }> {
    await this.analyticsService.recordPageView(dto.route);
    return { ok: true };
  }
}
