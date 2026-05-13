import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpSuccessDto {
  @ApiProperty({
    description: 'Indicates if the OTP verification was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'OTP verified',
  })
  message: string;
}

export class VerifyOtpInvalidDto {
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
    example: 'Invalid OTP',
  })
  message: string;
}

export class VerifyOtpValidationErrorDto {
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
    example: 'OTP must be exactly 6 digits',
  })
  message: string;
}
