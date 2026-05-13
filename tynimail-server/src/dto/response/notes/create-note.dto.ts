import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteSuccessDto {
  @ApiProperty({
    description: 'Indicates if the note was created successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Note created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created Note data',
    example: {
      id: 'e6a5554c-72bc-47ca-a1b1-a896f7246d14',
      title: 'New Note Title',
      content: 'description',
      date: '2026-03-10T16:07:48.933Z',
    },
  })
  data: object;
}

export class CreateNoteBadRequestDto {
  @ApiProperty({
    description: 'Indicates if the note creation was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error type',
    example: 'INVALID-TEMPLATE',
  })
  errorType: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid template. The specified template does not exist.',
  })
  message: string;
}
