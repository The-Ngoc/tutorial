import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateArticleDataDto {
    @ApiPropertyOptional({ example: 'Did you train your dragon?' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Updated body content' })
    @IsOptional()
    @IsString()
    body?: string;
}

export class UpdateArticleDto {
    @ApiPropertyOptional({ type: UpdateArticleDataDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateArticleDataDto)
    article?: UpdateArticleDataDto;
}

