import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Indicates if the login was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'Authentication tokens',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...=',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Indicates if the user email is verified',
    example: true,
  })
  isEmailVerified: boolean;
}

export class LoginUnauthorizedDto {
  @ApiProperty({
    description: 'Indicates if the login was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'UNAUTHORIZED-ERROR',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid email or password',
  })
  message: string;
}

export class LoginValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the login was successful',
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
    example: 'Please provide a valid email address',
  })
  message: string;
}
