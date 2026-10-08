import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Request } from 'express';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get()
  async getLatestFeedbacks(@Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 100;
    const feedbacks = await this.feedbacksService.getLatest(limit);
    const stats = await this.feedbacksService.getStats();
    return {
      feedbacks,
      stats,
      total: feedbacks.length,
    };
  }

  @Get('stats')
  async getStats() {
    return this.feedbacksService.getStats();
  }

  @Post()
  async createFeedback(
    @Body() createDto: CreateFeedbackDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const userId = user?.sub || user?.id;
    return this.feedbacksService.create(createDto, userId);
  }
}
