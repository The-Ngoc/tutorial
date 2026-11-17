import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';

export class RegisterUserDto {
    @ApiProperty({ example: 'user@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'User' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'useruser' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ type: RegisterUserDto })
    @ValidateNested()
    @Type(() => RegisterUserDto)
    @IsNotEmpty()
    user: RegisterUserDto;
}