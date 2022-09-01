import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';

import { UserEntity } from '@app/user/user.entity';
import {
  Brackets,
  DataSource,
  DeleteResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateArticleDto } from '@app/article/dtos/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from '@app/article/dtos/updateArticle.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(DataSource) private dataSource: DataSource,
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('articles.tagList = :tag', {
            tag: 'angular',
          }).orWhere('articles.tagList = :tag', {
            tag: 'node',
          });
        }),
      );
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.authorId = (:id)', {
        id: author.id,
      });
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ where: { slug } });
  }

  async deleteArticle(
    slugParam: string,
    currentUser: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slugParam);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (currentUser !== article.author.id) {
      throw new HttpException(
        'Current user and id not matched',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.articleRepository.delete({ slug: article.slug });
  }

  async updateArticle(
    slugParam: string,
    currentUser: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slugParam);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (currentUser !== article.author.id) {
      throw new HttpException(
        'Current user and id not matched',
        HttpStatus.FORBIDDEN,
      );
    }
    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article: article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '+' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
