import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, NotFoundException, BadRequestException, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success, error } from "@/responses";
import { SegmentService } from "./segment.service";
import { CreateSegmentDto, GetSegmentSubscribersDto, UpdateSegmentDto, DeleteSegmentsDto } from "@/dto/request/segment";
import { CreateSegmentSuccessDto, CreateSegmentValidationErrorDto, GetSegmentsSuccessDto, GetSegmentSuccessDto, GetSegmentNotFoundDto, GetSegmentSubscribersSuccessDto } from "@/dto/response/segment";

@ApiTags('Segments')
@Controller('segments')
export class SegmentController {
    constructor(
        private readonly segmentService: SegmentService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all segments',
        description: 'Retrieve all segments for the authenticated user'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Segments retrieved successfully',
        type: GetSegmentsSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getSegments(@CurrentUser('sub') userId: string) {
        const segments = await this.segmentService.getSegmentsByUserId(userId);
        return success('Segments retrieved successfully', { segments });
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get segment by ID',
        description: 'Retrieve a specific segment by ID for the authenticated user'
    })
    @ApiParam({
        name: 'id',
        description: 'Segment ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Segment retrieved successfully',
        type: GetSegmentSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Segment not found',
        type: GetSegmentNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getSegment(
        @CurrentUser('sub') userId: string,
        @Param('id') segmentId: string
    ) {
        const segment = await this.segmentService.getSegmentById(segmentId, userId);

        if (!segment) {
            throw new NotFoundException(error('Segment not found or you do not have permission to view it', 'NOT-FOUND-ERROR'));
        }

        return success('Segment retrieved successfully', { segment });
    }

    @Get(':id/subscribers')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get subscribers in a segment',
        description: 'Retrieve all subscribers for a specific segment with optional filters'
    })
    @ApiParam({
        name: 'id',
        description: 'Segment ID',
        type: String
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscribers retrieved successfully',
        type: GetSegmentSubscribersSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Segment not found',
        type: GetSegmentNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getSegmentSubscribers(
        @CurrentUser('sub') userId: string,
        @Param('id') segmentId: string,
        @Query() query: GetSegmentSubscribersDto
    ) {
        // First verify segment exists and belongs to user
        const segment = await this.segmentService.getSegmentById(segmentId, userId);

        if (!segment) {
            throw new NotFoundException(error('Segment not found or you do not have permission to view it', 'NOT-FOUND-ERROR'));
        }

        const subscribers = await this.segmentService.getSubscribersBySegmentId(segmentId, userId, query);

        return success('Subscribers retrieved successfully', { subscribers, segmentName: segment.name });
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new segment',
        description: 'Create a new segment with name and optional color'
    })
    @ApiBody({ type: CreateSegmentDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Segment created successfully',
        type: CreateSegmentSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error',
        type: CreateSegmentValidationErrorDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async createSegment(
        @CurrentUser('sub') userId: string,
        @Body() createSegmentDto: CreateSegmentDto
    ) {

        // Check for existing segment with the same name
        const existingSegment = await this.segmentService.getSegmentByName(createSegmentDto.name, userId);
        if (existingSegment)
            throw new BadRequestException(error('Segment with this name already exists', 'VALIDATION-ERROR'));

        const segment = await this.segmentService.createSegment({
            userId,
            name: createSegmentDto.name,
            color: createSegmentDto.color,
        });

        return success('Segment created successfully', segment);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update a segment',
        description: 'Update segment name and/or color'
    })
    @ApiParam({
        name: 'id',
        description: 'Segment ID',
        type: String
    })
    @ApiBody({ type: UpdateSegmentDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Segment updated successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Validation error'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Segment not found'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async updateSegment(
        @CurrentUser('sub') userId: string,
        @Param('id') segmentId: string,
        @Body() updateSegmentDto: UpdateSegmentDto
    ) {
        // Verify segment exists and belongs to user
        const existingSegment = await this.segmentService.getSegmentById(segmentId, userId);
        if (!existingSegment) {
            throw new NotFoundException(error('Segment not found or you do not have permission to update it', 'NOT-FOUND-ERROR'));
        }

        // Check if name is being updated and if it conflicts with another segment
        if (updateSegmentDto.name && updateSegmentDto.name !== existingSegment.name) {
            const segmentWithSameName = await this.segmentService.getSegmentByName(updateSegmentDto.name, userId);
            if (segmentWithSameName && segmentWithSameName.id !== segmentId) {
                throw new BadRequestException(error('Segment with this name already exists', 'VALIDATION-ERROR'));
            }
        }

        const updatedSegment = await this.segmentService.updateSegment(segmentId, userId, {
            name: updateSegmentDto.name,
            color: updateSegmentDto.color,
        });

        if (!updatedSegment) {
            throw new NotFoundException(error('Segment not found', 'NOT-FOUND-ERROR'));
        }

        return success('Segment updated successfully', updatedSegment);
    }

    @Delete('delete-multiple')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete multiple segments',
        description: 'Soft delete multiple segments by setting row_status to 0'
    })
    @ApiBody({ type: DeleteSegmentsDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Segments deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deleteMultipleSegments(
        @CurrentUser('sub') userId: string,
        @Body() deleteSegmentsDto: DeleteSegmentsDto
    ) {
        const deletedCount = await this.segmentService.deleteMultipleSegments(
            deleteSegmentsDto.segmentIds,
            userId
        );

        return success('Segments deleted successfully', {
            deleted: deletedCount,
            requested: deleteSegmentsDto.segmentIds.length
        });
    }


}