import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus, UseGuards, NotFoundException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success } from "@/responses";
import { PageTemplatesService } from "./page-templates.service";
import { UpdatePageTemplateDto, CreatePageTemplateDto } from "@/dto/request/pages";

@ApiTags('Page Templates')
@Controller('page-templates')
export class PageTemplatesController {
    constructor(private readonly pageTemplatesService: PageTemplatesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all page templates',
        description: 'Retrieve all available page templates (system and user templates)'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Templates retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getTemplates(@CurrentUser('sub') userId: string) {
        const templates = await this.pageTemplatesService.getTemplates(userId);
        return success('Templates retrieved successfully', { templates });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Save as template',
        description: 'Create a user template from content (e.g. when creating page from scratch and saving as template)'
    })
    @ApiBody({ type: CreatePageTemplateDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Template created successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async createTemplate(
        @CurrentUser('sub') userId: string,
        @Body() dto: CreatePageTemplateDto
    ) {
        const template = await this.pageTemplatesService.createTemplate({
            userId,
            name: dto.name,
            content: dto.content,
        });
        return success('Template created successfully', { template });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get template by ID',
        description: 'Retrieve a specific page template by ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Template ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Template retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Template not found'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') templateId: string
    ) {
        const template = await this.pageTemplatesService.getTemplateById(templateId, userId);

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        return success('Template retrieved successfully', { template });
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update page template',
        description: 'If template is system, creates a user copy. If user\'s, updates in place.'
    })
    @ApiParam({ name: 'id', description: 'Template ID', type: String })
    @ApiBody({ type: UpdatePageTemplateDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Template updated or created successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Template not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async updateTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') templateId: string,
        @Body() dto: UpdatePageTemplateDto
    ) {
        const template = await this.pageTemplatesService.updateTemplate(templateId, userId, {
            name: dto.name,
            content: dto.content,
            category: dto.category,
            previewImageUrl: dto.previewImageUrl,
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        return success('Template updated successfully', { template });
    }
}
