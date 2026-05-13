import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetSegmentSubscribersDto {
    @ApiProperty({
        description: 'Filter subscribers by status (1 = valid, 0 = invalid)',
        example: 1,
        required: false,
        enum: [0, 1],
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === '1' ? 1 : value === 'false' || value === '0' ? 0 : value)
    @IsIn([0, 1], { message: 'Status must be either 0 or 1' })
    status?: number;

    @ApiProperty({
        description: 'Filter subscribers where the specified columns are NULL or empty (comma-separated)',
        example: 'first_name,last_name',
        required: false,
    })
    @IsString({ message: 'Data field must be a string' })
    @IsOptional()
    dataField?: string;
}
