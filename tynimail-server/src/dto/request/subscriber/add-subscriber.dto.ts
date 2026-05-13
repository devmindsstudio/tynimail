import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export class AddSubscriberDto {
    @ApiProperty({
        description: 'Subscriber email address',
        example: 'subscriber@example.com',
    })
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'Subscriber first name',
        example: 'John',
        required: false,
    })
    @IsString({ message: 'First name must be a string' })
    @IsOptional()
    first_name?: string;

    @ApiProperty({
        description: 'Subscriber last name',
        example: 'Doe',
        required: false,
    })
    @IsString({ message: 'Last name must be a string' })
    @IsOptional()
    last_name?: string;

    @ApiProperty({
        description: 'Array of segment IDs to add the subscriber to',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        required: false,
        type: [String],
    })
    @IsArray({ message: 'Segments must be an array' })
    @IsUUID('4', { each: true, message: 'Each segment ID must be a valid UUID' })
    @IsOptional()
    segments?: string[];
}
