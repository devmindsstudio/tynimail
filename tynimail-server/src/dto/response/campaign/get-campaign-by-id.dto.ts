import { ApiProperty } from '@nestjs/swagger';

export class GetCampaignByIdSuccessDto {
    @ApiProperty({
        description: 'Indicates if the campaign was retrieved successfully',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Campaign retrieved successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Campaign data with related information',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Summer Sale Campaign',
            sender_name: 'John Doe',
            subject: 'Get 50% off on all summer items!',
            preheader_text: 'Limited time offer - shop now!',
            status: 1,
            campaign_status: 1,
            type: 1,
            sender_email_id: '123e4567-e89b-12d3-a456-426614174001',
            sender_email: 'sales@company.com',
            sender_display_name: 'Sales Team',
            template_id: '123e4567-e89b-12d3-a456-426614174003',
            template_type: 1,
            template_content: '<html>...</html>',
            created_at: '2025-12-05T10:30:00.000Z',
            updated_at: '2025-12-05T11:30:00.000Z',
            deleted_at: null,
        },
    })
    data: object;
}

export class GetCampaignByIdNotFoundDto {
    @ApiProperty({
        description: 'Indicates if the campaign retrieval was successful',
        example: false,
    })
    success: boolean;

    @ApiProperty({
        description: 'Error type',
        example: 'CAMPAIGN-NOT-FOUND',
    })
    errorType: string;

    @ApiProperty({
        description: 'Error message',
        example: 'Campaign not found or you do not have permission to view it',
    })
    message: string;
}
