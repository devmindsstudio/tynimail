import { ApiProperty } from '@nestjs/swagger';

export class UploadCsvDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'CSV file containing subscribers'
    })
    csv: any;
}
