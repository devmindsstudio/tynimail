import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({
    description: 'Page name',
    example: 'My Landing Page',
    maxLength: 255,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Page template ID from tbl_page_templates (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID('4', { message: 'Template ID must be a valid UUID' })
  @IsOptional()
  templateId?: string;

  @ApiProperty({
    description: 'Page content as string (e.g. HTML or JSON string)',
    example: '',
    required: false,
  })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  content?: string;
}
