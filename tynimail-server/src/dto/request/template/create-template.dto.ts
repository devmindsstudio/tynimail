import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Template content (HTML/text)',
    example: '<html><body><h1>Welcome!</h1></body></html>',
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}

