import { ApiProperty } from '@nestjs/swagger';

export class GetNoteSuccessDto {
  @ApiProperty({
    description: 'Indicates if the note was fetched successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Note(s) fetched successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Fetched Note data',
    example: [
      {
        id: 'e6a5554c-72bc-47ca-a1b1-a896f7246d14',
        title: 'New Note Title',
        content: 'description',
        date: '2026-03-10T16:07:48.933Z',
      },
      {
        id: 'ad8b22b2-1f0d-4d95-917b-8c74f433ffa2',
        title: 'New Note Title',
        content: 'description',
        date: '2026-03-10T16:07:48.933Z',
      },
    ],
  })
  data: object;
}

export class GetNoteNotFoundDto {
  @ApiProperty({
    description: 'Indicates if no notes were found',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message',
    example: 'No notes found from the given date',
  })
  message: string;

  @ApiProperty({
    description: 'Error Type',
    example: 'Not Found',
  })
  error: string;
}
