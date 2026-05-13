import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
    @ApiProperty({
        description: 'Indicates if the registration was successful',
        example: true,
    })
    success: Boolean;
    @ApiProperty({
        description: 'Success message',
        example: 'User registered successfully',
    })
    message: string;
    @ApiProperty({
        description: 'Authentication tokens',
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;
    @ApiProperty({
        description: 'Refresh token for obtaining new access tokens',
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...=',
    })
    refreshToken: string;
};

export class RegisterConlictDto {
    @ApiProperty({
        description: 'Indicates if the registration was successful',
        example: false,
    })
    success: Boolean;
    @ApiProperty({
        description: 'Error type',
        example: 'CONFLICT-ERROR',
    })
    errorType: string;
    @ApiProperty({
        description: 'Error message',
        example: 'User with this email already exists',
    })
    message: string;
}

export class RegisterValidationErrorDto {
    @ApiProperty({
        description: 'Indicates if the registration was successful',
        example: false,
    })
    success: Boolean
    @ApiProperty({
        description: 'Error type',
        example: 'VALIDATION-ERROR',
    })
    errorType: string;
    @ApiProperty({
        description: 'Error message',
        example: 'email is invalid',
    })
    message: string;
}
