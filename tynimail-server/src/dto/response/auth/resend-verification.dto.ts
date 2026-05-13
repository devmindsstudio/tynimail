import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationSuccessDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Verification code sent successfully',
  })
  message: string;
}

export class ResendVerificationValidationErrorDto {
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
    example: 'Type must be either "ev" (email verification) or "pr" (password reset)',
  })
  message: string;
}
