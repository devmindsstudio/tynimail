/* eslint-disable prettier/prettier */
import { CurrentUser } from "@/decorators";
import { AuthGuard } from "@/guards";
import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { error, success } from "@/responses";
import { DeleteAccountSuccessDto, GetProfileDto, UpdateNameSuccessDto, UserNotFoundDto } from "@/dto/response/users";
import { UnhandledDto, UnauthorizedDto } from "@/dto/generics";

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) {}
    
    @Get('profile')
    @ApiOperation({
        summary: 'Get user profile',
        description: 'Retrieves the authenticated user profile information'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile retrieved successfully',
        type: GetProfileDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request - User not found',
        type: UserNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or expired token',
        type: UnauthorizedDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: UnhandledDto
    })
    async getProfile(@CurrentUser('sub') userId: string): Promise<GetProfileDto> {
        const user = await this.userService.getProfile(userId);
        if(!user) throw new BadRequestException(error('User not found', 'USER-NOT-FOUND'));
        return success('User profile retrieved successfully', {user});
    }

    @Patch('tracking')
    @ApiOperation({ summary: 'Update tracking enabled flag' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Tracking preference updated' })
    async updateTracking(
        @CurrentUser('sub') userId: string,
        @Body() body: { enabled: boolean },
    ) {
        await this.userService.updateTrackingEnabled(userId, body.enabled);
        return success('Tracking preference updated', { tracking_enabled: body.enabled });
    }

    @Patch('element-tracking')
    @ApiOperation({ summary: 'Update element tracking enabled flag' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Element tracking preference updated' })
    async updateElementTracking(
        @CurrentUser('sub') userId: string,
        @Body() body: { enabled: boolean },
    ) {
        await this.userService.updateElementTrackingEnabled(userId, body.enabled);
        return success('Element tracking preference updated', { element_tracking_enabled: body.enabled });
    }

    @Post('generate-site-id')
    @ApiOperation({
        summary: 'Generate site ID',
        description: 'Generates a unique site_id for the authenticated user if one does not already exist. Idempotent — safe to call multiple times.'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Site ID generated or already exists' })
    async generateSiteId(@CurrentUser('sub') userId: string) {
        const siteId = await this.userService.generateSiteId(userId);
        return success('Site ID ready', { site_id: siteId });
    }

    @Get('team')
    @ApiOperation({
        summary: 'Get team members',
        description: 'Returns users available for workflow assignment (assign_user node). Currently returns the authenticated user; expands to org members in future.'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team members retrieved successfully'
    })
    async getTeam(@CurrentUser('sub') userId: string) {
        const members = await this.userService.getTeamMembers(userId);
        return success('Team members retrieved successfully', { members });
    }

    @Patch('update-name')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['fullName'],
            properties: {
                fullName: { type: 'string', example: 'John Terry' },
            },
        },
    })
    @ApiOperation({
        summary: 'Update user\'s name',
        description: 'Updates the authenticated user\'s full name'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User\'s Fullname updated successfully',
        type: UpdateNameSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request - User not found',
        type: UserNotFoundDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or expired token',
        type: UnauthorizedDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: UnhandledDto
    })
    async updateFullName(
        @CurrentUser('sub') userId: string,
        @Body() body: {
            fullName: string;
        }
    ): Promise<UpdateNameSuccessDto> {
        const user = await this.userService.updateUserFullname(userId, body.fullName);
        if (!user) throw new BadRequestException(error('Bad request - User not found', 'USER-NOT-FOUND'));
        return success('User\'s Fullname updated successfully', { user });
    }

    @Delete('delete-account')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', example: 'abc@example.com' },
            },
        },
    })
    @ApiOperation({
        summary: 'Delete user\'s account',
        description: 'Soft Deletes the authenticated user'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User\'s Account deleted successfully',
        type: DeleteAccountSuccessDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request - User not found',
        type: UserNotFoundDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or expired token',
        type: UnauthorizedDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: UnhandledDto
    })
    async deleteUserAccount(
        @CurrentUser('sub') userId: string,
        @Body() body: {
            email: string;
        }
    ): Promise<GetProfileDto> {
        const checkIfUserDeletedAlready = await this.userService.checkIfUserSoftDeleteUserAccount(userId);
        if (checkIfUserDeletedAlready) throw new BadRequestException(error('User not found', 'USER-NOT-FOUND'));

        const userEmailFromDB: string = await this.userService.getUserEmailByUserId(userId)
        const userEmailInput: string = structuredClone(body.email)
        if (userEmailFromDB !== userEmailInput) throw new BadRequestException(error('Email does not match', 'INVALID-EMAIL'))

        const user = await this.userService.hardDeleteUserAccount(userId);
        if (!user) throw new BadRequestException('Unable to delete user');

        return success('User\'s Account deleted successfully', { user });
    }
}