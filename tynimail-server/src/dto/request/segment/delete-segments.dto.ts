import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteSegmentsDto {
    @ApiProperty({
        description: 'Array of segment IDs to delete',
        example: ['123e4567-e89b-12d3-a456-426614174000', '987e6543-e21b-12d3-a456-426614174000'],
        type: [String],
    })
    @IsArray({ message: 'Segment IDs must be an array' })
    @IsNotEmpty({ message: 'Segment IDs array cannot be empty' })
    @IsUUID('4', { each: true, message: 'Each segment ID must be a valid UUID' })
    segmentIds: string[];
}
