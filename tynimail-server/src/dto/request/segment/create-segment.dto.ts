import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSegmentDto {
    @ApiProperty({
        description: 'Segment name',
        example: 'New Subscribers',
    })
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @ApiProperty({
        description: 'Segment color',
        example: '#FF5733',
        required: false,
    })
    @IsString({ message: 'Color must be a string' })
    @IsOptional()
    color?: string;
}
