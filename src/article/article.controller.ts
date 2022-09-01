import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@app/user/guards/Auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from '@app/article/dtos/createArticle.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { UpdateArticleDto } from '@app/article/dtos/updateArticle.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User() currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get('/:slug')
  @UseGuards(AuthGuard)
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    console.log('article', article);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete('/:slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') currentUser: number,
    @Param('slug') slug: string,
  ) {
    return await this.articleService.deleteArticle(slug, currentUser);
  }

  @Put('/:slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @User('id') currentUser: number,
    @Param('slug') slug: string,
    @Body('article') article: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const updateResult = await this.articleService.updateArticle(
      slug,
      currentUser,
      article,
    );
    return this.articleService.buildArticleResponse(updateResult);
  }
}
