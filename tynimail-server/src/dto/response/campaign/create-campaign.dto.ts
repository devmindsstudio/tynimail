import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignSuccessDto {
  @ApiProperty({
    description: 'Indicates if the campaign was created successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Campaign created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created campaign data. Note: campaignStatus and type are set automatically by the backend',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Summer Sale Campaign',
      sender_name: 'John Doe',
      subject: 'Get 50% off on all summer items!',
      preheader_text: 'Limited time offer - shop now!',
      status: null,
      campaign_status: 1,
      sender_email_id: '123e4567-e89b-12d3-a456-426614174001',
      template_id: null,
      type: 1,
      created_at: '2025-12-05T10:30:00.000Z',
      updated_at: '2025-12-05T10:30:00.000Z',
    },
  })
  data: object;
}

export class CreateCampaignValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the campaign creation was successful',
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

export class CreateCampaignBadRequestDto {
  @ApiProperty({
    description: 'Indicates if the campaign creation was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'INVALID-SENDER-EMAIL',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Sender email not found or does not belong to user',
  })
  message: string;
}
