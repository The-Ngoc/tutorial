import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { RedisService } from '../../redis/redis.service';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
    sub: number;
    email: string;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly redisService: RedisService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                ExtractJwt.fromAuthHeaderWithScheme('Token'),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'secret'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: JwtPayload): Promise<User> {
        const rawAuth = req.headers.authorization;
        if (rawAuth) {
            const token = rawAuth.replace(/^(Bearer|Token)\s+/i, '').trim();
            const isBlacklisted = await this.redisService.isBlacklisted(token);
            if (isBlacklisted) {
                throw new UnauthorizedException();
            }
        }

        const user = await this.userRepository.findOne({ where: { id: payload.sub } });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}