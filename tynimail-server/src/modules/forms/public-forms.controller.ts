import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { success } from '@/responses';
import { FormsService } from './forms.service';
import { FormAnalyticsService } from './form-analytics.service';
import { SubmitFormDto } from '@/dto/request/forms';
import { DEVICE_TYPE } from '@/constants';

@ApiTags('Public Forms')
@Controller('public/forms')
export class PublicFormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly formAnalyticsService: FormAnalyticsService,
  ) {}

  @Get('by-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public form by id',
    description: 'Retrieve a live form by id (public access)',
  })
  @ApiParam({ name: 'id', description: 'Form id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found',
  })
  async getPublicFormById(@Param('id') id: string, @Req() req: Request) {
    const form = await this.formsService.getPublicFormById(id);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    const deviceType = this.detectDeviceType(req.headers['user-agent'] || '');
    await this.formAnalyticsService.trackFormView(form.id, {
      fingerprint: this.generateFingerprint(req),
      deviceType: deviceType,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] || null,
    });
    return success('Form retrieved successfully', { form });
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public form by slug',
    description: 'Retrieve a live form by slug (public access)',
  })
  @ApiParam({
    name: 'slug',
    description: 'Form slug',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found',
  })
  async getPublicForm(@Param('slug') slug: string, @Req() req: Request) {
    const form = await this.formsService.getFormBySlug(slug);

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const deviceType = this.detectDeviceType(req.headers['user-agent'] || '');

    await this.formAnalyticsService.trackFormView(form.id, {
      fingerprint: this.generateFingerprint(req),
      deviceType: deviceType,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] || null,
    });

    return success('Form retrieved successfully', { form });
  }

  @Post('by-id/:id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit form response by id',
    description: 'Submit a response to a live form by form id',
  })
  @ApiParam({ name: 'id', description: 'Form id', type: String })
  @ApiBody({ type: SubmitFormDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form response submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found',
  })
  async submitFormById(
    @Param('id') id: string,
    @Body() dto: SubmitFormDto,
    @Req() req: Request,
  ) {
    const form = await this.formsService.getPublicFormById(id);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    const response = await this.formAnalyticsService.submitFormResponse(
      form.id,
      {
        content: dto.content,
        fingerprint: this.generateFingerprint(req),
      },
    );
    return success('Form response submitted successfully', { response });
  }

  @Post(':slug/track')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track form view',
    description:
      'Record a form view for analytics (e.g. when form is embedded or loaded from another URL)',
  })
  @ApiParam({
    name: 'slug',
    description: 'Form slug',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fingerprint: { type: 'string' },
        deviceType: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form view tracked successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found',
  })
  async trackFormView(
    @Param('slug') slug: string,
    @Body() body: { fingerprint?: string; deviceType?: number },
    @Req() req: Request,
  ) {
    const form = await this.formsService.getFormBySlug(slug);

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const deviceType =
      body.deviceType ?? this.detectDeviceType(req.headers['user-agent'] || '');

    await this.formAnalyticsService.trackFormView(form.id, {
      fingerprint: body.fingerprint ?? this.generateFingerprint(req),
      deviceType: deviceType,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] || null,
    });

    return success('Form view tracked successfully', {});
  }

  @Post(':slug/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit form response',
    description: 'Submit a response to a live form',
  })
  @ApiParam({
    name: 'slug',
    description: 'Form slug',
    type: String,
  })
  @ApiBody({ type: SubmitFormDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form response submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found',
  })
  async submitForm(
    @Param('slug') slug: string,
    @Body() dto: SubmitFormDto,
    @Req() req: Request,
  ) {
    const form = await this.formsService.getFormBySlug(slug);

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const response = await this.formAnalyticsService.submitFormResponse(
      form.id,
      {
        content: dto.content,
        fingerprint: this.generateFingerprint(req),
      },
    );

    return success('Form response submitted successfully', { response });
  }

  private detectDeviceType(userAgent: string): number {
    const ua = userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return DEVICE_TYPE.TABLET;
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        ua,
      )
    ) {
      return DEVICE_TYPE.MOBILE;
    }
    return DEVICE_TYPE.DESKTOP;
  }

  private generateFingerprint(req: Request): string {
    const components = [
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      req.ip || req.headers['x-forwarded-for'] || '',
    ];
    return Buffer.from(components.join('|'))
      .toString('base64')
      .substring(0, 64);
  }
}
