import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Summer Sale Campaign',
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @ApiProperty({
    description: 'Sender name to display in email',
    example: 'John Doe',
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Sender name must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Sender name must not exceed 255 characters' })
  senderName?: string;

  @ApiProperty({
    description: 'Email subject line',
    example: 'Get 50% off on all summer items!',
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Subject must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Subject must not exceed 255 characters' })
  subject?: string;

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
    required: false,
  })
  @IsUUID('4', { message: 'Sender email ID must be a valid UUID' })
  @IsOptional()
  senderEmailId?: string;

  @ApiProperty({
    description: 'Campaign type (0: DRAFT, 1: LIVE, 2: SCHEDULED)',
    example: 1,
    required: false,
  })
  @IsInt({ message: 'Type must be an integer' })
  @IsOptional()
  @Min(0, { message: 'Type must be 0 or greater' })
  type?: number;

  @ApiProperty({
    description: 'Campaign status (0: PENDING, 1: ACTIVE, 2: COMPLETED)',
    example: 1,
    required: false,
  })
  @IsInt({ message: 'Campaign status must be an integer' })
  @IsOptional()
  @Min(0, { message: 'Campaign status must be 0 or greater' })
  campaignStatus?: number;

  @ApiProperty({
    description: 'Template ID from tbl_templates',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID('4', { message: 'Template ID must be a valid UUID' })
  @IsOptional()
  templateId?: string;
}


