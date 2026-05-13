import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Summer Sale Campaign',
    maxLength: 255,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Sender name to display in email',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsString({ message: 'Sender name must be a string' })
  @IsNotEmpty({ message: 'Sender name is required' })
  @MaxLength(255, { message: 'Sender name must not exceed 255 characters' })
  senderName: string;

  @ApiProperty({
    description: 'Email subject line',
    example: 'Get 50% off on all summer items!',
    maxLength: 255,
  })
  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(255, { message: 'Subject must not exceed 255 characters' })
  subject: string;

  @ApiProperty({
    description: 'Preheader text (email preview text)',
    example: 'Limited time offer - shop now!',
    required: false,
    maxLength: 255,
  })
  @IsString({ message: 'Preheader text must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Preheader text must not exceed 255 characters' })
  preheaderText?: string;

  @ApiProperty({
    description: 'Sender email ID from tbl_sender_emails',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Sender email ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Sender email ID is required' })
  senderEmailId: string;

  @ApiProperty({
    description: 'User template ID from tbl_user_templates (optional)',
    example: '123e4567-e89b-12d3-a456-426614174111',
    required: false,
  })
  @IsUUID('4', { message: 'Template ID must be a valid UUID' })
  @IsOptional()
  templateId?: string;
}
