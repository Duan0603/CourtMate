import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesController } from './controllers/http/articles.controller';
import { ArticlesService } from './domains/services/articles.service';
import { CreateArticleUseCase } from './domains/use-cases/create-article.use-case';
import { MailerService } from './infrastructure/external-services/mailer.service';
import { Article, ArticleSchema } from './infrastructure/persistence/article.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
    ]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, CreateArticleUseCase, MailerService],
})
export class ArticlesModule {}
