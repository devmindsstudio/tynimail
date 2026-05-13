import { ApiProperty } from '@nestjs/swagger';

export class GetPagesSuccessDto {
  @ApiProperty({
    description: 'Indicates if the pages were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Pages retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of pages',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'My Landing Page',
        slug: 'my-landing-page',
        status: 1,
        updated_at: '2025-02-17T10:30:00.000Z',
        created_at: '2025-02-17T10:30:00.000Z',
      },
    ],
  })
  data: object;
}

export class GetPageSuccessDto {
  @ApiProperty({
    description: 'Indicates if the page was retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Page retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Page data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'My Landing Page',
      slug: 'my-landing-page',
      content: { blocks: [] },
      status: 1,
      template_id: null,
      created_at: '2025-02-17T10:30:00.000Z',
      updated_at: '2025-02-17T10:30:00.000Z',
      deleted_at: null,
    },
  })
  data: object;
}
