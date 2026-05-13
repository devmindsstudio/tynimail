import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetDnsRecordsDto {
    @ApiProperty({ description: 'Domain name', example: 'example.com' })
    @IsString()
    @IsNotEmpty()
    @Matches(
        /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
        { message: 'Please provide a valid domain name' }
    )
    domain: string;
}
