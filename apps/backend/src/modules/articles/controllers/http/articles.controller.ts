import { Controller, Post, Get, Body } from '@nestjs/common';
import { CreateArticleUseCase } from '../../domains/use-cases/create-article.use-case';
import { ArticlesService } from '../../domains/services/articles.service';
import { CreateArticleDto } from '../../dtos/create-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly createArticleUseCase: CreateArticleUseCase,
    private readonly articlesService: ArticlesService,
  ) {}

  @Post()
  async create(@Body() dto: CreateArticleDto) {
    return this.createArticleUseCase.execute(dto);
  }

  @Get()
  async findAll() {
    return this.articlesService.findAll();
  }
}
