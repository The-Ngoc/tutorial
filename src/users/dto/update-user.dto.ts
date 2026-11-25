import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class UpdateUserDataDto {
    @ApiPropertyOptional({ example: 'jake@jake.jake' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'jake' })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({ example: 'newpassword' })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ example: 'https://i.stack.imgur.com/xHWG8.jpg' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ example: 'I like to skateboard' })
    @IsOptional()
    @IsString()
    bio?: string;
}

export class UpdateUserDto {
    @ApiPropertyOptional({ type: UpdateUserDataDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateUserDataDto)
    user?: UpdateUserDataDto;
}
