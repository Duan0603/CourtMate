import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
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

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: { type: string; title: string; body: string; link?: string },
  ) {
    const userId = (req as any).user.sub;
    const notification = await this.notificationsService.send({
      ...dto,
      userId: String(userId),
    });
    return {
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      userId: notification.userId,
      createdAt: notification.createdAt,
      read: false,
    };
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

  @Delete('all')
  async deleteAll(@Req() req: Request) {
    const userId = (req as any).user.sub;
    await this.notificationsService.deleteAll(String(userId));
    return { success: true };
  }

  @Delete(':id')
  async deleteOne(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.sub;
    await this.notificationsService.deleteOne(String(userId), id);
    return { success: true };
  }
}
