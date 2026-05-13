import { ApiProperty } from '@nestjs/swagger';

export class VerifyPasswordOtpSuccessDto {
  @ApiProperty({
    description: 'Indicates if the OTP verification was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'OTP verified successfully',
  })
  message: string;
}

export class VerifyPasswordOtpInvalidDto {
  @ApiProperty({
    description: 'Indicates if the OTP verification was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'INVALID-OTP',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid or expired OTP',
  })
  message: string;
}

export class VerifyPasswordOtpValidationErrorDto {
  @ApiProperty({
    description: 'Indicates if the OTP verification was successful',
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

export class VerifyPasswordOtpNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the OTP verification was successful',
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
