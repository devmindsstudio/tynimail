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
  BadRequestException,
  NotFoundException,
  HttpException,
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
import { CampaignService } from './campaign.service';
import { CampaignAudienceService } from './campaign-audience.service';
import { CampaignQueueProducer } from '@/modules/queues/producers/campaign-queue.producer';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  AddCampaignAudienceDto,
} from '@/dto/request/campaign';
import {
  CreateCampaignSuccessDto,
  CreateCampaignValidationErrorDto,
  CreateCampaignBadRequestDto,
  GetCampaignByIdSuccessDto,
  GetCampaignByIdNotFoundDto,
  UpdateCampaignSuccessDto,
  UpdateCampaignValidationErrorDto,
  UpdateCampaignNotFoundDto,
  UpdateCampaignBadRequestDto,
  DeleteCampaignSuccessDto,
  DeleteCampaignNotFoundDto,
  AddCampaignAudienceSuccessDto,
  AddCampaignAudienceNotFoundDto,
  AddCampaignAudienceBadRequestDto,
  GetCampaignAudiencesSuccessDto,
  GetCampaignAudienceCountSuccessDto,
  RemoveCampaignAudienceSuccessDto,
  RemoveCampaignAudienceNotFoundDto,
  RunCampaignSuccessDto,
  RunCampaignBadRequestDto,
  RunCampaignNotFoundDto,
  RunCampaignTooManyRequestsDto,
  GetCampaignSendsSuccessDto,
} from '@/dto/response/campaign';
import { CAMPAIGN_STATUS, CAMPAIGN_TYPE, AUDIENCE_TYPE } from '@/constants';
import {
  CreateCampaignScheduleBadRequestDto,
  CreateCampaignScheduleSuccessDto,
} from '@/dto/response/campaign/create-campaign-schedule.dto';
import { CreateCampaignScheduleDto } from '@/dto/request/campaign/create-campaign-schedule.dto';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly campaignAudienceService: CampaignAudienceService,
    private readonly campaignQueueProducer: CampaignQueueProducer,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all campaigns',
    description: 'Retrieve all campaigns for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaigns retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCampaigns(@CurrentUser('sub') userId: string) {
    const campaigns = await this.campaignService.getCampaignsByUserId(userId);
    return success('Campaigns retrieved successfully', { campaigns });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Retrieve a specific campaign by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaign retrieved successfully',
    type: GetCampaignByIdSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found or does not belong to user',
    type: GetCampaignByIdNotFoundDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCampaignById(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
  ) {
    const campaign = await this.campaignService.getCampaignById(
      campaignId,
      userId,
    );

    if (!campaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to view it',
      );
    }

    return success('Campaign retrieved successfully', campaign);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new campaign',
    description: 'Create a new email campaign for the authenticated user',
  })
  @ApiBody({ type: CreateCampaignDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Campaign created successfully',
    type: CreateCampaignSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid sender email or validation error',
    type: CreateCampaignBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async createCampaign(
    @CurrentUser('sub') userId: string,
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    const isValidSenderEmail =
      await this.campaignService.verifySenderEmailOwnership(
        createCampaignDto.senderEmailId,
        userId,
      );

    if (!isValidSenderEmail)
      throw new BadRequestException(
        'Invalid sender email. The specified sender email does not belong to you or does not exist.',
      );

    if (createCampaignDto.templateId) {
      const isValidUserTemplate =
        await this.campaignService.verifyUserTemplateOwnership(
          createCampaignDto.templateId,
          userId,
        );

      if (!isValidUserTemplate) {
        throw new BadRequestException(
          'Invalid template. The specified user template does not belong to you or does not exist.',
        );
      }
    }

    const campaign = await this.campaignService.createCampaign({
      userId,
      name: createCampaignDto.name,
      senderName: createCampaignDto.senderName,
      subject: createCampaignDto.subject,
      preheaderText: createCampaignDto.preheaderText,
      senderEmailId: createCampaignDto.senderEmailId,
      campaignStatus: CAMPAIGN_STATUS.PENDING,
      type: CAMPAIGN_TYPE.DRAFT,
      templateId: createCampaignDto.templateId ?? null,
    });

    return success('Campaign created successfully', campaign);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a campaign',
    description:
      'Update an existing email campaign (only user-owned campaigns can be updated)',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    type: String,
  })
  @ApiBody({ type: UpdateCampaignDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaign updated successfully',
    type: UpdateCampaignSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid sender email or validation error',
    type: UpdateCampaignBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found or does not belong to user',
    type: UpdateCampaignNotFoundDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateCampaign(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );

    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to update it',
      );
    }

    // Verify sender email ownership if senderEmailId is being updated
    if (updateCampaignDto.senderEmailId) {
      const isValidSenderEmail =
        await this.campaignService.verifySenderEmailOwnership(
          updateCampaignDto.senderEmailId,
          userId,
        );

      if (!isValidSenderEmail) {
        throw new BadRequestException(
          'Invalid sender email. The specified sender email does not belong to you or does not exist.',
        );
      }
    }

    const campaign = await this.campaignService.updateCampaign(
      campaignId,
      userId,
      {
        name: updateCampaignDto.name,
        senderName: updateCampaignDto.senderName,
        subject: updateCampaignDto.subject,
        preheaderText: updateCampaignDto.preheaderText,
        senderEmailId: updateCampaignDto.senderEmailId,
        type: updateCampaignDto.type,
        campaignStatus: updateCampaignDto.campaignStatus,
        templateId: updateCampaignDto.templateId,
      },
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return success('Campaign updated successfully', campaign);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a campaign',
    description:
      'Delete an existing email campaign (only user-owned campaigns can be deleted)',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaign deleted successfully',
    type: DeleteCampaignSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found or does not belong to user',
    type: DeleteCampaignNotFoundDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteCampaign(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
  ) {
    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );

    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to delete it',
      );
    }

    const deleted = await this.campaignService.deleteCampaign(
      campaignId,
      userId,
    );

    if (!deleted) {
      throw new NotFoundException('Campaign not found');
    }

    return success('Campaign deleted successfully', {
      campaignId,
      deletedAt: new Date().toISOString(),
    });
  }

  // ─── Run Endpoints ────────────────────────────────────────────────────────

  @Post(':id/run')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Run campaign',
    description:
      'Queue a campaign for immediate sending. Returns 202 immediately — emails are sent asynchronously.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Campaign queued successfully',
    type: RunCampaignSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
    type: RunCampaignBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found',
    type: RunCampaignNotFoundDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many campaigns running',
    type: RunCampaignTooManyRequestsDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async runCampaign(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
  ) {
    // 1. Campaign ownership
    const campaign = await this.campaignService.getCampaignById(
      campaignId,
      userId,
    );
    if (!campaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission',
      );
    }

    // 2. Must be PENDING
    if (campaign.campaign_status !== CAMPAIGN_STATUS.PENDING) {
      throw new BadRequestException('Campaign is already running or completed');
    }

    // 3. Must not be a draft
    if (campaign.type === CAMPAIGN_TYPE.DRAFT) {
      throw new BadRequestException(
        'Campaign must be set to Live before running',
      );
    }

    // 4. Template must be linked
    const hasTemplate =
      await this.campaignService.hasLinkedTemplate(campaignId);
    if (!hasTemplate) {
      throw new BadRequestException(
        'No valid template linked to this campaign',
      );
    }

    // 5. Sender email must be verified
    const hasSender =
      await this.campaignService.hasVerifiedSenderEmail(campaignId);
    if (!hasSender) {
      throw new BadRequestException('Sender email is not verified');
    }

    // 6. Must have at least one audience entry
    const audiences =
      await this.campaignAudienceService.getAudiencesByCampaignId(campaignId);
    if (audiences.length === 0) {
      throw new BadRequestException('No audience added to this campaign');
    }

    // 7. Audience must have eligible recipients
    const recipientCount =
      await this.campaignAudienceService.getUniqueRecipientCount(campaignId);
    if (recipientCount === 0) {
      throw new BadRequestException(
        'Campaign audience has no active subscribed recipients',
      );
    }

    // 8. Per-user concurrency limit
    const runningCount =
      await this.campaignService.getRunningCampaignCount(userId);
    if (runningCount >= 2) {
      throw new HttpException(
        {
          success: false,
          errorType: 'TOO-MANY-CAMPAIGNS',
          message:
            'You already have campaigns running. Please wait for them to complete.',
        },
        429,
      );
    }

    // Set IN_QUEUE and enqueue
    const updated = await this.campaignService.setInQueue(campaignId);
    await this.campaignQueueProducer.enqueue({ campaignId, userId });

    return success('Campaign queued successfully', { campaign: updated });
  }

  @Get(':id/sends')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get campaign send records',
    description:
      'Paginated list of per-contact delivery records for a campaign',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sends retrieved successfully',
    type: GetCampaignSendsSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found',
    type: RunCampaignNotFoundDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCampaignSends(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );
    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission',
      );
    }

    const { sends, total } = await this.campaignService.getCampaignSends(
      campaignId,
      Number(page),
      Number(limit),
    );

    return success('Campaign sends retrieved successfully', {
      sends,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  }

  // ─── Audience Endpoints ────────────────────────────────────────────────────

  @Get(':id/audiences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get campaign audiences',
    description:
      'Retrieve all segments and subscribers added to the campaign audience',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audiences retrieved successfully',
    type: GetCampaignAudiencesSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found',
    type: AddCampaignAudienceNotFoundDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCampaignAudiences(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
  ) {
    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );

    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to view it',
      );
    }

    const audiences =
      await this.campaignAudienceService.getAudiencesByCampaignId(campaignId);
    return success('Campaign audiences retrieved successfully', { audiences });
  }

  @Get(':id/audiences/count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get total unique recipient count',
    description:
      'Returns total unique subscribers that will receive this campaign (segments expanded + individual subscribers, deduplicated)',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Count retrieved successfully',
    type: GetCampaignAudienceCountSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found',
    type: AddCampaignAudienceNotFoundDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCampaignAudienceCount(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
  ) {
    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );

    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to view it',
      );
    }

    const total_unique_recipients =
      await this.campaignAudienceService.getUniqueRecipientCount(campaignId);
    return success('Audience count retrieved successfully', {
      total_unique_recipients,
    });
  }

  @Post(':id/audiences')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add audience to campaign',
    description:
      'Add a segment or individual subscriber to the campaign audience',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  @ApiBody({ type: AddCampaignAudienceDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Audience added successfully',
    type: AddCampaignAudienceSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Already added or invalid reference',
    type: AddCampaignAudienceBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign not found',
    type: AddCampaignAudienceNotFoundDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async addCampaignAudience(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
    @Body() dto: AddCampaignAudienceDto,
  ) {
    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );

    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to update it',
      );
    }

    // Verify the referenced segment or subscriber belongs to the user
    if (dto.audienceType === AUDIENCE_TYPE.SEGMENT) {
      const isValidSegment =
        await this.campaignAudienceService.verifySegmentOwnership(
          dto.id,
          userId,
        );
      if (!isValidSegment) {
        throw new BadRequestException(
          'Segment not found or does not belong to you',
        );
      }
    } else {
      const isValidSubscriber =
        await this.campaignAudienceService.verifySubscriberOwnership(
          dto.id,
          userId,
        );
      if (!isValidSubscriber) {
        throw new BadRequestException(
          'Subscriber not found or does not belong to you',
        );
      }
    }

    // Prevent duplicates
    const alreadyAdded = await this.campaignAudienceService.isAlreadyAdded(
      campaignId,
      dto.audienceType,
      dto.id,
    );
    if (alreadyAdded) {
      throw new BadRequestException(
        `This ${dto.audienceType} is already added to the campaign audience`,
      );
    }

    const audience = await this.campaignAudienceService.addAudience(
      campaignId,
      dto.audienceType,
      dto.id,
    );
    return success('Audience added successfully', { audience });
  }

  @Delete(':id/audiences/:audienceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove audience from campaign',
    description: 'Remove a segment or subscriber from the campaign audience',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  @ApiParam({
    name: 'audienceId',
    description: 'Audience entry ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audience removed successfully',
    type: RemoveCampaignAudienceSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign or audience entry not found',
    type: RemoveCampaignAudienceNotFoundDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async removeCampaignAudience(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
    @Param('audienceId') audienceId: string,
  ) {
    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );

    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to update it',
      );
    }

    const removed = await this.campaignAudienceService.removeAudience(
      audienceId,
      campaignId,
    );

    if (!removed) {
      throw new NotFoundException('Audience entry not found');
    }

    return success('Audience removed successfully', {
      audienceId,
      removedAt: new Date().toISOString(),
    });
  }

  @Post(':id/campaigns/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Schedule campaign',
    description: 'Schedule a campaign to run using the given data and time',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  @ApiBody({ type: CreateCampaignScheduleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaign scheduled successfully',
    type: CreateCampaignScheduleSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Campaign entry not found',
    type: CreateCampaignScheduleBadRequestDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async createCampaignSchedule(
    @CurrentUser('sub') userId: string,
    @Param('id') campaignId: string,
    @Body() dto: CreateCampaignScheduleDto,
  ) {
    // getting the date and time set by user in MS to compare to the current date and time
    const scheduledDateTimeMS = Number(new Date(dto.date));
    if (scheduledDateTimeMS < Number(Date.now())) {
      throw new BadRequestException('Date must not be in the past.');
    }

    const isValidCampaign = await this.campaignService.verifyCampaignOwnership(
      campaignId,
      userId,
    );

    if (!isValidCampaign) {
      throw new NotFoundException(
        'Campaign not found or you do not have permission to update it',
      );
    }

    const addedCampaignSchedule =
      await this.campaignService.createCampaignSchedule(campaignId, dto.date);

    // Set IN_QUEUE and enqueue
    await this.campaignService.setInQueue(campaignId);

    // setting the scheduledAt for a delay in MS for BullMQ to work correctly
    const scheduledAt = scheduledDateTimeMS - Number(Date.now());
    await this.campaignQueueProducer.enqueue({
      campaignId,
      userId,
      scheduledAt,
    });

    return success('Campaign scheduled successfully', {
      addedCampaignSchedule,
    });
  }
}
