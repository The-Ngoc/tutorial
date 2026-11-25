import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateCommentDataDto {
    @ApiProperty({ example: 'His name was my name too.' })
    @IsString()
    @IsNotEmpty()
    body: string;
}

export class CreateCommentDto {
    @ApiProperty({ type: CreateCommentDataDto })
    @ValidateNested()
    @Type(() => CreateCommentDataDto)
    @IsNotEmpty()
    comment: CreateCommentDataDto;
}
