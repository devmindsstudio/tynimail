import { ApiProperty } from '@nestjs/swagger';

export class ValidateEmailSuccessDto {
    @ApiProperty({
        description: 'Indicates if the request was successful',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Success message',
        example: 'Email validated successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Email validation result',
        example: {
            email: 'user@example.com',
            valid: true,
        },
    })
    data: object;
}

export class ValidateEmailValidationErrorDto {
    @ApiProperty({
        description: 'Indicates if the request was successful',
        example: false,
    })
    success: boolean;

    @ApiProperty({
        description: 'Error type',
        example: 'VALIDATION-ERROR',
    })
    errorType: string;

    @ApiProperty({
        description: 'Error message',
        example: 'Email is required',
    })
    message: string;
}
