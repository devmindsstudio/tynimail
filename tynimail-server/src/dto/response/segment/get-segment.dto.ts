import { ApiProperty } from '@nestjs/swagger';

export class GetSegmentSuccessDto {
    @ApiProperty({
        description: 'Indicates if the segment was retrieved successfully',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Segment retrieved successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Segment data',
        example: {
            segment: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'New Subscribers',
                color: '#FF5733',
                metadata: {},
                created_at: '2026-01-13T10:30:00.000Z',
                updated_at: '2026-01-13T10:30:00.000Z',
            },
        },
    })
    data: object;
}

export class GetSegmentNotFoundDto {
    @ApiProperty({
        description: 'Indicates if the segment was retrieved successfully',
        example: false,
    })
    success: boolean;

    @ApiProperty({
        description: 'Error message',
        example: 'Segment not found',
    })
    message: string;
}
