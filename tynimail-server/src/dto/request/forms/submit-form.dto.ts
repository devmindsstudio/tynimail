import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitFormDto {
  @ApiProperty({
    description: 'Form submission content as string (any text or JSON string)',
    example: '{"email":"user@example.com","message":"Hello"}',
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
