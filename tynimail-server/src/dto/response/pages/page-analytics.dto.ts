import { ApiProperty } from '@nestjs/swagger';

export class GetPageAnalyticsSuccessDto {
  @ApiProperty({
    description: 'Indicates if the analytics were retrieved successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Page analytics retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Analytics data',
    example: {
      pageName: 'My Landing Page',
      totalViews: 17,
      uniqueVisitors: 12,
      sessionDuration: 23,
      viewsByDevice: {
        desktop: 8,
        tablet: 2,
        mobile: 7,
      },
      visitorTrends: [
        { name: 'Mon', uv: 0 },
        { name: 'Tue', uv: 0 },
        { name: 'Wed', uv: 5 },
        { name: 'Thu', uv: 8 },
        { name: 'Fri', uv: 4 },
        { name: 'Sat', uv: 0 },
        { name: 'Sun', uv: 0 },
      ],
    },
  })
  data: object;
}
