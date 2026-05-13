import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, NotFoundException, BadRequestException, Inject, forwardRef, Param, Patch, Delete, UseInterceptors, UploadedFile, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiConsumes, ApiQuery } from "@nestjs/swagger";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { success, error } from "@/responses";
import { SubscriberService } from "./subscriber.service";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { ValidateEmailDto, AddSubscriberDto, UpdateSubscriberDto, ManageSegmentSubscribersDto, UploadCsvDto, GetSubscribersDto, DeleteSubscribersDto } from "@/dto/request/subscriber";
import { ValidateEmailSuccessDto, ValidateEmailValidationErrorDto } from "@/dto/response/subscriber";
import { SegmentService } from "../segment";
import { CsvUploadInterceptor } from "@/interceptors";
import { CsvService } from "../csv";
import { validateEmail } from "@/utils";

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscriberController {
    constructor(
        private readonly subscriberService: SubscriberService,
        @Inject(forwardRef(() => SegmentService))
        private readonly segmentService: SegmentService,
        private readonly csvService: CsvService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Upload subscribers CSV',
        description: 'Upload a CSV file containing subscribers with optional segment mapping'
    })
    @ApiConsumes('multipart/form-data')
    @ApiQuery({
        name: 'segments',
        required: false,
        description: 'Comma-separated segment IDs to map subscribers to',
        type: String,
        example: 'segment-uuid-1,segment-uuid-2'
    })
    @ApiBody({
        type: UploadCsvDto
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscribers uploaded successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Invalid file or data'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @UseInterceptors(CsvUploadInterceptor('csv', 5))
    async uploadSubscribers(
        @CurrentUser('sub') userId: string,
        @UploadedFile() file: Express.Multer.File,
        @Query('segments') segmentsQuery?: string
    ) {
        // Parse segment IDs from query parameter
        const segmentIds = segmentsQuery ? segmentsQuery.split(',').map(id => id.trim()).filter(id => id) : [];

        // If segment IDs provided, verify they exist and belong to user
        if (segmentIds.length > 0) {
            for (const segmentId of segmentIds) {
                const segment = await this.segmentService.getSegmentById(segmentId, userId);
                if (!segment) {
                    throw new NotFoundException(error(`Segment not found: ${segmentId}`, 'NOT-FOUND-ERROR'));
                }
            }
        }

        // Validate headers before parsing to save memory
        const { valid, message } = await this.csvService.validateCSVHeaders(file.buffer);
        if (!valid) {
            throw new BadRequestException(error(message || 'Invalid CSV file', 'VALIDATION-ERROR'));
        }

        // Only parse if validation passes
        const subscribers = await this.csvService.parseCSV(file.buffer);

        const subscribersWithVerificationStatus = await Promise.all(subscribers.map(async subscriber => {
            const email = subscriber.email?.toString().trim().toLowerCase();
            const isValid = await validateEmail(email);
            return {
                ...subscriber,
                email,
                status: isValid ? 1 : 0,
            };
        }));

        const addedSubscriberIds = await this.subscriberService.addBulkSubscribers(subscribersWithVerificationStatus, userId);

        // If segment IDs provided and subscribers were added, map them to segments
        if (segmentIds.length > 0 && addedSubscriberIds.length > 0) {
            for (const segmentId of segmentIds) {
                await this.segmentService.addSubscribersToSegment(segmentId, addedSubscriberIds);
            }
        }

        return success('Subscribers uploaded successfully', {
            total: subscribers.length,
            added: addedSubscriberIds.length,
            segments_mapped: segmentIds.length
        });
    }

    @Post('validate-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Validate email address',
        description: 'Validates if an email address is valid and deliverable'
    })
    @ApiBody({ type: ValidateEmailDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Email validated successfully',
        type: ValidateEmailSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error',
        type: ValidateEmailValidationErrorDto
    })
    async validateEmail(@Body() validateEmailDto: ValidateEmailDto) {
        const isValid = await this.subscriberService.validateEmailAddress(validateEmailDto.email);

        return success('Email validated successfully', {
            email: validateEmailDto.email,
            valid: isValid
        });
    }

    @Get('attributes')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get contact attribute keys',
        description: 'Returns all known custom attribute keys for the user\'s contacts, for use in filter builders'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Attribute keys retrieved successfully'
    })
    async getAttributes(@CurrentUser('sub') userId: string) {
        const rows = await this.subscriberService.getAttributeKeys(userId);
        return success('Attribute keys retrieved successfully', { attributes: rows });
    }

    @Post('list')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all subscribers',
        description: 'Get all subscribers for the authenticated user with optional filters'
    })
    @ApiBody({ type: GetSubscribersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscribers retrieved successfully'
    })
    async getAllSubscribers(
        @CurrentUser('sub') userId: string,
        @Body() body: GetSubscribersDto
    ) {
        const subscribers = await this.subscriberService.getAllSubscribersByUserId(userId, body);

        return success('Subscribers retrieved successfully', {
            subscribers,
            count: subscribers.length
        });
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get subscriber by ID',
        description: 'Get a single subscriber by their ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Subscriber ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscriber retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Subscriber not found'
    })
    async getSubscriberById(
        @CurrentUser('sub') userId: string,
        @Param('id') subscriberId: string
    ) {
        const subscriber = await this.subscriberService.getSubscriberById(subscriberId, userId);

        if (!subscriber) {
            throw new NotFoundException(error('Subscriber not found', 'NOT-FOUND-ERROR'));
        }

        return success('Subscriber retrieved successfully', { subscriber });
    }

    @Delete('delete-multiple')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete multiple subscribers',
        description: 'Soft delete multiple subscribers by setting row_status to 0'
    })
    @ApiBody({ type: DeleteSubscribersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscribers deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error'
    })
    async deleteMultipleSubscribers(
        @CurrentUser('sub') userId: string,
        @Body() deleteSubscribersDto: DeleteSubscribersDto
    ) {
        const deletedCount = await this.subscriberService.deleteMultipleSubscribers(
            deleteSubscribersDto.subscriberIds,
            userId
        );

        return success('Subscribers deleted successfully', {
            requested: deleteSubscribersDto.subscriberIds.length,
            deleted: deletedCount
        });
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete subscriber',
        description: 'Soft delete a subscriber by setting row_status to 0'
    })
    @ApiParam({
        name: 'id',
        description: 'Subscriber ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscriber deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Subscriber not found'
    })
    async deleteSubscriber(
        @CurrentUser('sub') userId: string,
        @Param('id') subscriberId: string
    ) {
        const deleted = await this.subscriberService.deleteSubscriber(subscriberId, userId);

        if (!deleted) {
            throw new NotFoundException(error('Subscriber not found', 'NOT-FOUND-ERROR'));
        }

        return success('Subscriber deleted successfully', {
            subscriber_id: subscriberId,
            deleted: true
        });
    }

    @Get(':id/available-segments')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get available segments for subscriber',
        description: 'Get all segments where the subscriber is not added'
    })
    @ApiParam({
        name: 'id',
        description: 'Subscriber ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Available segments retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Subscriber not found'
    })
    async getAvailableSegments(
        @CurrentUser('sub') userId: string,
        @Param('id') subscriberId: string
    ) {
        // Verify subscriber exists and belongs to user
        const subscriber = await this.subscriberService.getSubscriberById(subscriberId, userId);
        if (!subscriber) {
            throw new NotFoundException(error('Subscriber not found', 'NOT-FOUND-ERROR'));
        }

        const availableSegments = await this.subscriberService.getAvailableSegmentsForSubscriber(subscriberId, userId);

        return success('Available segments retrieved successfully', {
            segments: availableSegments,
            count: availableSegments.length
        });
    }

    @Post('add-to-segment/:segmentId')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Add subscribers to segment',
        description: 'Add multiple subscribers to a segment'
    })
    @ApiParam({
        name: 'segmentId',
        description: 'Segment ID',
        type: String
    })
    @ApiBody({ type: ManageSegmentSubscribersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscribers added to segment successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Segment or subscribers not found'
    })
    async addSubscribersToSegment(
        @CurrentUser('sub') userId: string,
        @Param('segmentId') segmentId: string,
        @Body() manageSegmentDto: ManageSegmentSubscribersDto
    ) {
        // Verify segment exists and belongs to user
        const segment = await this.segmentService.getSegmentById(segmentId, userId);
        if (!segment) {
            throw new NotFoundException(error('Segment not found', 'NOT-FOUND-ERROR'));
        }

        // Verify all subscribers exist and belong to user
        const subscriberChecks = await Promise.all(
            manageSegmentDto.subscriber_ids.map(id =>
                this.subscriberService.getSubscriberById(id, userId)
            )
        );

        const notFoundSubscribers = manageSegmentDto.subscriber_ids.filter((id, index) => !subscriberChecks[index]);
        if (notFoundSubscribers.length > 0) {
            throw new NotFoundException(error(`Subscribers not found: ${notFoundSubscribers.join(', ')}`, 'NOT-FOUND-ERROR'));
        }

        // Add subscribers to segment
        const { added, alreadyInSegment } = await this.segmentService.addMultipleSubscribersToSegment(segmentId, manageSegmentDto.subscriber_ids);

        // Emit event for each newly added subscriber (fires workflow triggers)
        for (const subscriberId of manageSegmentDto.subscriber_ids.slice(0, added)) {
            this.eventEmitter.emit('contact.added_to_list', {
                userId,
                contactId: subscriberId,
                listId: segmentId,
                listName: segment.name,
                source: 'api',
            });
        }

        return success('Subscribers processed successfully', {
            segment_id: segmentId,
            total_requested: manageSegmentDto.subscriber_ids.length,
            added_count: added,
            already_in_segment_count: alreadyInSegment
        });
    }

    @Post('remove-from-segment/:segmentId')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Remove subscribers from segment',
        description: 'Remove multiple subscribers from a segment'
    })
    @ApiParam({
        name: 'segmentId',
        description: 'Segment ID',
        type: String
    })
    @ApiBody({ type: ManageSegmentSubscribersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscribers removed from segment successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Segment or subscribers not found'
    })
    async removeSubscribersFromSegment(
        @CurrentUser('sub') userId: string,
        @Param('segmentId') segmentId: string,
        @Body() manageSegmentDto: ManageSegmentSubscribersDto
    ) {
        // Verify segment exists and belongs to user
        const segment = await this.segmentService.getSegmentById(segmentId, userId);
        if (!segment) {
            throw new NotFoundException(error('Segment not found', 'NOT-FOUND-ERROR'));
        }

        // Verify all subscribers exist and belong to user
        const subscriberChecks = await Promise.all(
            manageSegmentDto.subscriber_ids.map(id =>
                this.subscriberService.getSubscriberById(id, userId)
            )
        );

        const notFoundSubscribers = manageSegmentDto.subscriber_ids.filter((id, index) => !subscriberChecks[index]);
        if (notFoundSubscribers.length > 0) {
            throw new NotFoundException(error(`Subscribers not found: ${notFoundSubscribers.join(', ')}`, 'NOT-FOUND-ERROR'));
        }

        // Remove subscribers from segment
        const removedCount = await this.segmentService.removeMultipleSubscribersFromSegment(segmentId, manageSegmentDto.subscriber_ids);

        // Emit event for each removed subscriber (fires workflow triggers)
        if (removedCount > 0) {
            for (const subscriberId of manageSegmentDto.subscriber_ids) {
                this.eventEmitter.emit('contact.removed_from_list', {
                    userId,
                    contactId: subscriberId,
                    listId: segmentId,
                    listName: segment.name,
                    source: 'api',
                });
            }
        }

        return success('Subscribers removed from segment successfully', {
            segment_id: segmentId,
            total_requested: manageSegmentDto.subscriber_ids.length,
            removed_count: removedCount
        });
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update subscriber',
        description: 'Update subscriber information. At least one field is required.'
    })
    @ApiParam({
        name: 'id',
        description: 'Subscriber ID',
        type: String
    })
    @ApiBody({ type: UpdateSubscriberDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscriber updated successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Subscriber not found'
    })
    async updateSubscriber(
        @CurrentUser('sub') userId: string,
        @Param('id') subscriberId: string,
        @Body() updateSubscriberDto: UpdateSubscriberDto
    ) {
        // Check if at least one field is provided
        if (!updateSubscriberDto.first_name && !updateSubscriberDto.last_name && !updateSubscriberDto.email && updateSubscriberDto.notes === undefined && !updateSubscriberDto.attributes) {
            throw new BadRequestException(error('At least one field (first_name, last_name, email, notes, or attributes) is required', 'VALIDATION-ERROR'));
        }

        // Check if subscriber exists
        const subscriber = await this.subscriberService.getSubscriberById(subscriberId, userId);
        if (!subscriber) {
            throw new NotFoundException(error('Subscriber not found', 'NOT-FOUND-ERROR'));
        }

        // If email is being updated, check if it's already in use by another subscriber
        if (updateSubscriberDto.email && updateSubscriberDto.email !== subscriber.email) {
            const emailInUse = await this.subscriberService.getSubscriberByEmail(updateSubscriberDto.email, userId);
            console.log('emailInUse', emailInUse);
            //Return appropriate error if email is in use
            if (emailInUse)
                throw new BadRequestException(error('Email is already in use by another subscriber', 'VALIDATION-ERROR'));
        }

        let emailStatus: number = subscriber.status;
        // Validate email if provided
        if (updateSubscriberDto.email) {
            const isValidEmail = await this.subscriberService.validateEmailAddress(updateSubscriberDto.email);
            console.log('isValidEmail', isValidEmail);
            emailStatus = isValidEmail ? 1 : 0;
        }

        // Update subscriber
        const updated = await this.subscriberService.updateSubscriber(subscriberId, userId, {
            first_name: updateSubscriberDto.first_name,
            last_name: updateSubscriberDto.last_name,
            email: updateSubscriberDto.email,
            notes: updateSubscriberDto.notes,
            status: emailStatus,
            attributes: updateSubscriberDto.attributes,
        });

        if (!updated)
            throw new NotFoundException(error('Subscriber not found or could not be updated', 'UPDATE-ERROR'));


        return success('Subscriber updated successfully', {
            subscriber_id: subscriberId
        });
    }

    @Post('add')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Add a single subscriber',
        description: 'Add a single subscriber with optional segment mapping'
    })
    @ApiBody({ type: AddSubscriberDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Subscriber added successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Segment not found'
    })
    async addSubscriber(
        @CurrentUser('sub') userId: string,
        @Body() addSubscriberDto: AddSubscriberDto
    ) {
        // Add subscriber
        const { id: subscriberId, isNew } = await this.subscriberService.addSingleSubscriber({
            email: addSubscriberDto.email,
            first_name: addSubscriberDto.first_name,
            last_name: addSubscriberDto.last_name
        }, userId);

        let addedToSegments = 0;
        let alreadyInSegments = 0;

        // If segments array is provided and has items, map subscriber to segments
        if (addSubscriberDto.segments && addSubscriberDto.segments.length > 0) {
            // Verify all segments exist and belong to user
            for (const segmentId of addSubscriberDto.segments) {
                const segment = await this.segmentService.getSegmentById(segmentId, userId);
                if (!segment) {
                    throw new NotFoundException(error(`Segment not found: ${segmentId}`, 'NOT-FOUND-ERROR'));
                }
            }

            // Add subscriber to all segments and emit trigger event for each new addition
            for (const segmentId of addSubscriberDto.segments) {
                const segment = await this.segmentService.getSegmentById(segmentId, userId);
                const { added, alreadyInSegment } = await this.segmentService.addMultipleSubscribersToSegment(
                    segmentId,
                    [subscriberId]
                );
                addedToSegments += added;
                alreadyInSegments += alreadyInSegment;

                if (added > 0) {
                    this.eventEmitter.emit('contact.added_to_list', {
                        userId,
                        contactId: subscriberId,
                        listId: segmentId,
                        listName: segment.name,
                        source: 'manual',
                    });
                }
            }
        }

        return success('Subscriber added successfully', {
            subscriber_id: subscriberId,
            is_new_subscriber: isNew,
            segments_count: addSubscriberDto.segments?.length || 0,
            added_to_segments: addedToSegments,
            already_in_segments: alreadyInSegments
        });
    }
}