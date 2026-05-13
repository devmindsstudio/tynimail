import { ApiProperty } from '@nestjs/swagger';

export class UpdateNameSuccessDto {
  @ApiProperty({
    description: 'Indicates if the name was updated successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: "User's Fullname updated successfully",
  })
  message: string;

  @ApiProperty({
    description: 'Updated Note data',
    example: {
      userId: '019cfd67-4f73-7928-84e3-ec0b449befd3',
      fullName: 'John Terry',
    },
  })
  data: object;
}
