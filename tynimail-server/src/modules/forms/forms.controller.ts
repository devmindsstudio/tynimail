import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@/guards';
import { CurrentUser } from '@/decorators';
import { success } from '@/responses';
import { FormsService } from './forms.service';
import {
  CreateFormDto,
  UpdateFormDto,
  CopyFormsDto,
  DeleteFormsDto,
} from '@/dto/request/forms';
import {
  CreateFormSuccessDto,
  CreateFormValidationErrorDto,
  GetFormsSuccessDto,
  GetFormSuccessDto,
  GetFormAnalyticsSuccessDto,
} from '@/dto/response/forms';
import { FormAnalyticsService } from './form-analytics.service';

@ApiTags('Forms')
@Controller('forms')
export class FormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly formAnalyticsService: FormAnalyticsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all forms',
    description:
      'Retrieve all forms for the authenticated user with response counts',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search forms by name',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Forms retrieved successfully',
    type: GetFormsSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getForms(
    @CurrentUser('sub') userId: string,
    @Query('search') search?: string,
  ) {
    const forms = await this.formsService.getFormsByUserId(userId, search);
    return success('Forms retrieved successfully', { forms });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get form by ID',
    description: 'Retrieve a specific form by ID for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form retrieved successfully',
    type: GetFormSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getForm(
    @CurrentUser('sub') userId: string,
    @Param('id') formId: string,
  ) {
    const form = await this.formsService.getFormById(formId, userId);

    if (!form) {
      throw new NotFoundException(
        'Form not found or you do not have permission to view it',
      );
    }

    return success('Form retrieved successfully', { form });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new form',
    description: 'Create a new form for the authenticated user',
  })
  @ApiBody({ type: CreateFormDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Form created successfully',
    type: CreateFormSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Validation error',
    type: CreateFormValidationErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async createForm(
    @CurrentUser('sub') userId: string,
    @Body() createFormDto: CreateFormDto,
  ) {
    const form = await this.formsService.createForm({
      userId,
      name: createFormDto.name,
      content: createFormDto.content ?? '',
    });

    return success('Form created successfully', { form });
  }

  @Post('copy')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Copy forms',
    description:
      'Create copies of forms by IDs (same name and content, new slug, live status)',
  })
  @ApiBody({ type: CopyFormsDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Forms copied successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async copyForms(
    @CurrentUser('sub') userId: string,
    @Body() dto: CopyFormsDto,
  ) {
    const forms = await this.formsService.copyForms(userId, dto.formIds);
    return success('Forms copied successfully', { forms });
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft delete forms',
    description: 'Soft delete multiple forms by IDs',
  })
  @ApiBody({ type: DeleteFormsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Forms deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteForms(
    @CurrentUser('sub') userId: string,
    @Body() dto: DeleteFormsDto,
  ) {
    const deletedCount = await this.formsService.deleteForms(
      userId,
      dto.formIds,
    );
    return success('Forms deleted successfully', { deletedCount });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a form',
    description:
      'Update an existing form (only user-owned forms can be updated)',
  })
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: String,
  })
  @ApiBody({ type: UpdateFormDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found or does not belong to user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateForm(
    @CurrentUser('sub') userId: string,
    @Param('id') formId: string,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    const isValidForm = await this.formsService.verifyFormOwnership(
      formId,
      userId,
    );

    if (!isValidForm) {
      throw new NotFoundException(
        'Form not found or you do not have permission to update it',
      );
    }

    const form = await this.formsService.updateForm(formId, userId, {
      name: updateFormDto.name,
      content: updateFormDto.content,
      status: updateFormDto.status,
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return success('Form updated successfully', { form });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a form',
    description: 'Soft delete a form (only user-owned forms can be deleted)',
  })
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found or does not belong to user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteForm(
    @CurrentUser('sub') userId: string,
    @Param('id') formId: string,
  ) {
    const isValidForm = await this.formsService.verifyFormOwnership(
      formId,
      userId,
    );

    if (!isValidForm) {
      throw new NotFoundException(
        'Form not found or you do not have permission to delete it',
      );
    }

    const deleted = await this.formsService.deleteForm(formId, userId);

    if (!deleted) {
      throw new NotFoundException('Form not found');
    }

    return success('Form deleted successfully', {});
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish a form',
    description: 'Publish a form to make it live and publicly accessible',
  })
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form published successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found or does not belong to user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async publishForm(
    @CurrentUser('sub') userId: string,
    @Param('id') formId: string,
  ) {
    const isValidForm = await this.formsService.verifyFormOwnership(
      formId,
      userId,
    );

    if (!isValidForm) {
      throw new NotFoundException(
        'Form not found or you do not have permission to publish it',
      );
    }

    const form = await this.formsService.publishForm(formId, userId);

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return success('Form published successfully', { form });
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unpublish a form',
    description: 'Unpublish a form to make it draft',
  })
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form unpublished successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found or does not belong to user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async unpublishForm(
    @CurrentUser('sub') userId: string,
    @Param('id') formId: string,
  ) {
    const isValidForm = await this.formsService.verifyFormOwnership(
      formId,
      userId,
    );

    if (!isValidForm) {
      throw new NotFoundException(
        'Form not found or you do not have permission to unpublish it',
      );
    }

    const form = await this.formsService.unpublishForm(formId, userId);

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return success('Form unpublished successfully', { form });
  }

  @Get(':id/analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get form analytics',
    description: 'Get analytics data for a specific form',
  })
  @ApiParam({
    name: 'id',
    description: 'Form ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form analytics retrieved successfully',
    type: GetFormAnalyticsSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Form not found or does not belong to user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getFormAnalytics(
    @CurrentUser('sub') userId: string,
    @Param('id') formId: string,
  ) {
    const isValidForm = await this.formsService.verifyFormOwnership(
      formId,
      userId,
    );

    if (!isValidForm) {
      throw new NotFoundException(
        'Form not found or you do not have permission to view analytics',
      );
    }

    const analytics = await this.formAnalyticsService.getFormAnalytics(
      formId,
      userId,
    );

    if (!analytics) {
      throw new NotFoundException('Form not found');
    }

    return success('Form analytics retrieved successfully', { analytics });
  }
}
