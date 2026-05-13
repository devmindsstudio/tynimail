import { ApiProperty } from '@nestjs/swagger';

export class DeleteTemplateSuccessDto {
  @ApiProperty({
    description: 'Indicates if the template was deleted successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Template deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Empty data object',
    example: {},
  })
  data: object;
}

export class DeleteTemplateNotFoundDto {
  @ApiProperty({
    description: 'Indicates if the template deletion was successful',
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
    example: 'Template not found or you do not have permission to delete it',
  })
  message: string;
}


