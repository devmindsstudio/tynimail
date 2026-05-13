import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the user template was deleted successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'User template deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Empty data object',
    example: {},
  })
  data: object;
}

export class DeleteUserTemplateNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the user template deletion was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'NOT-FOUND',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'User template not found or you do not have permission to delete it',
  })
  message: string;
}


