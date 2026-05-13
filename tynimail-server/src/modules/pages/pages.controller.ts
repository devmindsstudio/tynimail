import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, NotFoundException, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success } from "@/responses";
import { PagesService } from "./pages.service";
import { CreatePageDto, UpdatePageDto, CopyPagesDto, DeletePagesDto, UpdatePageTemplateBodyDto } from "@/dto/request/pages";
import { CreatePageSuccessDto, CreatePageValidationErrorDto, CreatePageBadRequestDto, UpdatePageSuccessDto, UpdatePageValidationErrorDto, UpdatePageNotFoundDto, GetPagesSuccessDto, GetPageSuccessDto, GetPageAnalyticsSuccessDto } from "@/dto/response/pages";
import { PageTemplatesService } from "./page-templates.service";
import { PageAnalyticsService } from "./page-analytics.service";

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
    constructor(
        private readonly pagesService: PagesService,
        private readonly pageTemplatesService: PageTemplatesService,
        private readonly pageAnalyticsService: PageAnalyticsService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all pages',
        description: 'Retrieve all pages for the authenticated user'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search pages by name'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Pages retrieved successfully',
        type: GetPagesSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getPages(
        @CurrentUser('sub') userId: string,
        @Query('search') search?: string
    ) {
        const pages = await this.pagesService.getPagesByUserId(userId, search);
        return success('Pages retrieved successfully', { pages });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get page by ID',
        description: 'Retrieve a specific page by ID for the authenticated user'
    })
    @ApiParam({
        name: 'id',
        description: 'Page ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page retrieved successfully',
        type: GetPageSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Page not found'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getPage(
        @CurrentUser('sub') userId: string,
        @Param('id') pageId: string
    ) {
        const page = await this.pagesService.getPageById(pageId, userId);

        if (!page) {
            throw new NotFoundException('Page not found or you do not have permission to view it');
        }

        return success('Page retrieved successfully', { page });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new page',
        description: 'Create a new page for the authenticated user'
    })
    @ApiBody({ type: CreatePageDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Page created successfully',
        type: CreatePageSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Invalid template or validation error',
        type: CreatePageBadRequestDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async createPage(
        @CurrentUser('sub') userId: string,
        @Body() createPageDto: CreatePageDto
    ) {
        if (createPageDto.templateId) {
            const isValidTemplate = await this.pageTemplatesService.verifyTemplateAccess(createPageDto.templateId, userId);

            if (!isValidTemplate) {
                throw new BadRequestException('Invalid template. The specified template does not exist.');
            }
        }

        const page = await this.pagesService.createPage({
            userId,
            name: createPageDto.name,
            templateId: createPageDto.templateId,
            content: createPageDto.content ?? '',
        });

        return success('Page created successfully', { page });
    }

    @Post('copy')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Copy pages',
        description: 'Create copies of pages by IDs (same name and content, new slug, draft status)'
    })
    @ApiBody({ type: CopyPagesDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Pages copied successfully'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async copyPages(
        @CurrentUser('sub') userId: string,
        @Body() dto: CopyPagesDto
    ) {
        const pages = await this.pagesService.copyPages(userId, dto.pageIds);
        return success('Pages copied successfully', { pages });
    }

    @Post('delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Soft delete pages',
        description: 'Soft delete multiple pages by IDs'
    })
    @ApiBody({ type: DeletePagesDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Pages deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deletePages(
        @CurrentUser('sub') userId: string,
        @Body() dto: DeletePagesDto
    ) {
        const deletedCount = await this.pagesService.deletePages(userId, dto.pageIds);
        return success('Pages deleted successfully', { deletedCount });
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update a page',
        description: 'Update an existing page (only user-owned pages can be updated)'
    })
    @ApiParam({
        name: 'id',
        description: 'Page ID',
        type: String
    })
    @ApiBody({ type: UpdatePageDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page updated successfully',
        type: UpdatePageSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error',
        type: UpdatePageValidationErrorDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Page not found or does not belong to user',
        type: UpdatePageNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async updatePage(
        @CurrentUser('sub') userId: string,
        @Param('id') pageId: string,
        @Body() updatePageDto: UpdatePageDto
    ) {
        const isValidPage = await this.pagesService.verifyPageOwnership(pageId, userId);

        if (!isValidPage) {
            throw new NotFoundException('Page not found or you do not have permission to update it');
        }

        const page = await this.pagesService.updatePage(pageId, userId, {
            name: updatePageDto.name,
            content: updatePageDto.content,
            status: updatePageDto.status,
        });

        if (!page) {
            throw new NotFoundException('Page not found');
        }

        return success('Page updated successfully', { page });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete a page',
        description: 'Soft delete a page (only user-owned pages can be deleted)'
    })
    @ApiParam({
        name: 'id',
        description: 'Page ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Page not found or does not belong to user'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deletePage(
        @CurrentUser('sub') userId: string,
        @Param('id') pageId: string
    ) {
        const isValidPage = await this.pagesService.verifyPageOwnership(pageId, userId);

        if (!isValidPage) {
            throw new NotFoundException('Page not found or you do not have permission to delete it');
        }

        const deleted = await this.pagesService.deletePage(pageId, userId);

        if (!deleted) {
            throw new NotFoundException('Page not found');
        }

        return success('Page deleted successfully', {});
    }

    @Post(':id/publish')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Publish a page',
        description: 'Publish a page to make it publicly accessible'
    })
    @ApiParam({
        name: 'id',
        description: 'Page ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page published successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Page not found or does not belong to user'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async publishPage(
        @CurrentUser('sub') userId: string,
        @Param('id') pageId: string
    ) {
        const isValidPage = await this.pagesService.verifyPageOwnership(pageId, userId);

        if (!isValidPage) {
            throw new NotFoundException('Page not found or you do not have permission to publish it');
        }

        const page = await this.pagesService.publishPage(pageId, userId);

        if (!page) {
            throw new NotFoundException('Page not found');
        }

        return success('Page published successfully', { page });
    }

    @Post(':id/unpublish')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Unpublish a page',
        description: 'Unpublish a page to make it private'
    })
    @ApiParam({
        name: 'id',
        description: 'Page ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page unpublished successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Page not found or does not belong to user'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async unpublishPage(
        @CurrentUser('sub') userId: string,
        @Param('id') pageId: string
    ) {
        const isValidPage = await this.pagesService.verifyPageOwnership(pageId, userId);

        if (!isValidPage) {
            throw new NotFoundException('Page not found or you do not have permission to unpublish it');
        }

        const page = await this.pagesService.unpublishPage(pageId, userId);

        if (!page) {
            throw new NotFoundException('Page not found');
        }

        return success('Page unpublished successfully', { page });
    }

    @Put(':id/template')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update page template',
        description: 'If page has no template: create one. If system template: create user copy. If user template: update in place.'
    })
    @ApiParam({ name: 'id', description: 'Page ID', type: String })
    @ApiBody({ type: UpdatePageTemplateBodyDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Template updated' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Page not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async updatePageTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') pageId: string,
        @Body() dto: UpdatePageTemplateBodyDto
    ) {
        const result = await this.pagesService.updatePageTemplate(pageId, userId, {
            name: dto.name,
            content: dto.content,
        });

        if (!result) {
            throw new NotFoundException('Page not found or you do not have permission');
        }

        return success('Template updated successfully', { page: result.page, template: result.template });
    }

    @Get(':id/analytics')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get page analytics',
        description: 'Get analytics data for a specific page'
    })
    @ApiParam({
        name: 'id',
        description: 'Page ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Page analytics retrieved successfully',
        type: GetPageAnalyticsSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Page not found or does not belong to user'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getPageAnalytics(
        @CurrentUser('sub') userId: string,
        @Param('id') pageId: string
    ) {
        const isValidPage = await this.pagesService.verifyPageOwnership(pageId, userId);

        if (!isValidPage) {
            throw new NotFoundException('Page not found or you do not have permission to view analytics');
        }

        const analytics = await this.pageAnalyticsService.getPageAnalytics(pageId, userId);

        if (!analytics) {
            throw new NotFoundException('Page not found');
        }

        return success('Page analytics retrieved successfully', { analytics });
    }
}
