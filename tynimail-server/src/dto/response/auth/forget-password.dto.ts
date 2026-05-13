import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordSuccessDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'OTP for password reset sent on email',
  })
  message: string;
}

export class ForgetPasswordValidationErrorDto {
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
    example: 'Please provide a valid email address',
  })
  message: string;
}
