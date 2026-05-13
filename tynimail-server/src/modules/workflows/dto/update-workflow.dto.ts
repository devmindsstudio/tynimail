import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { WORKFLOW_STATUS } from '@/constants';
import type { IFlowData, ITriggerConfig } from '../interfaces';

/**
 * DTO for updating an existing workflow
 */
export class UpdateWorkflowDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WORKFLOW_STATUS)
  @IsOptional()
  status?: string;

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
