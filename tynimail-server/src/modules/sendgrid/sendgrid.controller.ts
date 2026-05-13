import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@/guards";
import { CurrentUser } from "@/decorators";
import { success, error } from "@/responses";
import { SendgridService } from "./sendgrid.service";
import { SendTestEmailDto } from "@/dto/request/sendgrid";
import { SendTestEmailSuccessDto } from "@/dto/response/sendgrid";
import { ConfigService } from "@nestjs/config";

@ApiTags('Sendgrid')
@Controller('sendgrid')
export class SendgridController {
    constructor(
        private readonly sendgridService: SendgridService,
        private readonly configService: ConfigService
    ) {}

    @Post('test-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Send a test email',
        description: 'Send a beautiful test email to verify SendGrid configuration'
    })
    @ApiBody({ type: SendTestEmailDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Test email sent successfully',
        type: SendTestEmailSuccessDto
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
    // @UseGuards(AuthGuard)
    async sendTestEmail(
        @CurrentUser('sub') userId: string,
        @Body() sendTestEmailDto: SendTestEmailDto
    ) {
        try {
            const fromEmail = this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@tynimail.com';
            const currentYear = new Date().getFullYear();
            
            const htmlTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Tynimail</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Tynimail</h1>
                                        <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">Email Marketing Made Simple</p>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 50px 40px;">
                                        <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">✨ Test Email Successful!</h2>
                                        <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                            Congratulations! Your SendGrid integration is working perfectly. This beautiful email template demonstrates that your email delivery system is configured correctly.
                                        </p>
                                        
                                        <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                            <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.6;">
                                                <strong style="color: #667eea;">💡 Pro Tip:</strong> You're now ready to send campaigns, newsletters, and automated emails to your subscribers with confidence.
                                            </p>
                                        </div>

                                        <div style="margin: 30px 0;">
                                            <h3 style="margin: 0 0 15px; color: #1a202c; font-size: 18px; font-weight: 600;">What's Next?</h3>
                                            <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                                                <li>Create engaging email campaigns</li>
                                                <li>Build and manage your subscriber lists</li>
                                                <li>Track email performance with analytics</li>
                                                <li>Automate your email workflows</li>
                                            </ul>
                                        </div>

                                        <div style="text-align: center; margin: 40px 0 20px;">
                                            <a href="https://tynimail.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">Get Started</a>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f7fafc; padding: 30px 40px; border-radius: 0 0 12px 12px;">
                                        <p style="margin: 0 0 10px; color: #718096; font-size: 14px; text-align: center; line-height: 1.6;">
                                            This is a test email sent from <strong style="color: #667eea;">Tynimail</strong>
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                                            © ${currentYear} Tynimail. All rights reserved.
                                        </p>
                                        <div style="text-align: center; margin-top: 15px;">
                                            <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
                                            <span style="color: #cbd5e0;">•</span>
                                            <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Terms of Service</a>
                                            <span style="color: #cbd5e0;">•</span>
                                            <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px; margin: 0 10px;">Contact Us</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `;

            const textContent = `
Test Email Successful!

Congratulations! Your SendGrid integration is working perfectly.

This email confirms that your email delivery system is configured correctly and ready to send campaigns.

What's Next?
- Create engaging email campaigns
- Build and manage your subscriber lists
- Track email performance with analytics
- Automate your email workflows

Get started at https://tynimail.com

© ${currentYear} Tynimail. All rights reserved.
            `;
            
            const result = await this.sendgridService.sendEmail({
                to: sendTestEmailDto.to,
                from: fromEmail,
                subject: '✨ Your Tynimail Test Email - Integration Successful!',
                text: textContent,
                html: htmlTemplate,
            });

            return success('Test email sent successfully', {
                statusCode: result[0]?.statusCode,
                messageId: result[0]?.headers?.['x-message-id'],
                recipient: sendTestEmailDto.to,
            });
        } catch (err: any) {
            return error(
                err.response?.body?.errors?.[0]?.message || err.message || 'Failed to send email',
                'SENDGRID_ERROR'
            );
        }
    }
}
