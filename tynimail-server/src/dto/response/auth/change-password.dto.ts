import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordSuccessDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Password changed successfully',
  })
  message: string;
}

export class ChangePasswordBadRequestDto {
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
    example: 'Bad request - Invalid input data or same password',
  })
  message: string;
}
