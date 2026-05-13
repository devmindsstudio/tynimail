import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired, default as SendGrid } from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  private isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');

    if (
      apiKey &&
      apiKey !== '' &&
      apiKey !== 'your-sendgrid-api-key' &&
      apiKey.startsWith('SG.')
    ) {
      SendGrid.setApiKey(apiKey);
      this.isConfigured = true;
    } else {
      console.warn(
        '⚠️  SendGrid API key not configured. Email sending via SendGrid will be disabled.',
      );
      this.isConfigured = false;
    }
  }

  async sendEmail(mail: MailDataRequired): Promise<any> {
    if (!this.isConfigured) {
      console.warn(
        '⚠️  SendGrid not configured. Email not sent:',
        mail.subject,
      );
      return { message: 'SendGrid not configured' };
    }
    return SendGrid.send(mail);
  }
}
