import { ApiProperty } from '@nestjs/swagger';

export class DeleteCampaignSuccessDto {
    @ApiProperty({
        description: 'Indicates if the campaign was deleted successfully',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Campaign deleted successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Deleted campaign information',
        example: {
            campaignId: '123e4567-e89b-12d3-a456-426614174000',
            deletedAt: '2025-12-19T10:30:00.000Z',
        },
    })
    data: object;
}

export class DeleteCampaignNotFoundDto {
    @ApiProperty({
        description: 'Indicates if the campaign deletion was successful',
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
        example: 'Campaign not found or you do not have permission to delete it',
    })
    message: string;
}
