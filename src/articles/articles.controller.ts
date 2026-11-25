import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { User } from '../users/entities/user.entity';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
    ArticleResponseSerializer,
    ArticlesResponseSerializer,
} from './serializers/article.serializer';

@ApiTags('Articles')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Get()
    @UseGuards(OptionalAuthGuard)
    @ApiOperation({ summary: 'List articles (global feed, auth optional, hides body)' })
    @ApiResponse({ status: 200, description: 'List of articles without body.' })
    async listArticles(
        @Query() query: ListArticlesDto,
        @CurrentUser() currentUser?: User,
    ): Promise<ArticlesResponseSerializer> {
        return this.articlesService.listArticles(query, currentUser?.id);
    }

    @Get('feed')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get feed of articles by followed users (auth required, hides body)' })
    @ApiResponse({ status: 200, description: 'Feed of articles without body.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getFeed(
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @CurrentUser() currentUser?: User,
    ): Promise<ArticlesResponseSerializer> {
        return this.articlesService.getFeed(currentUser!.id, {
            limit: limit ? Number(limit) : 20,
            offset: offset ? Number(offset) : 0,
        });
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create an article' })
    @ApiResponse({ status: 201, description: 'Article created successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createArticle(
        @CurrentUser() currentUser: User,
        @Body() dto: CreateArticleDto,
    ): Promise<ArticleResponseSerializer> {
        return this.articlesService.createArticle(currentUser, dto);
    }

    @Get(':slug')
    @UseGuards(OptionalAuthGuard)
    @ApiOperation({ summary: 'Get a single article by slug' })
    @ApiResponse({ status: 200, description: 'Article found with body.' })
    @ApiResponse({ status: 404, description: 'Article not found.' })
    async getArticle(
        @Param('slug') slug: string,
        @CurrentUser() currentUser?: User,
    ): Promise<ArticleResponseSerializer> {
        return this.articlesService.getArticle(slug, currentUser?.id);
    }

    @Put(':slug')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an article (author only)' })
    @ApiResponse({ status: 200, description: 'Article updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - not author' })
    async updateArticle(
        @Param('slug') slug: string,
        @CurrentUser() currentUser: User,
        @Body() dto: UpdateArticleDto,
    ): Promise<ArticleResponseSerializer> {
        return this.articlesService.updateArticle(currentUser.id, slug, dto);
    }

    @Delete(':slug')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an article (author only)' })
    @ApiResponse({ status: 200, description: 'Article deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - not author' })
    async deleteArticle(
        @Param('slug') slug: string,
        @CurrentUser() currentUser: User,
    ): Promise<{ message: string }> {
        await this.articlesService.deleteArticle(currentUser.id, slug);
        return { message: 'Article deleted successfully' };
    }
}
