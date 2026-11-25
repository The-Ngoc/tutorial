import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Follow } from '../users/entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { ProfileDataSerializer } from '../users/serializers/profile.serializer';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import {
    CommentDataSerializer,
    MultipleCommentsResponseSerializer,
    SingleCommentResponseSerializer,
} from './serializers/comment.serializer';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,
    ) { }

    async addComment(
        author: User,
        slug: string,
        dto: CreateCommentDto,
    ): Promise<SingleCommentResponseSerializer> {
        const article = await this.articleRepository.findOne({
            where: { slug },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        const comment = this.commentRepository.create({
            body: dto.comment.body,
            article,
            articleId: article.id,
            author,
            authorId: author.id,
        });

        const savedComment = await this.commentRepository.save(comment);

        const commentData = new CommentDataSerializer({
            id: savedComment.id,
            createdAt: savedComment.createdAt,
            updatedAt: savedComment.updatedAt,
            body: savedComment.body,
            author: new ProfileDataSerializer({
                username: author.username,
                bio: author.bio,
                image: author.image,
                following: false,
            }),
        });

        return new SingleCommentResponseSerializer(commentData);
    }

    async getComments(
        currentUserId: number | null,
        slug: string,
    ): Promise<MultipleCommentsResponseSerializer> {
        const article = await this.articleRepository.findOne({
            where: { slug },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        const comments = await this.commentRepository.find({
            where: { articleId: article.id },
            relations: { author: true },
            order: { createdAt: 'DESC' },
        });

        const commentData = await Promise.all(
            comments.map(async (comment) => {
                let following = false;
                if (currentUserId) {
                    const follow = await this.followRepository.findOne({
                        where: {
                            followerId: currentUserId,
                            followingId: comment.author.id,
                        },
                    });
                    following = !!follow;
                }

                return new CommentDataSerializer({
                    id: comment.id,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    body: comment.body,
                    author: new ProfileDataSerializer({
                        username: comment.author.username,
                        bio: comment.author.bio,
                        image: comment.author.image,
                        following,
                    }),
                });
            }),
        );

        return new MultipleCommentsResponseSerializer(commentData);
    }
}
