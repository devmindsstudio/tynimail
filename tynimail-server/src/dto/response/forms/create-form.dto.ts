import { ApiProperty } from '@nestjs/swagger';

export class CreateFormSuccessDto {
  @ApiProperty({
    description: 'Indicates if the form was created successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Form created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created form data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Contact Form',
      slug: 'contact-form',
      content: '',
      status: 0,
      created_at: '2025-02-18T10:30:00.000Z',
      updated_at: '2025-02-18T10:30:00.000Z',
      deleted_at: null,
    },
  })
  data: object;
}

export class CreateFormValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the form creation was successful',
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
