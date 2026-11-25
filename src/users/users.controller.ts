import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Express } from 'express';
import 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { UserResponseSerializer } from './serializers/user.serializer';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ProfileResponseSerializer } from './serializers/profile.serializer';
import { UsersService } from './users.service';

@ApiTags('User and Profiles')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Put('user')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiConsumes('application/json', 'multipart/form-data')
    @ApiOperation({ summary: 'Update current user (supports JSON or multipart avatar upload)' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateUser(
        @CurrentUser() currentUser: User,
        @Headers('authorization') authHeader: string,
        @Body() dto: UpdateUserDto,
        @UploadedFile() avatarFile?: Express.Multer.File,
    ): Promise<UserResponseSerializer> {
        if (!authHeader) {
            throw new UnauthorizedException();
        }
        const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();

        // Xử lý trường hợp multipart form gửi JSON lồng trong trường 'user'
        if (typeof dto?.user === 'string') {
            try {
                dto.user = JSON.parse(dto.user);
            } catch {
                // ignore nếu không parse được
            }
        }

        return this.usersService.updateUser(currentUser, token, dto || {}, avatarFile);
    }

    @Get('profiles/:username')
    @UseGuards(OptionalAuthGuard)
    @ApiOperation({ summary: 'Get profile by username (auth optional)' })
    @ApiResponse({ status: 200, description: 'Profile found.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async getProfile(
        @Param('username') username: string,
        @CurrentUser() currentUser?: User,
    ): Promise<ProfileResponseSerializer> {
        return this.usersService.getProfile(username, currentUser?.id);
    }

    @Post('profiles/:username/follow')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Follow a user' })
    @ApiResponse({ status: 200, description: 'Followed user successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async followUser(
        @Param('username') username: string,
        @CurrentUser() currentUser: User,
    ): Promise<ProfileResponseSerializer> {
        return this.usersService.followUser(currentUser.id, username);
    }

    @Delete('profiles/:username/follow')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unfollow a user' })
    @ApiResponse({ status: 200, description: 'Unfollowed user successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async unfollowUser(
        @Param('username') username: string,
        @CurrentUser() currentUser: User,
    ): Promise<ProfileResponseSerializer> {
        return this.usersService.unfollowUser(currentUser.id, username);
    }
}
