import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from '../../infrastructure/persistence/article.entity';
import { CreateArticleDto } from '../../dtos/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const createdArticle = new this.articleModel(createArticleDto);
    return createdArticle.save();
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.find().exec();
  }
}
