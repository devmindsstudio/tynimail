import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VerificationType {
  EMAIL_VERIFICATION = 'ev',
  PASSWORD_RESET = 'pr',
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Verification type: ev (email verification) or pr (password reset)',
    example: 'ev',
    enum: VerificationType,
    required: true,
  })
  @IsEnum(VerificationType, {
    message: 'Type must be either "ev" (email verification) or "pr" (password reset)',
  })
  type: VerificationType;
}
