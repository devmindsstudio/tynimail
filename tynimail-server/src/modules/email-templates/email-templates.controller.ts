import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, NotFoundException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success } from "@/responses";
import { EmailTemplatesService } from "./email-templates.service";

@ApiTags('Email Templates')
@Controller('email-templates')
export class EmailTemplatesController {
    constructor(private readonly emailTemplatesService: EmailTemplatesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all email templates', description: 'Retrieve all email templates for the authenticated user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Email templates retrieved successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getEmailTemplates(@CurrentUser('sub') userId: string) {
        const emailTemplates = await this.emailTemplatesService.getEmailTemplatesByUserId(userId);
        return success('Email templates retrieved successfully', { emailTemplates });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get email template by ID' })
    @ApiParam({ name: 'id', type: String })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getEmailTemplate(@CurrentUser('sub') userId: string, @Param('id') templateId: string) {
        const emailTemplate = await this.emailTemplatesService.getEmailTemplateById(templateId, userId);
        if (!emailTemplate) throw new NotFoundException('Email template not found');
        return success('Email template retrieved successfully', { emailTemplate });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new email template' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async createEmailTemplate(
        @CurrentUser('sub') userId: string,
        @Body() body: {
            name: string;
            description?: string;
            subject: string;
            preheaderText?: string;
            htmlContent?: string;
            textContent?: string;
            variables?: object;
        }
    ) {
        const emailTemplate = await this.emailTemplatesService.createEmailTemplate({
            userId,
            name: body.name,
            description: body.description,
            subject: body.subject,
            preheaderText: body.preheaderText,
            htmlContent: body.htmlContent,
            textContent: body.textContent,
            variables: body.variables,
        });
        return success('Email template created successfully', { emailTemplate });
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update an email template' })
    @ApiParam({ name: 'id', type: String })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async updateEmailTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') templateId: string,
        @Body() body: {
            name?: string;
            description?: string;
            subject?: string;
            preheaderText?: string;
            htmlContent?: string;
            textContent?: string;
            variables?: object;
        }
    ) {
        const emailTemplate = await this.emailTemplatesService.updateEmailTemplate(templateId, userId, body);
        if (!emailTemplate) throw new NotFoundException('Email template not found');
        return success('Email template updated successfully', { emailTemplate });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete an email template' })
    @ApiParam({ name: 'id', type: String })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deleteEmailTemplate(@CurrentUser('sub') userId: string, @Param('id') templateId: string) {
        const deleted = await this.emailTemplatesService.deleteEmailTemplate(templateId, userId);
        if (!deleted) throw new NotFoundException('Email template not found');
        return success('Email template deleted successfully', {});
    }
}
