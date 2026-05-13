import { ApiProperty } from '@nestjs/swagger';

export class CreatePageSuccessDto {
  @ApiProperty({
    description: 'Indicates if the page was created successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Page created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created page data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'My Landing Page',
      slug: 'my-landing-page',
      content: { blocks: [] },
      status: 0,
      template_id: null,
      created_at: '2025-02-17T10:30:00.000Z',
      updated_at: '2025-02-17T10:30:00.000Z',
      deleted_at: null,
    },
  })
  data: object;
}

export class CreatePageValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the page creation was successful',
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

export class CreatePageBadRequestDto {
  @ApiProperty({
    description: 'Indicates if the page creation was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'INVALID-TEMPLATE',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid template. The specified template does not exist.',
  })
  message: string;
}
