import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  readonly body: string;

  @IsNotEmpty()
  readonly title: string;

  readonly tagList?: string[];
}
