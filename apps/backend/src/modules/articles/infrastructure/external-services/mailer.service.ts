import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  async sendNotification(articleTitle: string): Promise<void> {
    console.log(`Mocking external mail service: Notification sent for article "${articleTitle}"`);
  }
}
