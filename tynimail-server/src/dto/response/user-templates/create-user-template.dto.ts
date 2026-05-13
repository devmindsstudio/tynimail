import { ApiProperty } from '@nestjs/swagger';

export class CreateUserTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the user template was created successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'User template created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created user template data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      template_id: '123e4567-e89b-12d3-a456-426614174002',
      content: '<html><body><h1>Hello!</h1></body></html>',
      status: 1,
      created_at: '2025-12-17T10:30:00.000Z',
      updated_at: '2025-12-17T10:30:00.000Z',
      deleted_at: null,
    },
  })
  data: object;
}

export class CreateUserTemplateValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the user template creation was successful',
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
    example: 'Content is required',
  })
  message: string;
}


