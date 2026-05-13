import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { success } from '@/responses';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the service is running',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backend service is healthy',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Service is healthy' },
        timestamp: { type: 'string', example: '2025-11-14T10:00:00.000Z' },
        uptime: { type: 'number', example: 123456 },
      },
    },
  })
  healthCheck() {
    return success('Docker service is healthy', {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
