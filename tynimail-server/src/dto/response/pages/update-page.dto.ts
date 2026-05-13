import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageSuccessDto {
  @ApiProperty({
    description: 'Indicates if the page was updated successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Page updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated page data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Updated Landing Page',
      slug: 'updated-landing-page',
      content: { blocks: [] },
      status: 1,
      template_id: null,
      created_at: '2025-02-17T10:30:00.000Z',
      updated_at: '2025-02-17T11:30:00.000Z',
      deleted_at: null,
    },
  })
  data: object;
}

export class UpdatePageValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the page update was successful',
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

export class UpdatePageNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the page update was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'PAGE-NOT-FOUND',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Page not found or you do not have permission to update it',
  })
  message: string;
}
