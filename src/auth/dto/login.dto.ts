import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({ example: 'user@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'useruser' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class LoginDto {
    @ApiProperty({ type: LoginUserDto })
    @ValidateNested()
    @Type(() => LoginUserDto)
    @IsNotEmpty()
    user: LoginUserDto;
}