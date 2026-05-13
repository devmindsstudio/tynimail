import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success } from "@/responses";
import { TemplateService } from "./template.service";
import { CreateTemplateDto } from "@/dto/request/template";
import { CreateTemplateSuccessDto, CreateTemplateValidationErrorDto, GetTemplatesSuccessDto, GetTemplateSuccessDto, UpdateTemplateSuccessDto, UpdateTemplateValidationErrorDto, UpdateTemplateNotFoundDto, DeleteTemplateSuccessDto, DeleteTemplateNotFoundDto } from "@/dto/response/template";

@ApiTags('Templates')
@Controller('templates')
export class TemplateController {
    constructor(private readonly templateService: TemplateService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all templates',
        description: 'Retrieve all templates (System and User templates) for the authenticated user'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Templates retrieved successfully',
        type: GetTemplatesSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getTemplates(@CurrentUser('sub') userId: string) {
        const templates = await this.templateService.getTemplatesByUserId(userId);
        return success('Templates retrieved successfully', { templates });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get template by ID',
        description: 'Retrieve a specific template by ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Template ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Template retrieved successfully',
        type: GetTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Template not found',
        type: DeleteTemplateNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getTemplate(@CurrentUser('sub') userId: string, @Param('id') templateId: string) {
        const template = await this.templateService.getTemplateById(templateId, userId);
        
        if (!template) {
            throw new NotFoundException('Template not found');
        }

        return success('Template retrieved successfully', { template });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new template',
        description: 'Create a new email template for the authenticated user'
    })
    @ApiBody({ type: CreateTemplateDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Template created successfully',
        type: CreateTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error',
        type: CreateTemplateValidationErrorDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async createTemplate(
        @CurrentUser('sub') userId: string,
        @Body() createTemplateDto: CreateTemplateDto
    ) {
        const template = await this.templateService.createTemplate({
            userId,
            content: createTemplateDto.content,
        });

        return success('Template created successfully', template);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update a template',
        description: 'Update an existing template (only user-owned templates can be updated)'
    })
    @ApiParam({
        name: 'id',
        description: 'Template ID',
        type: String
    })
    @ApiBody({ type: CreateTemplateDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Template updated successfully',
        type: UpdateTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error',
        type: UpdateTemplateValidationErrorDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Template not found or does not belong to user',
        type: UpdateTemplateNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async updateTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') templateId: string,
        @Body() updateTemplateDto: CreateTemplateDto
    ) {
        const isSystemTemplate = await this.templateService.isSystemTemplate(templateId);

        if (isSystemTemplate) {
            throw new ForbiddenException('System templates cannot be updated');
        }

        const isValidTemplate = await this.templateService.verifyTemplateOwnership(templateId, userId);

        if (!isValidTemplate) {
            throw new NotFoundException('Template not found or you do not have permission to update it');
        }

        const template = await this.templateService.updateTemplate(templateId, userId, {
            content: updateTemplateDto.content,
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        return success('Template updated successfully', template);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete a template',
        description: 'Soft delete a template (only user-owned templates can be deleted)'
    })
    @ApiParam({
        name: 'id',
        description: 'Template ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Template deleted successfully',
        type: DeleteTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Template not found or does not belong to user',
        type: DeleteTemplateNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deleteTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') templateId: string
    ) {
        const isSystemTemplate = await this.templateService.isSystemTemplate(templateId);

        if (isSystemTemplate) {
            throw new ForbiddenException('System templates cannot be deleted');
        }

        const isValidTemplate = await this.templateService.verifyTemplateOwnership(templateId, userId);

        if (!isValidTemplate) {
            throw new NotFoundException('Template not found or you do not have permission to delete it');
        }

        const deleted = await this.templateService.deleteTemplate(templateId, userId);

        if (!deleted) {
            throw new NotFoundException('Template not found');
        }

        return success('Template deleted successfully', {});
    }
}

