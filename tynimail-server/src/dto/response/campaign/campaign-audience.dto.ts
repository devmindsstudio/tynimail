import { ApiProperty } from '@nestjs/swagger';

export class AddCampaignAudienceSuccessDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Audience added successfully' })
    message: string;

    @ApiProperty({
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            campaign_id: '123e4567-e89b-12d3-a456-426614174001',
            audience_type: 0,
            segment_id: '123e4567-e89b-12d3-a456-426614174002',
            subscriber_id: null,
            created_at: '2026-03-09T10:00:00.000Z',
        },
    })
    data: object;
}

export class AddCampaignAudienceNotFoundDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'NOT-FOUND-ERROR' })
    errorType: string;

    @ApiProperty({ example: 'Campaign not found or you do not have permission' })
    message: string;
}

export class AddCampaignAudienceBadRequestDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'VALIDATION-ERROR' })
    errorType: string;

    @ApiProperty({ example: 'This segment is already added to the campaign' })
    message: string;
}

export class GetCampaignAudiencesSuccessDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Campaign audiences retrieved successfully' })
    message: string;

    @ApiProperty({
        example: {
            audiences: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    audience_type: 0,
                    segment_id: '123e4567-e89b-12d3-a456-426614174002',
                    subscriber_id: null,
                    name: 'Newsletter Subscribers',
                    email: null,
                    subscriber_count: 1240,
                    created_at: '2026-03-09T10:00:00.000Z',
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174001',
                    audience_type: 1,
                    segment_id: null,
                    subscriber_id: '123e4567-e89b-12d3-a456-426614174003',
                    name: 'John Doe',
                    email: 'john@example.com',
                    subscriber_count: null,
                    created_at: '2026-03-09T10:00:00.000Z',
                },
            ],
        },
    })
    data: object;
}

export class GetCampaignAudienceCountSuccessDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Audience count retrieved successfully' })
    message: string;

    @ApiProperty({
        example: {
            total_unique_recipients: 1285,
        },
    })
    data: object;
}

export class RemoveCampaignAudienceSuccessDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Audience removed successfully' })
    message: string;

    @ApiProperty({
        example: {
            audienceId: '123e4567-e89b-12d3-a456-426614174000',
            removedAt: '2026-03-09T10:00:00.000Z',
        },
    })
    data: object;
}

export class RemoveCampaignAudienceNotFoundDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'NOT-FOUND-ERROR' })
    errorType: string;

    @ApiProperty({ example: 'Audience entry not found' })
    message: string;
}
