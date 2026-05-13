import { ApiProperty } from '@nestjs/swagger';

export class GetFormsSuccessDto {
  @ApiProperty({
    description: 'Indicates if the forms were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Forms retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of forms with response counts',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Contact Form',
        slug: 'contact-form',
        status: 1,
        totalResponses: 7,
        updated_at: '2025-02-18T10:30:00.000Z',
        created_at: '2025-02-18T10:30:00.000Z',
      },
    ],
  })
  data: object;
}

export class GetFormSuccessDto {
  @ApiProperty({
    description: 'Indicates if the form was retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Form retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Form data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Contact Form',
      slug: 'contact-form',
      content: '',
      status: 1,
      created_at: '2025-02-18T10:30:00.000Z',
      updated_at: '2025-02-18T10:30:00.000Z',
      deleted_at: null,
    },
  })
  data: object;
}
