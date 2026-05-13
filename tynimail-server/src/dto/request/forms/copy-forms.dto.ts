import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class CopyFormsDto {
  @ApiProperty({
    description: 'Array of form IDs to copy',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
    minItems: 1,
  })
  @IsArray({ message: 'Form IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one form ID is required' })
  @IsUUID('4', { each: true, message: 'Each form ID must be a valid UUID' })
  formIds: string[];
}
