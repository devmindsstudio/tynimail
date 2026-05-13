import { ApiProperty } from '@nestjs/swagger';

export class UpdateCampaignSuccessDto {
  @ApiProperty({
    description: 'Indicates if the campaign was updated successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Campaign updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated campaign data',
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
      template_id: '123e4567-e89b-12d3-a456-426614174003',
      type: 1,
      created_at: '2025-12-05T10:30:00.000Z',
      updated_at: '2025-12-05T11:30:00.000Z',
    },
  })
  data: object;
}

export class UpdateCampaignValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the campaign update was successful',
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
    example: 'Name must be a string',
  })
  message: string;
}

export class UpdateCampaignNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the campaign update was successful',
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
    example: 'Campaign not found or you do not have permission to update it',
  })
  message: string;
}

export class UpdateCampaignBadRequestDto {
  @ApiProperty({
    description: 'Indicates if the campaign update was successful',
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
    example: 'Invalid sender email. The specified sender email does not belong to you or does not exist.',
  })
  message: string;
}


