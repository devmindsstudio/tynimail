import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateFormDto {
  @ApiProperty({
    description: 'Form name',
    example: 'Updated Contact Form',
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @ApiProperty({
    description: 'Form content as string',
    example: '',
    required: false,
  })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Form status (0: DRAFT, 1: LIVE, 2: ARCHIVED)',
    example: 1,
    required: false,
  })
  @IsInt({ message: 'Status must be an integer' })
  @IsOptional()
  @Min(0, { message: 'Status must be 0 or greater' })
  status?: number;
}
