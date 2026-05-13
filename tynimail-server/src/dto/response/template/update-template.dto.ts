import { ApiProperty } from '@nestjs/swagger';

export class UpdateTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the template was updated successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Template updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated template data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      type: 1,
      content: '<html><body><h1>Updated Content!</h1></body></html>',
      status: 1,
      created_at: '2025-12-05T10:30:00.000Z',
      updated_at: '2025-12-05T11:30:00.000Z',
    },
  })
  data: object;
}

export class UpdateTemplateValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the template update was successful',
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

export class UpdateTemplateNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the template update was successful',
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
    example: 'Template not found or you do not have permission to update it',
  })
  message: string;
}


