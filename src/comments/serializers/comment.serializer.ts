import { Expose, Type } from 'class-transformer';
import { ProfileDataSerializer } from '../../users/serializers/profile.serializer';

export class CommentDataSerializer {
    @Expose()
    id: number;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    body: string;

    @Expose()
    @Type(() => ProfileDataSerializer)
    author: ProfileDataSerializer;

    constructor(partial: Partial<CommentDataSerializer>) {
        Object.assign(this, partial);
    }
}

export class SingleCommentResponseSerializer {
    @Expose()
    @Type(() => CommentDataSerializer)
    comment: CommentDataSerializer;

    constructor(data: CommentDataSerializer) {
        this.comment = new CommentDataSerializer(data);
    }
}

export class MultipleCommentsResponseSerializer {
    @Expose()
    @Type(() => CommentDataSerializer)
    comments: CommentDataSerializer[];

    constructor(comments: CommentDataSerializer[]) {
        this.comments = comments;
    }
}
