import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the user template was updated successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'User template updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user template data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      template_id: '123e4567-e89b-12d3-a456-426614174002',
      content: '<html><body><h1>Updated!</h1></body></html>',
      status: 1,
      created_at: '2025-12-17T10:30:00.000Z',
      updated_at: '2025-12-17T11:30:00.000Z',
      deleted_at: null,
    },
  })
  data: object;
}

export class UpdateUserTemplateValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the user template update was successful',
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
    example: 'Content must be a string',
  })
  message: string;
}

export class UpdateUserTemplateNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the user template update was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'NOT-FOUND',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'User template not found or you do not have permission to update it',
  })
  message: string;
}


