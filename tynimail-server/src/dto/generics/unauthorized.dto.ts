import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
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
    example: 'Invalid or expired token',
  })
  message: string;
}
