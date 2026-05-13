import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { AUDIENCE_TYPE } from '@/constants';
import type { AudienceType } from '@/constants';

export class AddCampaignAudienceDto {
    @ApiProperty({
        description: 'Type of audience to add. 0 = segment, 1 = subscriber',
        enum: [0, 1],
        example: 0,
    })
    @IsEnum(AUDIENCE_TYPE, { message: 'audienceType must be 0 (segment) or 1 (subscriber)' })
    @IsNotEmpty({ message: 'audienceType is required' })
    audienceType: AudienceType;

    @ApiProperty({
        description: 'UUID of the segment or subscriber to add',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID('4', { message: 'id must be a valid UUID' })
    @IsNotEmpty({ message: 'id is required' })
    id: string;
}
