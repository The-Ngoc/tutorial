import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
    MultipleCommentsResponseSerializer,
    SingleCommentResponseSerializer,
} from './serializers/comment.serializer';

@ApiTags('Comments')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/articles/:slug/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a comment to an article' })
    @ApiResponse({ status: 201, description: 'Comment created successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Article not found.' })
    async addComment(
        @Param('slug') slug: string,
        @CurrentUser() currentUser: User,
        @Body() dto: CreateCommentDto,
    ): Promise<SingleCommentResponseSerializer> {
        return this.commentsService.addComment(currentUser, slug, dto);
    }

    @Get()
    @UseGuards(OptionalAuthGuard)
    @ApiOperation({ summary: 'Get comments from an article' })
    @ApiResponse({ status: 200, description: 'List of comments.' })
    @ApiResponse({ status: 404, description: 'Article not found.' })
    async getComments(
        @Param('slug') slug: string,
        @CurrentUser() currentUser: User | null,
    ): Promise<MultipleCommentsResponseSerializer> {
        return this.commentsService.getComments(currentUser?.id ?? null, slug);
    }
}
