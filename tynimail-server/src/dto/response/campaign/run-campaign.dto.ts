import { ApiProperty } from '@nestjs/swagger';

export class RunCampaignSuccessDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Campaign queued successfully' })
    message: string;

    @ApiProperty({
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Summer Sale Campaign',
            campaign_status: 1,
            type: 1,
        },
    })
    data: object;
}

export class RunCampaignBadRequestDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'VALIDATION-ERROR' })
    errorType: string;

    @ApiProperty({ example: 'Campaign is already running or completed' })
    message: string;
}

export class RunCampaignNotFoundDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'NOT-FOUND-ERROR' })
    errorType: string;

    @ApiProperty({ example: 'Campaign not found or you do not have permission' })
    message: string;
}

export class RunCampaignTooManyRequestsDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'TOO-MANY-CAMPAIGNS' })
    errorType: string;

    @ApiProperty({ example: 'You already have campaigns running. Please wait for them to complete.' })
    message: string;
}

export class GetCampaignSendsSuccessDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Campaign sends retrieved successfully' })
    message: string;

    @ApiProperty({
        example: {
            sends: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    subscriber_id: '123e4567-e89b-12d3-a456-426614174001',
                    email: 'john@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    status: 1,
                    error_message: null,
                    created_at: '2026-03-09T10:00:00.000Z',
                },
            ],
            total: 1240,
            page: 1,
            limit: 50,
        },
    })
    data: object;
}
