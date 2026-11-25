import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from '../users/entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { Favorite } from './entities/favorite.entity';
import { Tag } from './entities/tag.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Article, Tag, Favorite, Follow, User]),
    ],
    controllers: [ArticlesController],
    providers: [ArticlesService],
    exports: [ArticlesService],
})
export class ArticlesModule { }
