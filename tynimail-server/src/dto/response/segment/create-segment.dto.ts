import { ApiProperty } from '@nestjs/swagger';

export class CreateSegmentSuccessDto {
    @ApiProperty({
        description: 'Indicates if the segment was created successfully',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Segment created successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Created segment data',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'New Subscribers',
            color: '#FF5733',
            row_status: 1,
            metadata: {},
            created_at: '2026-01-13T10:30:00.000Z',
            updated_at: '2026-01-13T10:30:00.000Z',
        },
    })
    data: object;
}

export class CreateSegmentValidationErrorDto {
    @ApiProperty({
        description: 'Indicates if the segment creation was successful',
        example: false,
    })
    success: boolean;

    @ApiProperty({
        description: 'Error type',
        example: 'VALIDATION-ERROR',
    })
    errorType: string;

    @ApiProperty({
        description: 'Error message',
        example: 'Name is required',
    })
    message: string;
}
