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
}
