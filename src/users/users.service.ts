import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type { Express } from 'express';
import 'multer';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AttachmentsService } from '../attachments/attachments.service';
import { UserResponseSerializer } from './serializers/user.serializer';
import { UpdateUserDto } from './dto/update-user.dto';
import { Follow } from './entities/follow.entity';
import { User } from './entities/user.entity';
import { ProfileResponseSerializer } from './serializers/profile.serializer';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,
        private readonly attachmentsService: AttachmentsService,
        private readonly i18n: I18nService,
    ) { }

    async updateUser(
        currentUser: User,
        token: string,
        dto: UpdateUserDto,
        avatarFile?: Express.Multer.File,
    ): Promise<UserResponseSerializer> {
        const userData = dto.user;

        if (userData?.email && userData.email !== currentUser.email) {
            const existing = await this.userRepository.findOne({
                where: { email: userData.email },
            });
            if (existing) {
                throw new ConflictException(
                    this.i18n.t('common.EMAIL_OR_USERNAME_EXISTS', {
                        lang: I18nContext.current()?.lang,
                    }),
                );
            }
            currentUser.email = userData.email;
        }

        if (userData?.username && userData.username !== currentUser.username) {
            const existing = await this.userRepository.findOne({
                where: { username: userData.username },
            });
            if (existing) {
                throw new ConflictException(
                    this.i18n.t('common.EMAIL_OR_USERNAME_EXISTS', {
                        lang: I18nContext.current()?.lang,
                    }),
                );
            }
            currentUser.username = userData.username;
        }

        if (userData?.password) {
            currentUser.password = await bcrypt.hash(userData.password, 10);
        }

        if (userData?.bio !== undefined) {
            currentUser.bio = userData.bio;
        }

        if (userData?.image !== undefined) {
            currentUser.image = userData.image;
        }

        // Nếu có upload avatar file qua multipart
        if (avatarFile) {
            const attachment = await this.attachmentsService.saveAttachment(
                'User',
                currentUser.id,
                avatarFile,
                'avatars',
            );
            currentUser.image = attachment.url;
        }

        const updatedUser = await this.userRepository.save(currentUser);
        return new UserResponseSerializer(updatedUser, token);
    }

    async getProfile(
        username: string,
        currentUserId?: number,
    ): Promise<ProfileResponseSerializer> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException(
                this.i18n.t('common.USER_NOT_FOUND', {
                    lang: I18nContext.current()?.lang,
                }) || 'User not found',
            );
        }

        let following = false;
        if (currentUserId && currentUserId !== user.id) {
            const follow = await this.followRepository.findOne({
                where: {
                    followerId: currentUserId,
                    followingId: user.id,
                },
            });
            following = !!follow;
        }

        return new ProfileResponseSerializer(user, following);
    }

    async followUser(
        currentUserId: number,
        targetUsername: string,
    ): Promise<ProfileResponseSerializer> {
        const targetUser = await this.userRepository.findOne({
            where: { username: targetUsername },
        });
        if (!targetUser) {
            throw new NotFoundException(
                this.i18n.t('common.USER_NOT_FOUND', {
                    lang: I18nContext.current()?.lang,
                }) || 'User not found',
            );
        }

        if (currentUserId === targetUser.id) {
            throw new BadRequestException('You cannot follow yourself');
        }

        const existingFollow = await this.followRepository.findOne({
            where: {
                followerId: currentUserId,
                followingId: targetUser.id,
            },
        });

        if (!existingFollow) {
            const follow = this.followRepository.create({
                followerId: currentUserId,
                followingId: targetUser.id,
            });
            await this.followRepository.save(follow);
        }

        return new ProfileResponseSerializer(targetUser, true);
    }

    async unfollowUser(
        currentUserId: number,
        targetUsername: string,
    ): Promise<ProfileResponseSerializer> {
        const targetUser = await this.userRepository.findOne({
            where: { username: targetUsername },
        });
        if (!targetUser) {
            throw new NotFoundException(
                this.i18n.t('common.USER_NOT_FOUND', {
                    lang: I18nContext.current()?.lang,
                }) || 'User not found',
            );
        }

        if (currentUserId === targetUser.id) {
            throw new BadRequestException('You cannot unfollow yourself');
        }

        const existingFollow = await this.followRepository.findOne({
            where: {
                followerId: currentUserId,
                followingId: targetUser.id,
            },
        });

        if (existingFollow) {
            await this.followRepository.remove(existingFollow);
        }

        return new ProfileResponseSerializer(targetUser, false);
    }
}
