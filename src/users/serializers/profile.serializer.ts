import { Expose, Type } from 'class-transformer';
import { User } from '../entities/user.entity';

export class ProfileDataSerializer {
    @Expose()
    username: string;

    @Expose()
    bio: string | null;

    @Expose()
    image: string | null;

    @Expose()
    following: boolean;

    constructor(partial: Partial<User> & { following: boolean }) {
        Object.assign(this, partial);
    }
}

export class ProfileResponseSerializer {
    @Expose()
    @Type(() => ProfileDataSerializer)
    profile: ProfileDataSerializer;

    constructor(user: User, following: boolean = false) {
        this.profile = new ProfileDataSerializer({
            username: user.username,
            bio: user.bio,
            image: user.image,
            following,
        });
    }
}
