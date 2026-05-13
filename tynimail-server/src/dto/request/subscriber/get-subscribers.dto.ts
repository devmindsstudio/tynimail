import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsArray, IsString } from 'class-validator';

export class GetSubscribersDto {
    @ApiProperty({
        description: 'Filter subscribers by status (1 = valid, 0 = invalid)',
        example: 1,
        required: false,
        enum: [0, 1],
    })
    @IsOptional()
    @IsIn([0, 1], { message: 'Status must be either 0 or 1' })
    status?: number;

    @ApiProperty({
        description: 'Filter subscribers where the specified columns are NULL or empty',
        example: ['first_name', 'last_name'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray({ message: 'Missing fields must be an array' })
    @IsString({ each: true, message: 'Each field must be a string' })
    missingFields?: string[];

    @ApiProperty({
        description: 'Segment filter condition',
        example: 'is_only_in',
        required: false,
        enum: ['is_only_in', 'is_in_any', 'is_in_all', 'is_not_in_any', 'is_not_in_all', 'is_not_in_any_segment'],
    })
    @IsOptional()
    @IsString({ message: 'Segment condition must be a string' })
    @IsIn(['is_only_in', 'is_in_any', 'is_in_all', 'is_not_in_any', 'is_not_in_all', 'is_not_in_any_segment'],
        { message: 'Segment condition must be one of: is_only_in, is_in_any, is_in_all, is_not_in_any, is_not_in_all, is_not_in_any_segment' })
    segmentCondition?: string;

    @ApiProperty({
        description: 'Array of segment IDs to filter by',
        example: ['7416f122-dc79-4f37-ad1a-ec8762262f61'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray({ message: 'Segment must be an array' })
    @IsString({ each: true, message: 'Each segment ID must be a string' })
    segment?: string[];
}
