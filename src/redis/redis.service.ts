import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;

    constructor(private readonly configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get<string>('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
        });
    }

    async setBlacklist(token: string, ttlSeconds: number): Promise<void> {
        if (ttlSeconds > 0) {
            await this.client.set(`blacklist:${token}`, '1', 'EX', ttlSeconds);
        }
    }

    async isBlacklisted(token: string): Promise<boolean> {
        const result = await this.client.get(`blacklist:${token}`);
        return result === '1';
    }

    onModuleDestroy(): void {
        this.client.disconnect();
    }
}