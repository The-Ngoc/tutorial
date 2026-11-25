import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateArticleDataDto {
    @ApiProperty({ example: 'How to train your dragon' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Ever wonder how?' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'You have to believe' })
    @IsString()
    @IsNotEmpty()
    body: string;

    @ApiPropertyOptional({ example: ['reactjs', 'angularjs', 'dragons'], type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tagList?: string[];
}

export class CreateArticleDto {
    @ApiProperty({ type: CreateArticleDataDto })
    @ValidateNested()
    @Type(() => CreateArticleDataDto)
    @IsNotEmpty()
    article: CreateArticleDataDto;
}

