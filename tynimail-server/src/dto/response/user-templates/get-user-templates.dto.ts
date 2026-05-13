import { ApiProperty } from '@nestjs/swagger';

export class GetUserTemplatesSuccessDto {
  @ApiProperty({
    description: 'Indicates if the user templates were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'User templates retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of user templates',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        template_id: '123e4567-e89b-12d3-a456-426614174002',
        content: '<html><body><h1>Hello!</h1></body></html>',
        status: 1,
        created_at: '2025-12-17T10:30:00.000Z',
        updated_at: '2025-12-17T10:30:00.000Z',
        deleted_at: null,
      },
    ],
  })
  data: object;
}

export class GetUserTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the user template was retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'User template retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User template data',
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


