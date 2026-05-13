import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountSuccessDto {
  @ApiProperty({
    description: 'Indicates if the account was deleted successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: "User's account deleted successfully",
  })
  message: string;

  @ApiProperty({
    description: 'Deleted account details',
    example: {
      userId: '019cfd67-4f73-7928-84e3-ec0b449befd3',
      status: '0',
      deleted_at: '2026-03-17T20:03:56.443Z',
    },
  })
  data: object;
}
