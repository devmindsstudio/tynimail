import { Controller, Get, Post, HttpCode, HttpStatus, UseGuards, Body, Query, NotFoundException, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success, error } from "@/responses";
import { SenderEmailService } from "./senderEmail.service";
import { PostmarkService } from "@/modules/postmark";
import { GetSenderEmailsSuccessDto } from "@/dto/response/sender-emails";
import { VerifySenderEmailDto, CheckVerificationDto } from "@/dto/request/sender-emails";

@ApiTags('Sender Emails')
@Controller('sender-emails')
export class SenderEmailController {
    constructor(
        private readonly senderEmailService: SenderEmailService,
        private readonly postmarkService: PostmarkService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all sender emails',
        description: 'Retrieve all sender emails for the authenticated user'
    })
    @ApiQuery({
        name: 'onlyVerified',
        required: false,
        type: Boolean,
        description: 'Filter to only verified sender emails (default: true)'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Sender emails retrieved successfully',
        type: GetSenderEmailsSuccessDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getSenderEmails(
        @CurrentUser('sub') userId: string,
        @Query('onlyVerified') onlyVerified?: string
    ) {
        const showOnlyVerified = onlyVerified === 'false' ? false : true;
        const senderEmails = await this.senderEmailService.getSenderEmailsByUserId(userId, showOnlyVerified);
        return success('Sender emails retrieved successfully', { senderEmails });
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify sender email',
        description: 'Add and verify a sender email address via Postmark'
    })
    @ApiBody({ type: VerifySenderEmailDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Sender email verification initiated successfully'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad Request - Invalid email or validation error'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async verifySenderEmail(
        @CurrentUser('sub') userId: string,
        @Body() body: VerifySenderEmailDto
    ) {
        const existingSender = await this.senderEmailService.findSenderEmailByEmail(body.email);

        if (existingSender)
            throw new BadRequestException(error('Sender email already exists in the system', 'EMAIL-ALREADY-EXISTS'));

        const postmarkResult = await this.postmarkService.verifySenderIdentity(body.email, body.name);
        const signatureId = postmarkResult?.ID || null;
        const senderEmail = await this.senderEmailService.createSenderEmail(userId, body.email, signatureId);

        return success('Sender email verification initiated successfully. Please check your email to confirm.', { senderEmail });
    }

    @Post('check-verification')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Check sender email verification status',
        description: 'Check if a sender email is verified in Postmark'
    })
    @ApiBody({ type: CheckVerificationDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Sender email verification status retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Sender email not found'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token'
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async checkSenderVerificationStatus(
        @Body() body: CheckVerificationDto,
        @CurrentUser('sub') userId: string
    ) {
        const senderEmail = await this.senderEmailService.findSenderEmailByEmail(body.email, userId);
        if (!senderEmail)
            throw new BadRequestException(error('Sender email not found', 'NOT-FOUND'));

        const postmarkStatus = await this.postmarkService.getVerifiedSenderBySignatureId(senderEmail.signature_id);

        if (postmarkStatus.isConfirmed && !senderEmail.is_verified) {
            await this.senderEmailService.updateSenderEmail(senderEmail.id, { is_verified: true });
            return success('Sender email verified successfully', { isVerified: true });
        } else {
            throw new BadRequestException(error('Sender email is not verified yet', 'NOT-VERIFIED'));
        }

    }
}