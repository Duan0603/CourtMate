import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { concatMap } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';

/** Persist successful account activity at the server boundary, for every web client. */
@Injectable()
export class ActivityNotificationsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityNotificationsInterceptor.name);
  constructor(private readonly notifications: NotificationsService) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    if (context.getType() !== 'http') return next.handle();
    const request = context.switchToHttp().getRequest();
    const path = (request.originalUrl || request.url || '').split('?')[0];
    const userId = request.user?.sub;
    if (!userId || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return next.handle();
    // Never report auth, notification read operations, uploads or payment webhooks as activity.
    const match = path.match(new RegExp('^/(users/profile|users/bookmarks|users/coach-bookmarks|matches|coaches|registrations|reports|feedbacks|articles|tournaments|admin)(?:/|$)'));
    if (!match) return next.handle();
    const resource = match[1];
    const labels: Record<string, string> = { 'users/profile': 'hồ sơ cá nhân', 'users/bookmarks': 'giải đấu yêu thích', 'users/coach-bookmarks': 'huấn luyện viên yêu thích', matches: 'buổi giao lưu', coaches: 'huấn luyện viên', registrations: 'đăng ký giải đấu', reports: 'báo cáo', feedbacks: 'phản hồi', articles: 'bài viết', tournaments: 'giải đấu', admin: 'quản trị' };
    return next.handle().pipe(concatMap(async result => {
      if (result === null || result?.success === false) return result;
      try {
        const notification = await this.notifications.send({
          userId: String(userId), type: resource === 'users/coach-bookmarks' ? 'FAVORITE_COACH' : resource === 'users/bookmarks' ? 'FAVORITE_TOURNAMENT' : 'ACCOUNT_ACTIVITY', title: request.method === 'DELETE' ? 'Đã xóa thành công' : 'Cập nhật thành công',
          body: 'Thay đổi về ' + labels[resource] + ' của bạn đã được lưu.',
          link: resource.startsWith('users/') ? '/profile' : ['matches', 'coaches', 'tournaments'].includes(resource) ? '/' + resource : '/profile',
        });
        // Deliver the persisted identity in the HTTP response as well as Socket.IO.
        context.switchToHttp().getResponse().setHeader('X-CourtMate-Notification', encodeURIComponent(JSON.stringify({
          id: notification._id.toString(), type: notification.type, title: notification.title,
          body: notification.body, link: notification.link, userId: notification.userId,
          createdAt: notification.createdAt, read: false,
        })));
      } catch (error) { this.logger.error('Could not persist activity notification', error); }
      if (resource === 'matches' && result?.hostId && Array.isArray(result.players)) {
        const recipients = new Set<string>([result.hostId, ...result.players.map((player: { userId: string }) => player.userId)]);
        recipients.delete(String(userId));
        await Promise.allSettled([...recipients].map(recipient => this.notifications.send({
          userId: recipient, type: 'MATCH_UPDATED', title: result.status === 'CANCELLED' ? 'Buổi giao lưu đã hủy' : 'Buổi giao lưu có cập nhật',
          body: result.title + ': danh sách người chơi hoặc trạng thái buổi giao lưu đã thay đổi.',
          link: '/matches/' + result._id,
        })));
      }
      return result;
    }));
  }
}
