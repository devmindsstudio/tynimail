import { ApiProperty } from "@nestjs/swagger";

export class UnhandledDto {
    @ApiProperty({
        description: 'Indicates if the operation was successful',
        example: false,
    })
    success: boolean;
    @ApiProperty({
        description: 'Error type',
        example: 'INTERNAL-SERVER-ERROR',
    })
    errorType: string;
    @ApiProperty({
        description: 'Error message',
        example: 'An unexpected error occurred. Please try again later.',
    })
    message: string;
}