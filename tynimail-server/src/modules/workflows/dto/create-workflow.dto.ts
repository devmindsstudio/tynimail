import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { IFlowData, ITriggerConfig } from '../interfaces';

/**
 * DTO for creating a new workflow
 */
export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  flow_data?: IFlowData;

  @IsArray()
  @IsOptional()
  triggers?: ITriggerConfig[];

  @IsBoolean()
  @IsOptional()
  allow_reentry?: boolean;

  @IsBoolean()
  @IsOptional()
  exit_on_error?: boolean;
}
