import { Controller, Get, Post, Body, Param, Req, HttpCode, HttpStatus, NotFoundException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";
import type { Request } from "express";
import { success } from "@/responses";
import { PagesService } from "./pages.service";
import { PageAnalyticsService } from "./page-analytics.service";
import { DEVICE_TYPE } from "@/constants";

@ApiTags('Public Pages')
@Controller('public/pages')
export class PublicPagesController {
    constructor(
        private readonly pagesService: PagesService,
        private readonly pageAnalyticsService: PageAnalyticsService
    ) { }

    @Get('by-id/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get public page by id',
        description: 'Retrieve a published page by id (public access)'
    })
    @ApiParam({ name: 'id', description: 'Page id', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Page retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Page not found' })
    async getPublicPageById(
        @Param('id') id: string,
        @Req() req: Request
    ) {
        const page = await this.pagesService.getPublicPageById(id);
        if (!page) {
            throw new NotFoundException('Page not found');
        }
        const deviceType = this.detectDeviceType(req.headers['user-agent'] || '');
        await this.pageAnalyticsService.trackPageView(page.id, {
            fingerprint: this.generateFingerprint(req),
            deviceType: deviceType,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || null,
        });
        return success('Page retrieved successfully', { page });
    }

    @Get(':slug')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get public page by slug',
        description: 'Retrieve a published page by slug (public access)'
    })
    @ApiParam({
        name: 'slug',
        description: 'Page slug',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Page not found'
    })
    async getPublicPage(
        @Param('slug') slug: string,
        @Req() req: Request
    ) {
        const page = await this.pagesService.getPageBySlug(slug);

        if (!page) {
            throw new NotFoundException('Page not found');
        }

        const deviceType = this.detectDeviceType(req.headers['user-agent'] || '');

        await this.pageAnalyticsService.trackPageView(page.id, {
            fingerprint: this.generateFingerprint(req),
            deviceType: deviceType,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || null,
        });

        return success('Page retrieved successfully', { page });
    }

    @Post(':slug/track')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Track page view',
        description: 'Track a page view for analytics'
    })
    @ApiParam({
        name: 'slug',
        description: 'Page slug',
        type: String
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fingerprint: { type: 'string' },
                deviceType: { type: 'number' },
                sessionDuration: { type: 'number' }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page view tracked successfully'
    })
    async trackPageView(
        @Param('slug') slug: string,
        @Body() body: { fingerprint?: string; deviceType?: number; sessionDuration?: number },
        @Req() req: Request
    ) {
        const page = await this.pagesService.getPageBySlug(slug);

        if (!page) {
            throw new NotFoundException('Page not found');
        }

        const deviceType = body.deviceType || this.detectDeviceType(req.headers['user-agent'] || '');

        await this.pageAnalyticsService.trackPageView(page.id, {
            fingerprint: body.fingerprint || this.generateFingerprint(req),
            deviceType: deviceType,
            sessionDuration: body.sessionDuration || null,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || null,
        });

        return success('Page view tracked successfully', {});
    }

    private detectDeviceType(userAgent: string): number {
        const ua = userAgent.toLowerCase();
        if (/tablet|ipad|playbook|silk/i.test(ua)) {
            return DEVICE_TYPE.TABLET;
        }
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
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
        return Buffer.from(components.join('|')).toString('base64').substring(0, 64);
    }
}
