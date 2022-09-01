import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { AuthMiddleware } from '@app/user/middleware/auth.middleware';
import { AuthGuard } from '@app/user/guards/Auth.guard';
import { ArticleEntity } from '@app/article/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ArticleEntity])],
  controllers: [UserController],
  providers: [UserService, AuthGuard],
  exports: [UserService],
})
export class UserModule {}
