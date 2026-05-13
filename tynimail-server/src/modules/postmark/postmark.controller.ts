import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@/guards';
import { success, error } from '@/responses';
import { PostmarkService } from './postmark.service';

@ApiTags('Postmark')
@Controller('postmark')
export class PostmarkController {
  constructor(private readonly postmarkService: PostmarkService) {}

  @Get('verified-senders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get verified senders',
    description: 'Retrieve all verified sender email addresses from Postmark',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: 'Number of results to return (default: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of results to skip (default: 0)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verified senders retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getVerifiedSenders(
    @Query('count') count?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const senders = await this.postmarkService.getVerifiedSenders(
        count,
        offset,
      );
      return success('Verified senders retrieved successfully', senders);
    } catch (err) {
      console.log(err);
      return error('Failed to retrieve verified senders', err.message);
    }
  }

  @Get('verified-domains')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get verified domains',
    description: 'Retrieve all verified domains from Postmark',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: 'Number of results to return (default: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of results to skip (default: 0)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verified domains retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getVerifiedDomains(
    @Query('count') count?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const domains = await this.postmarkService.getVerifiedDomains(
        count,
        offset,
      );
      return success('Verified domains retrieved successfully', domains);
    } catch (err) {
      return error('Failed to retrieve verified domains', err.message);
    }
  }

  @Post('verify-sender')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify sender email',
    description: 'Add and verify a sender email address in Postmark',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'sender@example.com' },
        name: { type: 'string', example: 'John Doe' },
      },
      required: ['email', 'name'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sender verification initiated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid email or validation error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async verifySenderEmail(
    @Body('email') email: string,
    @Body('name') name: string,
  ) {
    try {
      const result =
        await this.postmarkService.getVerifiedSenderBySignatureId(email);
      return success('Sender verification initiated successfully', result);
    } catch (err) {
      console.log(err);
      return error('Failed to verify sender email', err.message);
    }
  }
}
