import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateSegmentDto {
    @ApiProperty({
        description: 'Segment name',
        example: 'Updated Subscribers',
        required: false,
    })
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Segment color',
        example: '#FF5733',
        required: false,
    })
    @IsString({ message: 'Color must be a string' })
    @IsOptional()
    color?: string;
}
