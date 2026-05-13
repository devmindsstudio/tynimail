import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({
    description: 'Form name',
    example: 'Contact Form',
    maxLength: 255,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Form content as string',
    example: '',
    required: false,
  })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  content?: string;
}
