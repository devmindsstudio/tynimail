import { error, success } from '@/responses';
import {
  RegisterDto,
  RegisterConlictDto,
  RegisterValidationErrorDto,
  LoginDto,
  LoginUnauthorizedDto,
  LoginValidationErrorDto,
  VerifyOtpSuccessDto,
  VerifyOtpInvalidDto,
  VerifyOtpValidationErrorDto,
  ResendVerificationSuccessDto,
  ResendVerificationValidationErrorDto,
  ForgetPasswordSuccessDto,
  ForgetPasswordValidationErrorDto,
  VerifyPasswordOtpSuccessDto,
  VerifyPasswordOtpInvalidDto,
  VerifyPasswordOtpValidationErrorDto,
  VerifyPasswordOtpNotFoundDto,
  RefreshTokenSuccessDto,
  RefreshTokenInvalidDto,
  RefreshTokenValidationErrorDto,
  ResetPasswordSuccessDto,
  ResetPasswordNotFoundDto,
  ResetPasswordBadRequestDto,
} from '@/dto/response/auth';
import {
  RegisterUserDto,
  LoginUserDto,
  VerifyOtpDto,
  ForgetPasswordDto,
  VerifyPasswordOtpDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from '@/dto/request/auth';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UnhandledDto } from '@/dto/generics';
import {
  hashPassword,
  comparePassword,
  verifyEmail,
  generateOTP,
} from '@/utils';
import { AuthService } from './auth.service';
import { UsersService } from '@/modules/users';
import { JwtService } from '@/modules/jwt';
import { META_STATUS, META_TYPES, PROVIDER_TYPES } from '@/constants';
import { MetadataService } from '@/modules/metadata';
import { AuthGuard } from '@/guards';
import { CurrentUser } from '@/decorators';
import { PostmarkService } from '@/modules/postmark';
import { ChangePasswordDto } from '@/dto/request/auth/change-password.dto';
import {
  ChangePasswordBadRequestDto,
  ChangePasswordSuccessDto,
} from '@/dto/response/auth/change-password.dto';
import { UserNotFoundDto } from '@/dto/response/users';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly metadataService: MetadataService,
    private readonly postmarkService: PostmarkService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email, password, and optional name',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: RegisterDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data',
    type: RegisterValidationErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - User already exists',
    type: RegisterConlictDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  async register(@Body() payload: RegisterUserDto): Promise<RegisterDto> {
    const user = await this.userService.getUserByProviderValue(
      payload.email,
      PROVIDER_TYPES.EMAIL,
    );
    if (user)
      throw new BadRequestException(
        error('User with this email already exists', 'CONFLICT-ERROR'),
      );

    if (process.env.NODE_ENV !== 'local') {
      const isEmailValid = await verifyEmail(payload.email);

      if (!isEmailValid.valid)
        throw new BadRequestException(
          error(isEmailValid.reason, 'VALIDATION-ERROR'),
        );
    }

    const { password } = payload;
    Object.assign(payload, { password: await hashPassword(password) });
    const newUser = await this.authService.register(payload);

    const tokens = await this.jwtService.generateTokenPair({
      sub: newUser.id,
    });

    const otp = generateOTP();
    const otpPayload = {
      meta_type: META_TYPES.EMAIL_VERIFICATION,
      meta_data: { otp, expiry: Date.now() + 15 * 60 * 1000 }, //Expires in 15 minutes
      user_id: newUser.id,
    };

    await this.postmarkService.sendEmailWithTemplate({
      // Subject: 'Verify your email || Tynimail',
      // HtmlBody: otp,
      TemplateId: 43756880,
      TemplateAlias: 'otp-verification',
      TemplateModel: {
        OTP_CODE: otp,
      },
      From: 'info@tynimail.com',
      To: payload.email,
      MessageStream: 'outbound',
    });

    await this.metadataService.saveMetadata(otpPayload);

    return success('User registered successfully', tokens);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user with email and password',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: LoginDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data',
    type: LoginValidationErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid credentials',
    type: LoginUnauthorizedDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  async login(@Body() payload: LoginUserDto): Promise<LoginDto> {
    const user = await this.userService.getUserByProviderValue(
      payload.email,
      PROVIDER_TYPES.EMAIL,
    );
    if (!user)
      throw new UnauthorizedException(
        error('Invalid email or password', 'UNAUTHORIZED-ERROR'),
      );

    if (user.status === 0)
      throw new UnauthorizedException(
        error('Invalid email or password', 'UNAUTHORIZED-ERROR'),
      );

    const isPasswordValid = await comparePassword(
      payload.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException(
        error('Invalid email or password', 'UNAUTHORIZED-ERROR'),
      );

    const tokens = await this.jwtService.generateTokenPair({
      sub: user.id,
    });
    Object.assign(tokens, { isEmailVerified: user.status });
    return success('Login successful', tokens);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verifies a 6-digit OTP code',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP verified successfully',
    type: VerifyOtpSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid OTP format',
    type: VerifyOtpValidationErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid OTP',
    type: VerifyOtpInvalidDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async verifyOtp(
    @CurrentUser('sub') userId: string,
    @Body() payload: VerifyOtpDto,
  ): Promise<VerifyOtpSuccessDto> {
    const userEmailById = await this.userService.getUserEmailByUserId(userId);

    const user = await this.userService.getUserByProviderValue(
      userEmailById,
      PROVIDER_TYPES.EMAIL,
    );

    if (!user)
      throw new BadRequestException(
        error('No account found with this email address', 'USER-NOT-FOUND'),
      );

    const metadata = await this.metadataService.getLatestMetadata(
      user.id,
      META_TYPES.EMAIL_VERIFICATION,
    );

    if (!metadata)
      throw new BadRequestException(
        error('No OTP request found', 'INVALID-OTP'),
      );

    const { otp, expiry } = metadata.meta_data;

    if (Date.now() > expiry)
      throw new BadRequestException(error('OTP has expired', 'INVALID-OTP'));

    if (otp !== payload.otp)
      throw new BadRequestException(error('Invalid OTP', 'INVALID-OTP'));

    await this.metadataService.updateMetadataStatus(
      metadata.id,
      META_STATUS.DELETED,
    ); // Mark as used

    await this.authService.makeUserVerified(userId);
    return success('OTP verified successfully', {});
  }

  @Get('resend-email-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend email verification code',
    description: 'Resends verification code for email verification',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verification code sent successfully',
    type: ResendVerificationSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or expired token',
    type: LoginUnauthorizedDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async resendEmailVerification(
    @CurrentUser('sub') userId: string,
  ): Promise<ResendVerificationSuccessDto> {
    const otp = generateOTP();

    await this.metadataService.saveMetadata({
      user_id: userId,
      meta_type: META_TYPES.EMAIL_VERIFICATION,
      meta_data: { otp, expiry: Date.now() + 15 * 60 * 1000 }, // Expires in 15 minutes
    });

    const userEmailById = await this.userService.getUserEmailByUserId(userId);

    await this.postmarkService.sendEmailWithTemplate({
      TemplateId: 43756880,
      TemplateAlias: 'otp-verification',
      TemplateModel: {
        OTP_CODE: otp,
      },
      From: 'info@tynimail.com',
      To: userEmailById,
      MessageStream: 'outbound',
    });

    return success('Email verification code sent successfully', {});
  }

  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Forget password',
    description: 'Request password reset for an account',
  })
  @ApiBody({ type: ForgetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset request processed',
    type: ForgetPasswordSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data',
    type: ForgetPasswordValidationErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  async forgetPassword(
    @Body() payload: ForgetPasswordDto,
  ): Promise<ForgetPasswordSuccessDto> {
    const user = await this.userService.getUserByProviderValue(
      payload.email,
      PROVIDER_TYPES.EMAIL,
    );

    if (!user)
      throw new BadRequestException(
        error('No account found with this email address', 'USER-NOT-FOUND'),
      );

    const otp = generateOTP();

    await this.metadataService.saveMetadata({
      user_id: user.id,
      meta_type: META_TYPES.PASSWORD_RESET,
      meta_data: { otp, expiry: Date.now() + 15 * 60 * 1000 }, // Expires in 15 minutes
    });

    await this.postmarkService.sendEmailWithTemplate({
      TemplateId: 43756880,
      TemplateAlias: 'otp-verification',
      TemplateModel: {
        OTP_CODE: otp,
      },
      From: 'info@tynimail.com',
      To: payload.email,
      MessageStream: 'outbound',
    });

    return success('OTP sent to email', {});
  }

  @Post('verify-password-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify password reset OTP',
    description: 'Verifies the OTP code sent for password reset',
  })
  @ApiBody({ type: VerifyPasswordOtpDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP verified successfully',
    type: VerifyPasswordOtpSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data',
    type: VerifyPasswordOtpValidationErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: VerifyPasswordOtpNotFoundDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or expired OTP',
    type: VerifyPasswordOtpInvalidDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  async verifyPasswordOtp(
    @Body() payload: VerifyPasswordOtpDto,
  ): Promise<VerifyPasswordOtpSuccessDto> {
    const user = await this.userService.getUserByProviderValue(
      payload.email,
      PROVIDER_TYPES.EMAIL,
    );

    if (!user)
      throw new BadRequestException(
        error('No account found with this email address', 'USER-NOT-FOUND'),
      );

    // if (payload.otp !== '555555') {
    //   throw new BadRequestException(error('Invalid OTP', 'INVALID-OTP'));
    // }
    const metadata = await this.metadataService.getLatestMetadata(
      user.id,
      META_TYPES.PASSWORD_RESET,
    );

    if (!metadata)
      throw new UnauthorizedException(
        error('No password reset request found', 'INVALID-OTP'),
      );

    const { otp, expiry } = metadata.meta_data;

    if (Date.now() > expiry)
      throw new UnauthorizedException(error('OTP has expired', 'INVALID-OTP'));

    if (otp !== payload.otp)
      throw new UnauthorizedException(error('Invalid OTP', 'INVALID-OTP'));

    await this.metadataService.updateMetadataStatus(
      metadata.id,
      META_STATUS.DELETED,
    ); // Mark as used

    return success('OTP verified successfully', {});
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using a valid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: RefreshTokenSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data',
    type: RefreshTokenValidationErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or expired refresh token',
    type: RefreshTokenInvalidDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  async refreshToken(
    @Body() payload: RefreshTokenDto,
  ): Promise<RefreshTokenSuccessDto> {
    try {
      const decoded = await this.jwtService.verifyRefreshToken(
        payload.refreshToken,
      );

      const tokens = await this.jwtService.generateTokenPair({
        sub: decoded.sub,
      });

      return success('Token refreshed successfully', tokens);
    } catch (err) {
      throw new UnauthorizedException(
        error('Invalid or expired refresh token', 'INVALID-REFRESH-TOKEN'),
      );
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Reset user password with email and new password. New password must be different from current password.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: ResetPasswordSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data or same password',
    type: ResetPasswordBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ResetPasswordNotFoundDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  async resetPassword(
    @Body() payload: ResetPasswordDto,
  ): Promise<ResetPasswordSuccessDto> {
    const user = await this.userService.getUserByProviderValue(
      payload.email,
      PROVIDER_TYPES.EMAIL,
    );

    if (!user)
      throw new BadRequestException(
        error('No account found with this email address', 'USER-NOT-FOUND'),
      );

    const isSamePassword = await comparePassword(
      payload.newPassword,
      user.password,
    );

    if (isSamePassword)
      throw new BadRequestException(
        error(
          'New password must be different from the current password',
          'SAME-PASSWORD',
        ),
      );

    const hashedPassword = await hashPassword(payload.newPassword);
    await this.authService.updatePassword(user.id, hashedPassword);

    return success('Password reset successfully', {});
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description:
      'Change user password with old password and new password. New password must be different from current password.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
    type: ChangePasswordSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data or same password',
    type: ChangePasswordBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: UserNotFoundDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: UnhandledDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() payload: ChangePasswordDto,
  ): Promise<ChangePasswordSuccessDto> {
    const user = await this.userService.getUserCredentials(userId);

    if (!user)
      throw new BadRequestException(
        error('No account found with this user ID', 'USER-NOT-FOUND'),
      );

    const isSamePassword = await comparePassword(
      payload.newPassword,
      user.password,
    );

    if (isSamePassword)
      throw new BadRequestException(
        error(
          'New password must be different from the current password',
          'SAME-PASSWORD',
        ),
      );
    const isOldPasswordMatch = await comparePassword(
      payload.oldPassword,
      user.password,
    );

    if (!isOldPasswordMatch)
      throw new BadRequestException(
        error(
          'Old password must match the current password',
          'PASSWORD-MISMATCH',
        ),
      );

    const hashedPassword = await hashPassword(payload.newPassword);
    await this.authService.updatePassword(user.id, hashedPassword);

    return success('Password reset successfully', {});
  }
}
