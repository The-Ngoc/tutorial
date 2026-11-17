import { Body, ClassSerializerInterceptor, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
}