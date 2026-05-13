import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateBrandStyleDto {
  @ApiPropertyOptional({
    description: 'UUID of the logo to set as default',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  defaultLogoId?: string;

  @ApiPropertyOptional({
    description: 'Company address shown in the email footer',
    example: '23 Maple Street, Springfield, IL 62704, USA',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  companyAddress?: string;

  @ApiPropertyOptional({
    description: 'Footer contact email address',
    example: 'tynimail@gmail.com',
    maxLength: 254,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  footerEmail?: string;
}

export class UpdateBrandStyleFullDto {
  @ApiPropertyOptional({ description: 'Files' })
  @IsOptional()
  @IsString()
  files?: any;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  companyAddress?: string;

  @ApiPropertyOptional({ description: 'Footer email address' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value === '' ? undefined : value))
  footerEmail?: string;
}
