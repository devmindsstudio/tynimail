import { ApiProperty } from '@nestjs/swagger';

export class GetSegmentsSuccessDto {
    @ApiProperty({
        description: 'Indicates if the segments were retrieved successfully',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Segments retrieved successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Array of segments',
        example: {
            segments: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'New Subscribers',
                    color: '#FF5733',
                    subscriber_count: '25',
                    metadata: {
                        open: 0,
                        click: 0,
                    },
                    created_at: '2026-01-13T10:30:00.000Z',
                    updated_at: '2026-01-13T10:30:00.000Z',
                },
            ],
        },
    })
    data: object;
}
