import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './controllers/http/analytics.controller';
import { AnalyticsService } from './domains/services/analytics.service';
import { PageView, PageViewSchema } from './infrastructure/persistence/page-view.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PageView.name, schema: PageViewSchema }]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
