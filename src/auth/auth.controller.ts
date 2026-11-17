import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    UnauthorizedException,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseSerializer } from '../users/serializers/user.serializer';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/users')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post()
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully.' })
    register(@Body() registerDto: RegisterDto): Promise<UserResponseSerializer> {
        return this.authService.register(registerDto.user);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login existing user' })
    @ApiResponse({ status: 200, description: 'User logged in successfully.' })
    login(@Body() loginDto: LoginDto): Promise<UserResponseSerializer> {
        return this.authService.login(loginDto.user);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout current user' })
    @ApiResponse({ status: 200, description: 'User logged out successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Headers('authorization') authHeader?: string): Promise<{ message: string }> {
        if (!authHeader) {
            throw new UnauthorizedException();
        }
        const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
        return this.authService.logout(token);
    }
}