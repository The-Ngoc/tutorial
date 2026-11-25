import { Exclude, Expose, Type } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserDataSerializer {
    @Expose()
    email: string;

    @Expose()
    token: string;

    @Expose()
    username: string;

    @Expose()
    bio: string | null;

    @Expose()
    image: string | null;

    @Exclude()
    password: string;

    constructor(partial: Partial<User> & { token: string }) {
        Object.assign(this, partial);
    }
}

export class UserResponseSerializer {
    @Expose()
    @Type(() => UserDataSerializer)
    user: UserDataSerializer;

    constructor(user: User, token: string) {
        this.user = new UserDataSerializer({ ...user, token });
    }
}