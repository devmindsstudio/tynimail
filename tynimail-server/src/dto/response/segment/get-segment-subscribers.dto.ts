import { ApiProperty } from '@nestjs/swagger';

export class GetSegmentSubscribersSuccessDto {
    @ApiProperty({
        description: 'Indicates if the subscribers were retrieved successfully',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Subscribers retrieved successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Array of subscribers in the segment',
        example: {
            subscribers: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    status: 1,
                    created_at: '2026-01-13T10:30:00.000Z',
                    updated_at: '2026-01-13T10:30:00.000Z',
                    added_to_segment_at: '2026-01-14T10:30:00.000Z',
                },
            ],
        },
    })
    data: object;
}
