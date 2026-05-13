import { Injectable, Logger, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class IdentifyService {
  private readonly logger = new Logger(IdentifyService.name);

  constructor(@Inject('KNEX_CONNECTION') private knex: Knex) {}

  /**
   * Resolve an email address to a contactId for a given siteId.
   * Called by the JS tracker when the customer calls tynimail.identify(email).
   * Returns the contactId if found, null otherwise.
   */
  async identify(data: {
    siteId: string;
    email: string;
  }): Promise<{ contactId: string | null }> {
    if (!data.siteId || !data.email) {
      return { contactId: null };
    }

    // Resolve user from siteId
    const user = await this.knex('tbl_users')
      .where({ site_id: data.siteId, tracking_enabled: true })
      .select('id')
      .first();

    if (!user) {
      this.logger.debug(`[IDENTIFY] No user found for siteId=${data.siteId}`);
      return { contactId: null };
    }

    // Look up contact by email under this user
    const contact = await this.knex('tbl_subscribers')
      .where({ user_id: user.id, email: data.email.toLowerCase().trim() })
      .select('id')
      .first();

    if (!contact) {
      this.logger.debug(
        `[IDENTIFY] No contact found for email=${data.email} userId=${user.id}`,
      );
      return { contactId: null };
    }

    this.logger.debug(
      `[IDENTIFY] Resolved email=${data.email} → contactId=${contact.id}`,
    );

    return { contactId: contact.id };
  }
}
