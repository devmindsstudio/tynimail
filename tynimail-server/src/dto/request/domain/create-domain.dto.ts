import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateDomainDto {
    @ApiProperty({
        description: 'Valid domain name',
        example: 'example.com',
    })
    @IsString({ message: 'Domain must be a string' })
    @IsNotEmpty({ message: 'Domain is required' })
    @Matches(
        /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
        { message: 'Please provide a valid domain name' }
    )
    domain: string;
}
