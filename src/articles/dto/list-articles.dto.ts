import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListArticlesDto {
    @ApiPropertyOptional({ description: 'Filter by tag name' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ description: 'Filter by author username' })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiPropertyOptional({ description: 'Filter by favorited by username' })
    @IsOptional()
    @IsString()
    favorited?: string;

    @ApiPropertyOptional({ description: 'Limit number of articles', default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;

    @ApiPropertyOptional({ description: 'Offset/skip number of articles', default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}
