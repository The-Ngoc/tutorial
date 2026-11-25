import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RedisService } from '../redis/redis.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserResponseSerializer } from '../users/serializers/user.serializer';
import { LoginUserDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly i18n: I18nService,
    ) { }

    async register(dto: RegisterUserDto): Promise<UserResponseSerializer> {
        const existingUser = await this.userRepository.findOne({
            where: [{ email: dto.email }, { username: dto.username }],
        });
        if (existingUser) {
            throw new ConflictException(
                this.i18n.t('common.EMAIL_OR_USERNAME_EXISTS', { lang: I18nContext.current()?.lang }),
            );
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.userRepository.create({
            email: dto.email,
            username: dto.username,
            password: hashedPassword,
        });
        const savedUser = await this.userRepository.save(user);

        const token = this.generateToken(savedUser);
        return new UserResponseSerializer(savedUser, token);
    }

    async login(dto: LoginUserDto): Promise<UserResponseSerializer> {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException(
                this.i18n.t('common.INVALID_CREDENTIALS', { lang: I18nContext.current()?.lang }),
            );
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException(
                this.i18n.t('common.INVALID_CREDENTIALS', { lang: I18nContext.current()?.lang }),
            );
        }

        const token = this.generateToken(user);
        return new UserResponseSerializer(user, token);
    }

    async logout(token: string): Promise<{ message: string }> {
        const decoded = this.jwtService.decode(token) as JwtPayload | null;
        if (decoded?.exp) {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const ttl = decoded.exp - currentTimestamp;
            if (ttl > 0) {
                await this.redisService.setBlacklist(token, ttl);
            }
        }

        return {
            message: this.i18n.t('common.LOGOUT_SUCCESS', {
                lang: I18nContext.current()?.lang,
            }),
        };
    }

    getCurrentUser(user: User, token: string): UserResponseSerializer {
        return new UserResponseSerializer(user, token);
    }


    private generateToken(user: User): string {
        return this.jwtService.sign({ sub: user.id, email: user.email });
    }
}