import { Injectable } from '@nestjs/common';
import { ArticlesService } from '../services/articles.service';
import { MailerService } from '../../infrastructure/external-services/mailer.service';
import { CreateArticleDto } from '../../dtos/create-article.dto';
import { Article } from '../../infrastructure/persistence/article.entity';

@Injectable()
export class CreateArticleUseCase {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly mailerService: MailerService,
  ) {}

  async execute(dto: CreateArticleDto): Promise<Article> {
    // 1. Business Logic / Persistence
    const article = await this.articlesService.create(dto);

    // 2. Trigger side effects / External notification
    await this.mailerService.sendNotification(article.title);

    return article;
  }
}
