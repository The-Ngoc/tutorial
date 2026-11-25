import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Article } from './article.entity';

@Entity('favorites')
@Index(['userId', 'articleId'], { unique: true })
export class Favorite {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Article, (article) => article.favorites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'article_id' })
    article: Article;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'article_id' })
    articleId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

