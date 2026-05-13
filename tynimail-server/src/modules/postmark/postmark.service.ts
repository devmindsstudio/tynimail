import {
  Injectable,
  Inject,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ServerClient } from 'postmark';
import { Knex } from 'knex';

@Injectable()
export class PostmarkService {
  private readonly logger = new Logger(PostmarkService.name);
  private client: ServerClient;
  private axiosInstance: AxiosInstance;
  private isConfigured: boolean;

  constructor(
    private readonly configService: ConfigService,
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {
    const accountApiToken = this.configService.get<string>(
      'POSTMARK_API_ACCOUNT_TOKEN',
    )!;
    const serverApiToken = this.configService.get<string>(
      'POSTMARK_API_SERVER_TOKEN',
    )!;
    const apiUrl = this.configService.get<string>('POSTMARK_API_URL');

    if (
      accountApiToken &&
      accountApiToken !== '' &&
      accountApiToken !== 'your-postmark-api-token' &&
      serverApiToken &&
      serverApiToken !== '' &&
      serverApiToken !== 'your-postmark-api-token'
    ) {
      this.client = new ServerClient(serverApiToken);
      this.axiosInstance = axios.create({
        baseURL: apiUrl,
        headers: {
          'Content-Type': 'application/json',
          'X-Postmark-Account-Token': accountApiToken,
        },
      });
      this.isConfigured = true;
      this.logger.log('✅ Postmark configured successfully');
    } else {
      console.warn(
        '⚠️  Postmark API token not configured. Email sending will be disabled.',
      );
      this.isConfigured = false;
    }
  }

  async sendEmail(options: {
    From: string;
    To: string;
    Subject: string;
    HtmlBody?: string;
    TextBody?: string;
    MessageStream?: string;
  }): Promise<any> {
    if (!this.isConfigured) {
      console.warn(
        '⚠️  Postmark not configured. Email not sent:',
        options.Subject,
      );
      return { message: 'Postmark not configured' };
    }
    return this.client.sendEmail(options);
  }

  async sendEmailWithTemplate(options: {
    From: string;
    To: string;
    TemplateId: number;
    TemplateAlias?: string;
    TemplateModel: Record<string, any>;
    MessageStream?: string;
  }): Promise<any> {
    if (!this.isConfigured) {
      console.warn('⚠️  Postmark not configured. Template email not sent');
      return { message: 'Postmark not configured' };
    }
    return this.client.sendEmailWithTemplate(options);
  }

  async sendEmailBatch(
    messages: Array<{
      From: string;
      To: string;
      Subject: string;
      HtmlBody?: string;
      TextBody?: string;
      MessageStream?: string;
    }>,
  ): Promise<any> {
    if (!this.isConfigured) {
      console.warn('⚠️  Postmark not configured. Batch emails not sent');
      return { message: 'Postmark not configured' };
    }
    return this.client.sendEmailBatch(messages);
  }

  async getVerifiedSenders(
    count: number = 50,
    offset: number = 0,
  ): Promise<any> {
    const response = await this.axiosInstance.get('/senders', {
      params: {
        count,
        offset,
      },
    });
    return response.data;
  }

  async getVerifiedSenderBySignatureId(
    signatureId: string,
  ): Promise<{ isConfirmed: boolean; sender: any }> {
    try {
      const response = await this.axiosInstance.get(`/senders/${signatureId}`);
      return {
        isConfirmed: response.data?.Confirmed || false,
        sender: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to get sender by signature ID: ${error.message}`);
    }
  }

  async verifySenderIdentity(email: string, name: string): Promise<any> {
    if (!this.isConfigured || !this.axiosInstance) {
      throw new UnprocessableEntityException(
        'Email provider is not configured. Please set up Postmark before verifying sender addresses.',
      );
    }

    try {
      const response = await this.axiosInstance.post('/senders', {
        FromEmail: email,
        Name: name,
      });
      return response.data;
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const ax = err as AxiosError<{
          Message?: string;
          message?: string;
          ErrorCode?: number;
        }>;
        const errorCode = ax.response?.data?.ErrorCode;
        const rawMessage =
          ax.response?.data?.Message ?? ax.response?.data?.message ?? '';

        if (errorCode === 503 || /public domain emails/i.test(rawMessage)) {
          throw new UnprocessableEntityException(
            "You can't use public email providers (like Gmail, Yahoo, Outlook.com) as sender addresses. Please use an address on your own domain (for example: you@yourcompany.com).",
          );
        }

        throw new UnprocessableEntityException(
          rawMessage ||
            'Unable to verify this sender email. Please check the address and try again.',
        );
      }

      throw new UnprocessableEntityException(
        'Unable to verify this sender email right now. Please try again later.',
      );
    }
  }

  async getVerifiedDomains(
    count: number = 50,
    offset: number = 0,
  ): Promise<any> {
    const response = await this.axiosInstance.get('/domains', {
      params: {
        count,
        offset,
      },
    });
    return response.data;
  }

  async getVerifiedDomainByName(domain: string): Promise<any> {
    const response = await this.axiosInstance.get(`/domains/${domain}`);
    return response.data;
  }

  extractDnsFromPostmarkDomain(obj: any): {
    dkim_host: string;
    dkim_value: string;
    return_path_cname_name: string;
    return_path_cname_value: string;
  } {
    const d = obj?.Domain ?? obj ?? {};
    let dkim_host =
      d.DKIMPendingHost ??
      d.DKIMHost ??
      d.dkim_host ??
      d.DkimHost ??
      d.DKIMHostName ??
      d.DKIMRecordHost ??
      d.DKIM?.Host ??
      d.DKIM?.Hostname ??
      d.DKIM?.RecordHost ??
      d.DKIMConfiguration?.Host ??
      d.DKIMRecord?.Hostname ??
      d.DKIMRecord?.Host ??
      d.DKIMRecord?.RecordHost ??
      '';
    let dkim_value =
      d.DKIMPendingTextValue ??
      d.DKIMTextValue ??
      d.DKIMValue ??
      d.dkim_value ??
      d.DkimValue ??
      d.DKIMTXTValue ??
      d.DKIMRecordValue ??
      d.DKIM?.Value ??
      d.DKIM?.RecordValue ??
      d.DKIM?.Data ??
      d.DKIMConfiguration?.Value ??
      d.DKIMRecord?.Value ??
      d.DKIMRecord?.Data ??
      (typeof d.DKIM === 'string' ? d.DKIM : '') ??
      '';
    const dkimRecords = d.DKIMRecords ?? d.DkimRecords ?? d.dkimRecords;
    if (Array.isArray(dkimRecords) && dkimRecords.length > 0) {
      const first = dkimRecords[0];
      if (!dkim_host)
        dkim_host =
          first.Host ??
          first.Hostname ??
          first.RecordHost ??
          first.HostName ??
          first.name ??
          '';
      if (!dkim_value)
        dkim_value =
          first.Value ?? first.RecordValue ?? first.Data ?? first.Content ?? '';
    }
    let return_path_cname_name =
      d.ReturnPathDomain ??
      d.ReturnPathCNAMEHost ??
      d.return_path_cname_name ??
      d.ReturnPathDomainHost ??
      d.ReturnPathHost ??
      d.ReturnPath?.Host ??
      d.ReturnPathDomainName ??
      d.ReturnPathRecord?.Hostname ??
      d.ReturnPathRecord?.Host ??
      '';
    let return_path_cname_value =
      d.ReturnPathDomainCNAMEValue ??
      d.ReturnPathCNAMEValue ??
      d.return_path_cname_value ??
      d.ReturnPathValue ??
      d.ReturnPath?.Value ??
      d.ReturnPathDomainValue ??
      d.ReturnPathRecord?.Value ??
      (typeof d.ReturnPath === 'string' ? d.ReturnPath : '') ??
      '';
    const records = d.Records ?? d.DNSRecords ?? d.records ?? [];
    if (Array.isArray(records) && records.length > 0) {
      for (const r of records) {
        const type = (r.Type ?? r.type ?? r.RecordType ?? '').toLowerCase();
        const host =
          r.Host ??
          r.Hostname ??
          r.host ??
          r.name ??
          r.RecordHost ??
          r.HostName ??
          '';
        const val =
          r.Value ??
          r.value ??
          r.Target ??
          r.target ??
          r.RecordValue ??
          r.Data ??
          r.Content ??
          '';
        if (
          (type === 'dkim' || type === 'txt') &&
          val &&
          (val.includes('p=MIG') || val.includes('k=rsa'))
        ) {
          if (!dkim_host) dkim_host = host;
          if (!dkim_value) dkim_value = val;
        }
        if (
          (type === 'returnpath' ||
            type === 'return-path' ||
            type === 'cname') &&
          host &&
          (host.includes('bounce') || host.includes('pm-'))
        ) {
          if (!return_path_cname_name) return_path_cname_name = host;
          if (!return_path_cname_value) return_path_cname_value = val;
        }
      }
    }
    return {
      dkim_host,
      dkim_value,
      return_path_cname_name,
      return_path_cname_value,
    };
  }

  async findDomainByNameFromList(domain: string): Promise<any> {
    const list = await this.getVerifiedDomains(100, 0);
    const domains = list?.Domains ?? list?.domains ?? [];
    const match = Array.isArray(domains)
      ? domains.find(
          (d: any) =>
            (d?.Name ?? d?.name ?? '').toLowerCase() === domain.toLowerCase(),
        )
      : null;
    if (match && (match.ID ?? match.id)) {
      return this.getDomainById(match.ID ?? match.id);
    }
    return null;
  }

  async getDomainById(postmarkDomainId: number): Promise<any> {
    const response = await this.axiosInstance.get(
      `/domains/${postmarkDomainId}`,
    );
    return response.data;
  }

  async getDomainVerificationStatus(
    postmarkDomainId: number,
  ): Promise<{ verified: boolean }> {
    const data = await this.getDomainById(postmarkDomainId);
    const dkimVerified = data?.DKIMVerified === true;
    const returnPathVerified = data?.ReturnPathDomainVerified === true;
    return { verified: !!(dkimVerified && returnPathVerified) };
  }

  async deleteDomain(postmarkDomainId: number): Promise<void> {
    await this.axiosInstance.delete(`/domains/${postmarkDomainId}`);
  }

  async createDomainIdentity(domain: string): Promise<any> {
    if (!this.isConfigured || !this.axiosInstance) {
      throw new UnprocessableEntityException(
        'Email provider is not configured. Please set up Postmark in your environment to verify domains.',
      );
    }
    try {
      const response = await this.axiosInstance.post('/domains', {
        Name: domain,
      });
      return response.data;
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const ax = err as AxiosError<{
          Message?: string;
          message?: string;
          ErrorCode?: number;
        }>;
        const msg =
          ax.response?.data?.Message ??
          ax.response?.data?.message ??
          'Unable to add this domain. Please use a custom domain (e.g. mail.yoursite.com), not a public one like gmail.com.';
        throw new UnprocessableEntityException(msg);
      }
      throw new UnprocessableEntityException(
        'Unable to add this domain. Please check the domain name and try again.',
      );
    }
  }

  /**
   * Send email and track it in the database
   * This is the main method to use for workflow automation emails
   */
  async sendAndTrackEmail(params: {
    userId: string;
    contactId: string;
    toEmail: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    fromEmail?: string;
    fromName?: string;
    replyTo?: string;
    previewText?: string;
    templateId?: string;
    workflowId?: string;
    executionId?: string;
    metadata?: any;
  }): Promise<{ sentEmail: any; postmarkResult: any }> {
    if (!this.isConfigured) {
      this.logger.warn('⚠️  Postmark not configured. Email not sent.');
      throw new Error('Postmark not configured');
    }

    try {
      // 1. Send email via Postmark
      const from =
        params.fromEmail || this.configService.get('POSTMARK_FROM_EMAIL');
      const fromName = params.fromName || 'TyniMail';

      // Embed previewText as a hidden preheader span at the top of the HTML body
      let htmlBody = params.htmlBody;
      if (params.previewText && htmlBody) {
        const preheader = `<span style="display:none;max-height:0;overflow:hidden;">${params.previewText}</span>`;
        htmlBody = htmlBody.replace(/(<body[^>]*>)/i, `$1${preheader}`);
        if (!htmlBody.includes(preheader)) {
          htmlBody = preheader + htmlBody;
        }
      }

      const postmarkResult = await this.client.sendEmail({
        From: fromName ? `${fromName} <${from}>` : from || '',
        To: params.toEmail,
        ReplyTo: params.replyTo,
        Subject: params.subject,
        HtmlBody: htmlBody,
        TextBody: params.textBody,
        TrackOpens: true,
        TrackLinks: 'HtmlAndText' as any,
        MessageStream: 'broadcast',
        Metadata: params.metadata,
      });

      this.logger.log(
        `📧 Email sent: ${postmarkResult.MessageID} to ${params.toEmail}`,
      );

      // 2. Store in tbl_sent_emails for tracking
      const [sentEmail] = await this.knex('tbl_sent_emails')
        .insert({
          user_id: params.userId,
          contact_id: params.contactId,
          workflow_id: params.workflowId || null,
          template_id: params.templateId || null,
          execution_id: params.executionId || null,
          subject: params.subject,
          from_email: from,
          from_name: fromName,
          to_email: params.toEmail,
          postmark_message_id: postmarkResult.MessageID,
          status: 'sent',
          sent_at: this.knex.fn.now(),
        })
        .returning('*');

      this.logger.log(`✅ Email tracked in database: ${sentEmail.id}`);

      return {
        sentEmail,
        postmarkResult,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send email with Postmark template and track it
   */
  async sendTemplateAndTrackEmail(params: {
    userId: string;
    contactId: string;
    toEmail: string;
    templateId: number;
    templateModel: Record<string, any>;
    fromEmail?: string;
    fromName?: string;
    subject?: string;
    workflowId?: string;
    executionId?: string;
    metadata?: any;
  }): Promise<{ sentEmail: any; postmarkResult: any }> {
    if (!this.isConfigured) {
      this.logger.warn('⚠️  Postmark not configured. Template email not sent.');
      throw new Error('Postmark not configured');
    }

    try {
      // 1. Send email via Postmark template
      const from =
        params.fromEmail || this.configService.get('POSTMARK_FROM_EMAIL');
      const fromName = params.fromName || 'TyniMail';

      const postmarkResult = await this.client.sendEmailWithTemplate({
        From: fromName ? `${fromName} <${from}>` : from || '',
        To: params.toEmail,
        TemplateId: params.templateId,
        TemplateModel: params.templateModel,
        TrackOpens: true,
        TrackLinks: 'HtmlAndText' as any,
        MessageStream: 'broadcast',
        Metadata: params.metadata,
      });

      this.logger.log(
        `📧 Template email sent: ${postmarkResult.MessageID} to ${params.toEmail}`,
      );

      // 2. Store in tbl_sent_emails
      const [sentEmail] = await this.knex('tbl_sent_emails')
        .insert({
          user_id: params.userId,
          contact_id: params.contactId,
          template_id: null,
          execution_id: params.executionId || null,
          subject: params.subject || `Email from template ${params.templateId}`,
          from_email: from,
          from_name: fromName,
          to_email: params.toEmail,
          postmark_message_id: postmarkResult.MessageID,
          status: 'sent',
          sent_at: this.knex.fn.now(),
        })
        .returning('*');

      this.logger.log(`✅ Template email tracked in database: ${sentEmail.id}`);

      return {
        sentEmail,
        postmarkResult,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send template email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Helper method to interpolate variables in email content
   * Supports: {{firstName}}, {{lastName}}, {{attributes.plan}}, etc.
   */
  interpolateVariables(text: string, contact: any): string {
    if (!text) return text;

    // Replace {{field}} and {{attributes.field}}
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split('.');
      let value: any = contact;

      for (const key of keys) {
        if (value && typeof value === 'object') {
          value = value[key];
        } else {
          return match; // Return original if path not found
        }
      }

      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Get sent email by Postmark message ID
   */
  async getSentEmailByMessageId(messageId: string): Promise<any> {
    return this.knex('tbl_sent_emails')
      .where({ postmark_message_id: messageId })
      .first();
  }

  /**
   * Get all sent emails for a contact
   */
  async getSentEmailsByContact(
    userId: string,
    contactId: string,
  ): Promise<any[]> {
    return this.knex('tbl_sent_emails')
      .where({ user_id: userId, contact_id: contactId })
      .orderBy('sent_at', 'desc');
  }
}
