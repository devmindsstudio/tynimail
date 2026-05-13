import { ApiProperty } from '@nestjs/swagger';

export class DeleteNoteSuccessDto {
  @ApiProperty({
    description: 'Indicates if the note was deleted successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Note deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Deleted Note data',
    example: {
      id: 'e6a5554c-72bc-47ca-a1b1-a896f7246d14',
      title: 'New Note Title',
      content: 'description',
      date: '2026-03-10T16:07:48.933Z',
      deleted_at: '2026-03-18T22:30:48.933Z',
    },
  })
  data: object;
}

export class DeleteNoteBadRequestDto {
  @ApiProperty({
    description: 'Indicates if the note deletion was successful',
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
