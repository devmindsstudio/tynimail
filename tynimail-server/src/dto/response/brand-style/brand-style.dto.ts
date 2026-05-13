import { ApiProperty } from '@nestjs/swagger';

export class LogoResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the logo',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiProperty({
    description: 'Pre-signed S3 URL for displaying the logo (valid for 1 hour)',
    example:
      'https://my-bucket.s3.amazonaws.com/logos/uuid.png?X-Amz-Signature=...',
  })
  url: string;

  @ApiProperty({
    description: 'Original filename of the uploaded logo',
    example: 'company-logo.png',
  })
  filename: string;

  // @ApiProperty({ example: 'image/png' })
  // mimeType: string;

  // @ApiProperty({ description: 'File size in bytes', example: 24576 })
  // sizeBytes: number;

  @ApiProperty({
    description: 'Whether this logo is the current default',
    example: true,
  })
  isDefault: boolean;

  @ApiProperty({ example: '2026-03-18T10:00:00.000Z' })
  createdAt: string;
}

export class BrandStyleResponseDto {
  @ApiProperty({ example: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d' })
  id?: string;

  @ApiProperty({
    description: 'Company address shown in email footers',
    example: '23 Maple Street, Springfield, IL 62704, USA',
    nullable: true,
  })
  companyAddress: string | null;

  @ApiProperty({
    description: 'Footer contact email address',
    example: 'tynimail@gmail.com',
    nullable: true,
  })
  footerEmail: string | null;

  @ApiProperty({
    description: 'The currently active default logo, or null if none is set',
    type: LogoResponseDto,
    nullable: true,
  })
  defaultLogo: LogoResponseDto | null;

  @ApiProperty({
    description: 'All uploaded logos for this user (maximum 5)',
    type: [LogoResponseDto],
  })
  logos: LogoResponseDto[];

  @ApiProperty({ example: '2026-03-18T12:30:00.000Z' })
  updatedAt: string;
}

export class BrandStyleFetchResponseSuccessDto {
  @ApiProperty({
    description: 'Indicates if the Brand Style was fetched successfully',
    example: true,
  })
  success: Boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Brand style fetched successfully',
  })
  message: string;

  @ApiProperty({ type: BrandStyleResponseDto })
  logo: BrandStyleResponseDto;
}

export class BrandStylePatchResponseSuccessDto {
  @ApiProperty({
    description: 'Indicates if the Brand Style was updated successfully',
    example: true,
  })
  success: Boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Brand style updated successfully',
  })
  message: string;

  @ApiProperty({ type: BrandStyleResponseDto })
  logo: BrandStyleResponseDto;
}

export class UploadLogoResponseDto {
  @ApiProperty({
    description: 'Indicates if the logo was uploaded successfully',
    example: true,
  })
  success: Boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Logo uploaded successfully',
  })
  message: string;

  @ApiProperty({ type: LogoResponseDto })
  logo: LogoResponseDto;

  // @ApiProperty({ example: 'Logo uploaded successfully.' })
  // message: string;
}

export class DeleteLogoResponseDto {
  @ApiProperty({
    description: 'Indicates if the logo was deleted successfully',
    example: true,
  })
  success: Boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Logo deleted successfully',
  })
  message: string;
}

export class SetDefaultLogoResponseDto {
  @ApiProperty({ type: LogoResponseDto })
  data: LogoResponseDto;
}

export class SetDefaultLogoFetchResponseDto {
  @ApiProperty({
    description: 'Indicates if the logo was set as default successfully',
    example: true,
  })
  success: Boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Logo has been set as default successfully',
  })
  message: string;

  @ApiProperty({ type: LogoResponseDto })
  data: LogoResponseDto;
}
