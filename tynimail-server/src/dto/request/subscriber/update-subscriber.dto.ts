import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateSubscriberDto {
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
        description: 'Subscriber email address',
        example: 'subscriber@example.com',
        required: false,
    })
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'Notes about the subscriber',
        example: 'VIP customer',
        required: false,
    })
    @IsString({ message: 'Notes must be a string' })
    @IsOptional()
    notes?: string;

    @ApiProperty({
        description: 'Custom contact attributes as key-value pairs',
        example: { plan: 'pro', city: 'London' },
        required: false,
    })
    @IsObject({ message: 'Attributes must be an object' })
    @IsOptional()
    attributes?: Record<string, string>;

    @ValidateIf((o) => !o.first_name && !o.last_name && !o.email && !o.notes && !o.attributes)
    @IsString({ message: 'At least one field (first_name, last_name, email, notes, or attributes) is required' })
    atLeastOneField?: string;
}
