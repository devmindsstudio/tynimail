import { ApiProperty } from '@nestjs/swagger';

export class GetSenderEmailsSuccessDto {
  @ApiProperty({
    description: 'Indicates if the sender emails were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Sender emails retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of sender emails',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'sender@example.com',
        is_verified: true,
        status: 0,
        created_at: '2025-12-08T10:30:00.000Z',
        updated_at: '2025-12-08T10:30:00.000Z',
      },
    ],
  })
  data: object[];
}
