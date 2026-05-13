import { ApiProperty } from '@nestjs/swagger';

export class GetFormAnalyticsSuccessDto {
  @ApiProperty({
    description: 'Indicates if the analytics were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Form analytics retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Analytics data including list of form responses',
    example: {
      formName: 'Contact Form',
      totalViews: 17,
      uniqueViews: 17,
      totalResponses: 17,
      conversionRate: 95,
      viewsByDevice: {
        desktop: 8,
        tablet: 2,
        mobile: 7,
      },
      responses: [
        {
          id: 'uuid',
          form_id: 'uuid',
          visitor_id: 'uuid',
          response_data: { email: 'user@example.com', message: 'Hello' },
          created_at: '2026-02-24T12:00:00.000Z',
        },
      ],
    },
  })
  data: object;
}
