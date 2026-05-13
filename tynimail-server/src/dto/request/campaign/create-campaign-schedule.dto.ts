import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCampaignScheduleDto {
  @ApiProperty({
    description: "Campaign Schedule Date and Time",
    example: "2026-03-10T16:07:48.933Z",
    maxLength: 255,
  })
  @IsString({ message: "Date must be a string" })
  @IsNotEmpty({ message: "Date is required" })
  @MaxLength(255, { message: "Date must not exceed 255 characters" })
  date: string;
}
