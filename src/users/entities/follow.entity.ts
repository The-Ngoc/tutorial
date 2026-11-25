import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Index(['followerId', 'followingId'], { unique: true })
export class Follow {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'follower_id' })
    follower: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'following_id' })
    following: User;

    @Column({ name: 'follower_id' })
    followerId: number;

    @Column({ name: 'following_id' })
    followingId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
