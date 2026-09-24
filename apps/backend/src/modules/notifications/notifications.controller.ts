import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.notificationsService.list(String(userId));
  }

  @Patch(':id/read')
  async markRead(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.sub;
    await this.notificationsService.markRead(String(userId), id);
    return { success: true };
  }

  @Patch('read-all')
  async markAllRead(@Req() req: Request) {
    const userId = (req as any).user.sub;
    await this.notificationsService.markAllRead(String(userId));
    return { success: true };
  }
}
