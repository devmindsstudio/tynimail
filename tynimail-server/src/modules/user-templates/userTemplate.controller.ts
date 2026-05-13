import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, NotFoundException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success } from "@/responses";
import { CreateUserTemplateDto, UpdateUserTemplateDto } from "@/dto/request/user-templates";
import { CreateUserTemplateSuccessDto, CreateUserTemplateValidationErrorDto, GetUserTemplatesSuccessDto, GetUserTemplateSuccessDto, UpdateUserTemplateSuccessDto, UpdateUserTemplateValidationErrorDto, UpdateUserTemplateNotFoundDto, DeleteUserTemplateSuccessDto, DeleteUserTemplateNotFoundDto } from "@/dto/response/user-templates";
import { UserTemplateService } from "./userTemplate.service";

@ApiTags('User Templates')
@Controller('user-templates')
export class UserTemplateController {
    constructor(private readonly userTemplateService: UserTemplateService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all user templates',
        description: 'Retrieve all user templates for the authenticated user'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User templates retrieved successfully',
        type: GetUserTemplatesSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getUserTemplates(@CurrentUser('sub') userId: string) {
        const userTemplates = await this.userTemplateService.getUserTemplatesByUserId(userId);
        return success('User templates retrieved successfully', { userTemplates });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get user template by ID',
        description: 'Retrieve a specific user template by ID (must belong to the authenticated user)'
    })
    @ApiParam({
        name: 'id',
        description: 'User template ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User template retrieved successfully',
        type: GetUserTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User template not found',
        type: DeleteUserTemplateNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getUserTemplate(@CurrentUser('sub') userId: string, @Param('id') userTemplateId: string) {
        const userTemplate = await this.userTemplateService.getUserTemplateById(userTemplateId, userId);

        if (!userTemplate) {
            throw new NotFoundException('User template not found');
        }

        return success('User template retrieved successfully', { userTemplate });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new user template',
        description: 'Create a new user template for the authenticated user'
    })
    @ApiBody({ type: CreateUserTemplateDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User template created successfully',
        type: CreateUserTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error',
        type: CreateUserTemplateValidationErrorDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async createUserTemplate(
        @CurrentUser('sub') userId: string,
        @Body() createUserTemplateDto: CreateUserTemplateDto
    ) {
        const userTemplate = await this.userTemplateService.createUserTemplate({
            userId,
            templateId: createUserTemplateDto.template_id,
            content: createUserTemplateDto.content,
            status: createUserTemplateDto.status,
        });

        return success('User template created successfully', userTemplate);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update a user template',
        description: 'Update an existing user template (must belong to the authenticated user)'
    })
    @ApiParam({
        name: 'id',
        description: 'User template ID',
        type: String
    })
    @ApiBody({ type: UpdateUserTemplateDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User template updated successfully',
        type: UpdateUserTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error',
        type: UpdateUserTemplateValidationErrorDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User template not found or does not belong to user',
        type: UpdateUserTemplateNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async updateUserTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') userTemplateId: string,
        @Body() updateUserTemplateDto: UpdateUserTemplateDto
    ) {
        const userTemplate = await this.userTemplateService.updateUserTemplate(userTemplateId, userId, {
            templateId: updateUserTemplateDto.template_id,
            content: updateUserTemplateDto.content,
            status: updateUserTemplateDto.status,
        });

        if (!userTemplate) {
            throw new NotFoundException('User template not found or you do not have permission to update it');
        }

        return success('User template updated successfully', userTemplate);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete a user template',
        description: 'Soft delete a user template (must belong to the authenticated user)'
    })
    @ApiParam({
        name: 'id',
        description: 'User template ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User template deleted successfully',
        type: DeleteUserTemplateSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User template not found or does not belong to user',
        type: DeleteUserTemplateNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deleteUserTemplate(
        @CurrentUser('sub') userId: string,
        @Param('id') userTemplateId: string
    ) {
        const deleted = await this.userTemplateService.deleteUserTemplate(userTemplateId, userId);

        if (!deleted) {
            throw new NotFoundException('User template not found or you do not have permission to delete it');
        }

        return success('User template deleted successfully', {});
    }
}


