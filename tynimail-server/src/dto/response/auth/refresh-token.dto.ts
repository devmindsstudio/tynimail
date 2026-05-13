import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenSuccessDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Token refreshed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'New access token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'New refresh token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class RefreshTokenInvalidDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'INVALID-TOKEN',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid or expired refresh token',
  })
  message: string;
}

export class RefreshTokenValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
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
    example: 'Refresh token is required',
  })
  message: string;
}
