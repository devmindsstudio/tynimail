import { ApiProperty } from "@nestjs/swagger";

export class CreateCampaignScheduleSuccessDto {
  @ApiProperty({
    description: "Indicates if the campaign schedule was created successfully",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Campaign schedule created successfully",
  })
  message: string;

  @ApiProperty({
    description: "Created campaign schedule.",
    example: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      campaign_id: "123e4567-e89b-12d3-a456-426614174000",
      date: "2026-03-10T16:07:48.933Z",
      status: 0,
    },
  })
  data: object;
}

export class CreateCampaignScheduleValidationErrorDto {
  @ApiProperty({
    description: "Indicates if the campaign schedule creation was successful",
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: "Error type",
    example: "VALIDATION-ERROR",
  })
  errorType: string;

  @ApiProperty({
    description: "Error message",
    example: "Name is required",
  })
  message: string;
}

export class CreateCampaignScheduleBadRequestDto {
  @ApiProperty({
    description: "Indicates if the campaign schedule creation was successful",
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: "Error type",
    example: "INVALID-SENDER-EMAIL",
  })
  errorType: string;

  @ApiProperty({
    description: "Error message",
    example: "Sender email not found or does not belong to user",
  })
  message: string;
}
