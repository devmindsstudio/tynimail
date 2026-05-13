import { ApiProperty } from '@nestjs/swagger';

export class GetCampaignsSuccessDto {
  @ApiProperty({
    description: 'Indicates if the campaigns were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Campaigns retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of campaigns',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Summer Sale Campaign',
        subject: 'Get 50% off on all summer items!',
        preheader_text: 'Limited time offer - shop now!',
        type: 0,
        status: 0,
        template_id: null,
        sender_email_id: '123e4567-e89b-12d3-a456-426614174001',
        sender_email: 'sales@company.com',
        template_type: null,
        created_at: '2025-12-05T10:30:00.000Z',
        updated_at: '2025-12-05T10:30:00.000Z',
      },
    ],
  })
  data: object[];
}
