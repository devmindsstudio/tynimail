import { ApiProperty } from '@nestjs/swagger';

export class GetTemplatesSuccessDto {
  @ApiProperty({
    description: 'Indicates if the templates were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Templates retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of templates',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 1,
        content: '<html><body><h1>Welcome!</h1></body></html>',
        status: 1,
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        created_at: '2025-12-05T10:30:00.000Z',
        updated_at: '2025-12-05T10:30:00.000Z',
      },
    ],
  })
  data: object;
}

export class GetTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the template was retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Template retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Template data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 1,
      content: '<html><body><h1>Welcome!</h1></body></html>',
      status: 1,
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      created_at: '2025-12-05T10:30:00.000Z',
      updated_at: '2025-12-05T10:30:00.000Z',
    },
  })
  data: object;
}


