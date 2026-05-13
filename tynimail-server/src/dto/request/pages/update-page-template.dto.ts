import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePageTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'My Template',
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @ApiProperty({
    description: 'Template content as string (e.g. HTML or JSON string)',
    example: '',
    required: false,
  })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Template category',
    example: 'Portfolio',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Preview image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  previewImageUrl?: string;
}
