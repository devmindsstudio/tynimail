import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the template was created successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Template created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created template data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      type: 1,
      content: '<html><body><h1>Welcome!</h1></body></html>',
      status: 1,
      created_at: '2025-12-05T10:30:00.000Z',
      updated_at: '2025-12-05T10:30:00.000Z',
    },
  })
  data: object;
}

export class CreateTemplateValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the template creation was successful',
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
    example: 'Type is required',
  })
  message: string;
}


