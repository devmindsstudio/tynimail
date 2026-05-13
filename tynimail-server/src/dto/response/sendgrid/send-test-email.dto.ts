import { ApiProperty } from '@nestjs/swagger';

export class SendTestEmailSuccessDto {
  @ApiProperty({
    description: 'Indicates if the email was sent successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Test email sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'SendGrid response data',
    example: {
      statusCode: 202,
      messageId: 'abc123xyz',
    },
  })
  data: object;
}
