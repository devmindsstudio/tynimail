import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Note Title',
    example: 'New Note Title',
    maxLength: 255,
  })
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(255, { message: 'title must not exceed 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Note content as string',
    example: 'description',
    required: true,
  })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  content: string;

  @ApiProperty({
    description: 'Note date as string',
    example: '2026-03-10T16:07:48.933Z',
    required: true,
  })
  @IsString({ message: 'Date must be a string' })
  date: string;
}
