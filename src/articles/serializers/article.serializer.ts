import { Exclude, Expose, Type } from 'class-transformer';
import { ProfileDataSerializer } from '../../users/serializers/profile.serializer';

export class SingleArticleDataSerializer {
    @Expose()
    slug: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    body: string;

    @Expose()
    tagList: string[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    favorited: boolean;

    @Expose()
    favoritesCount: number;

    @Expose()
    @Type(() => ProfileDataSerializer)
    author: ProfileDataSerializer;

    constructor(partial: Partial<SingleArticleDataSerializer>) {
        Object.assign(this, partial);
    }
}

export class ListArticleDataSerializer {
    @Expose()
    slug: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Exclude()
    body?: string; // Ẩn trường body theo khuyến nghị tối ưu hiệu năng 2024

    @Expose()
    tagList: string[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    favorited: boolean;

    @Expose()
    favoritesCount: number;

    @Expose()
    @Type(() => ProfileDataSerializer)
    author: ProfileDataSerializer;

    constructor(partial: Partial<ListArticleDataSerializer>) {
        Object.assign(this, partial);
    }
}

export class ArticleResponseSerializer {
    @Expose()
    @Type(() => SingleArticleDataSerializer)
    article: SingleArticleDataSerializer;

    constructor(data: SingleArticleDataSerializer) {
        this.article = new SingleArticleDataSerializer(data);
    }
}

export class ArticlesResponseSerializer {
    @Expose()
    @Type(() => ListArticleDataSerializer)
    articles: ListArticleDataSerializer[];

    @Expose()
    articlesCount: number;

    constructor(articles: ListArticleDataSerializer[], count: number) {
        this.articles = articles.map((a) => new ListArticleDataSerializer(a));
        this.articlesCount = count;
    }
}
