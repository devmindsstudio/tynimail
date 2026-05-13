import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID, ArrayMinSize } from 'class-validator';

export class ManageSegmentSubscribersDto {
    @ApiProperty({
        description: 'Array of subscriber IDs to add/remove from segment',
        example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
        type: [String],
    })
    @IsArray({ message: 'Subscriber IDs must be an array' })
    @ArrayMinSize(1, { message: 'At least one subscriber ID is required' })
    @IsUUID('4', { each: true, message: 'Each subscriber ID must be a valid UUID' })
    @IsNotEmpty({ message: 'Subscriber IDs are required' })
    subscriber_ids: string[];
}
