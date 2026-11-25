import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Follow } from '../users/entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { ProfileDataSerializer } from '../users/serializers/profile.serializer';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { Favorite } from './entities/favorite.entity';
import { Tag } from './entities/tag.entity';
import {
    ArticleResponseSerializer,
    ArticlesResponseSerializer,
    ListArticleDataSerializer,
    SingleArticleDataSerializer,
} from './serializers/article.serializer';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    private generateSlug(title: string): string {
        const slugified = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${slugified}-${randomSuffix}`;
    }

    private async resolveTags(tagNames?: string[]): Promise<Tag[]> {
        if (!tagNames || tagNames.length === 0) {
            return [];
        }
        const uniqueNames = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))];
        const existingTags = await this.tagRepository.find({
            where: { name: In(uniqueNames) },
        });

        const existingTagNames = existingTags.map((t) => t.name);
        const newTagNames = uniqueNames.filter((name) => !existingTagNames.includes(name));

        const createdTags = this.tagRepository.create(newTagNames.map((name) => ({ name })));
        if (createdTags.length > 0) {
            await this.tagRepository.save(createdTags);
        }

        return [...existingTags, ...createdTags];
    }

    private async buildArticleData(
        article: Article,
        currentUserId?: number,
    ): Promise<SingleArticleDataSerializer> {
        let favorited = false;
        if (currentUserId) {
            const fav = await this.favoriteRepository.findOne({
                where: { userId: currentUserId, articleId: article.id },
            });
            favorited = !!fav;
        }

        const favoritesCount = await this.favoriteRepository.count({
            where: { articleId: article.id },
        });

        let following = false;
        if (currentUserId && article.author && currentUserId !== article.author.id) {
            const follow = await this.followRepository.findOne({
                where: { followerId: currentUserId, followingId: article.author.id },
            });
            following = !!follow;
        }

        return new SingleArticleDataSerializer({
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tags ? article.tags.map((t) => t.name) : [],
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            favorited,
            favoritesCount,
            author: new ProfileDataSerializer({
                username: article.author?.username,
                bio: article.author?.bio,
                image: article.author?.image,
                following,
            }),
        });
    }

    async createArticle(
        author: User,
        dto: CreateArticleDto,
    ): Promise<ArticleResponseSerializer> {
        const { title, description, body, tagList } = dto.article;
        const tags = await this.resolveTags(tagList);
        const slug = this.generateSlug(title);

        const article = this.articleRepository.create({
            slug,
            title,
            description,
            body,
            author,
            authorId: author.id,
            tags,
        });

        const savedArticle = await this.articleRepository.save(article);
        const data = await this.buildArticleData(savedArticle, author.id);
        return new ArticleResponseSerializer(data);
    }

    async getArticle(
        slug: string,
        currentUserId?: number,
    ): Promise<ArticleResponseSerializer> {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: {
                author: true,
                tags: true,
            },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        const data = await this.buildArticleData(article, currentUserId);
        return new ArticleResponseSerializer(data);
    }

    async listArticles(
        query: ListArticlesDto,
        currentUserId?: number,
    ): Promise<ArticlesResponseSerializer> {
        const qb = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .leftJoinAndSelect('article.tags', 'tags')
            .orderBy('article.createdAt', 'DESC');

        if (query.tag) {
            qb.andWhere(
                'article.id IN (SELECT at.article_id FROM article_tags at JOIN tags t ON t.id = at.tag_id WHERE t.name = :tag)',
                { tag: query.tag },
            );
        }

        if (query.author) {
            qb.andWhere('author.username = :author', { author: query.author });
        }

        if (query.favorited) {
            qb.andWhere(
                'article.id IN (SELECT f.article_id FROM favorites f JOIN users u ON u.id = f.user_id WHERE u.username = :favorited)',
                { favorited: query.favorited },
            );
        }

        const limit = query.limit || 20;
        const offset = query.offset || 0;

        qb.take(limit);
        qb.skip(offset);

        const [articles, count] = await qb.getManyAndCount();

        const listData: ListArticleDataSerializer[] = [];
        for (const art of articles) {
            const data = await this.buildArticleData(art, currentUserId);
            listData.push(
                new ListArticleDataSerializer({
                    slug: data.slug,
                    title: data.title,
                    description: data.description,
                    tagList: data.tagList,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    favorited: data.favorited,
                    favoritesCount: data.favoritesCount,
                    author: data.author,
                }),
            );
        }

        return new ArticlesResponseSerializer(listData, count);
    }

    async getFeed(
        currentUserId: number,
        query: { limit?: number; offset?: number },
    ): Promise<ArticlesResponseSerializer> {
        const follows = await this.followRepository.find({
            where: { followerId: currentUserId },
        });

        if (follows.length === 0) {
            return new ArticlesResponseSerializer([], 0);
        }

        const followedUserIds = follows.map((f) => f.followingId);

        const limit = query.limit || 20;
        const offset = query.offset || 0;

        const [articles, count] = await this.articleRepository.findAndCount({
            where: { authorId: In(followedUserIds) },
            relations: {
                author: true,
                tags: true,
            },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });

        const listData: ListArticleDataSerializer[] = [];
        for (const art of articles) {
            const data = await this.buildArticleData(art, currentUserId);
            listData.push(
                new ListArticleDataSerializer({
                    slug: data.slug,
                    title: data.title,
                    description: data.description,
                    tagList: data.tagList,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    favorited: data.favorited,
                    favoritesCount: data.favoritesCount,
                    author: data.author,
                }),
            );
        }

        return new ArticlesResponseSerializer(listData, count);
    }

    async updateArticle(
        authorId: number,
        slug: string,
        dto: UpdateArticleDto,
    ): Promise<ArticleResponseSerializer> {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: {
                author: true,
                tags: true,
            },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        if (article.authorId !== authorId) {
            throw new ForbiddenException('You are not allowed to update this article');
        }

        const updateData = dto.article;
        if (updateData?.title && updateData.title !== article.title) {
            article.title = updateData.title;
            article.slug = this.generateSlug(updateData.title);
        }

        if (updateData?.description !== undefined) {
            article.description = updateData.description;
        }

        if (updateData?.body !== undefined) {
            article.body = updateData.body;
        }

        const updatedArticle = await this.articleRepository.save(article);
        const data = await this.buildArticleData(updatedArticle, authorId);
        return new ArticleResponseSerializer(data);
    }

    async deleteArticle(authorId: number, slug: string): Promise<void> {
        const article = await this.articleRepository.findOne({
            where: { slug },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        if (article.authorId !== authorId) {
            throw new ForbiddenException('You are not allowed to delete this article');
        }

        await this.articleRepository.remove(article);
    }

    async favoriteArticle(
        userId: number,
        slug: string,
    ): Promise<ArticleResponseSerializer> {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: {
                author: true,
                tags: true,
            },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        const existing = await this.favoriteRepository.findOne({
            where: { userId, articleId: article.id },
        });

        if (!existing) {
            const favorite = this.favoriteRepository.create({
                userId,
                articleId: article.id,
            });
            await this.favoriteRepository.save(favorite);
        }

        const data = await this.buildArticleData(article, userId);
        return new ArticleResponseSerializer(data);
    }

    async unfavoriteArticle(
        userId: number,
        slug: string,
    ): Promise<ArticleResponseSerializer> {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: {
                author: true,
                tags: true,
            },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        const existing = await this.favoriteRepository.findOne({
            where: { userId, articleId: article.id },
        });

        if (existing) {
            await this.favoriteRepository.remove(existing);
        }

        const data = await this.buildArticleData(article, userId);
        return new ArticleResponseSerializer(data);
    }
}
