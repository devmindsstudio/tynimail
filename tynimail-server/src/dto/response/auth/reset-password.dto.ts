import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordSuccessDto {
  @ApiProperty({
    description: 'Indicates if the password reset was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Password reset successfully',
  })
  message: string;
}

export class ResetPasswordValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the password reset was successful',
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

export class ResetPasswordNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the password reset was successful',
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
    example: 'No account found with this email address',
  })
  message: string;
}

export class ResetPasswordBadRequestDto {
  @ApiProperty({
    description: 'Indicates if the password reset was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'SAME-PASSWORD',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'New password must be different from the current password',
  })
  message: string;
}
