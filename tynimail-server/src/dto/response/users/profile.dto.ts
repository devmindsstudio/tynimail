import { ApiProperty } from '@nestjs/swagger';

class UserProfileData {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-11-13T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-13T10:00:00.000Z',
  })
  updatedAt: string;
}

export class GetProfileDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'User profile retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User profile data',
    type: UserProfileData,
  })
  user: UserProfileData;
}

export class UserNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'USER-NOT-FOUND',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'User not found',
  })
  message: string;
}

