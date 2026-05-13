import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpdateUserTemplateDto {
  @ApiPropertyOptional({
    description: 'Base template ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(undefined, { message: 'Template ID must be a valid UUID' })
  @IsOptional()
  template_id?: string | null;

  @ApiPropertyOptional({
    description: 'Template content (HTML/text)',
    example: '<html><body><h1>Updated!</h1></body></html>',
  })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Status (1 = active, 0 = inactive)',
    example: 1,
  })
  @IsInt({ message: 'Status must be an integer' })
  @Min(0, { message: 'Status must be 0 or 1' })
  @Max(1, { message: 'Status must be 0 or 1' })
  @IsOptional()
  status?: number;
}


