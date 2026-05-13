import { Knex } from "knex";
import { Inject, Injectable } from "@nestjs/common";
import { TABLES } from "@/constants";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}
  async getUserByProviderValue(
    providerValue: string,
    providerType: number,
  ): Promise<any> {
    const user = this.knex(`${TABLES.PROVIDERS} as provider`)
      .where({
        provider_value: providerValue,
        provider_type: providerType,
      })
      .join(`${TABLES.USERS} as us`, `provider.user_id`, '=', 'us.id')
      .first()
      .select(
        'us.id as id',
        'provider.provider_value as email',
        'us.name as name',
        'us.status as status',
        'us.password as password',
        'us.created_at as createdAt',
        'us.updated_at as updatedAt',
      );
    return user;
  }

  async getUserCredentials(userId: string): Promise<any> {
    const [user] = await this.knex(TABLES.USERS)
      .select('id', 'password')
      .where({ id: userId });
    return user;
  }

  async updateUserFullname(userId: string, fullName: string): Promise<any> {
    const [updatedName] = await this.knex(TABLES.USERS)
      .update({ name: fullName })
      .where({ id: userId })
      .returning(['id AS userId', 'name AS fullName']);

    return updatedName;
  }

  async hardDeleteUserAccount(userId: string): Promise<any> {
    const [deletedUserDetails] = await this.knex(TABLES.USERS)
      .update({ status: 0, deleted_at: this.knex.fn.now() })
      .where({ id: userId })
      .returning(['id AS userId', 'status', 'deleted_at']);

    const [hardDeleteUser] = await this.knex(TABLES.USERS)
      .where({ id: userId })
      .delete(['id AS userId', 'deleted_at']);

    return hardDeleteUser;
  }

  async checkIfUserExists(userId: string): Promise<any> {
    const userCheck = await this.knex(TABLES.USERS)
      .where({ id: userId })
      .andWhereRaw('status <> 0')
      .first();
    return userCheck;
  }

  async checkIfUserIsSuspended(userId: string): Promise<any> {
    const suspendedUserCheck = await this.knex(TABLES.USERS)
      .where({ id: userId, status: 3 })
      .first();

    return suspendedUserCheck;
  }

  async checkIfUserSoftDeleteUserAccount(userId: string): Promise<any> {
    const deletedUserCheck = await this.knex(TABLES.USERS)
      .where({ id: userId, status: 0 })
      .first();

    return deletedUserCheck;
  }

  async getProfile(userId: string): Promise<any> {
    return this.knex(`${TABLES.USERS} as user`)
      .innerJoin(
        `${TABLES.PROVIDERS} as provider`,
        'user.id',
        '=',
        'provider.user_id',
      )
      .select(
        'user.id',
        'user.name',
        'user.site_id',
        'provider.provider_value as email',
        'user.role',
        'user.status',
        'user.tracking_enabled',
        'user.element_tracking_enabled',
        'user.created_at',
        'user.updated_at',
      )
      .where({ 'user.id': userId })
      .first();
  }

  async getUserEmailByUserId(userId: string): Promise<string> {
    const query = this.knex(`${TABLES.USERS} as user`)
      .innerJoin(
        `${TABLES.PROVIDERS} as provider`,
        'user.id',
        '=',
        'provider.user_id',
      )
      .select('provider.provider_value as email')
      .where({ 'user.id': userId })
      .first();

    const result = (await query) as { email: string };
    return result.email;
  }

  async updateTrackingEnabled(userId: string, enabled: boolean): Promise<void> {
    await this.knex(TABLES.USERS)
      .where({ id: userId })
      .update({ tracking_enabled: enabled });
  }

  async updateElementTrackingEnabled(
    userId: string,
    enabled: boolean,
  ): Promise<void> {
    await this.knex(TABLES.USERS)
      .where({ id: userId })
      .update({ element_tracking_enabled: enabled });
  }

  async generateSiteId(userId: string): Promise<string> {
    // Idempotent — return existing site_id if already set
    const user = await this.knex(TABLES.USERS)
      .where({ id: userId })
      .select('site_id')
      .first();
    if (user?.site_id) return user.site_id;

    // Retry loop to handle the rare UUID collision on the unique constraint
    for (let attempt = 0; attempt < 5; attempt++) {
      const newSiteId = uuidv4();
      try {
        await this.knex(TABLES.USERS)
          .where({ id: userId })
          .whereNull('site_id')
          .update({ site_id: newSiteId });
        return newSiteId;
      } catch (err: any) {
        if (err.constraint === 'tbl_users_site_id_unique') continue;
        throw err;
      }
    }
    throw new Error(
      'Failed to generate a unique site_id after multiple attempts',
    );
  }

  /**
   * Return team members available for workflow assignment.
   * Currently returns only the authenticated user; expands to org members later.
   */
  async getTeamMembers(
    userId: string,
  ): Promise<{ id: string; name: string; email: string }[]> {
    return this.knex(`${TABLES.USERS} as user`)
      .innerJoin(
        `${TABLES.PROVIDERS} as provider`,
        'user.id',
        '=',
        'provider.user_id',
      )
      .select('user.id', 'user.name', 'provider.provider_value as email')
      .where({ 'user.id': userId, 'user.status': 1 })
      .orderBy('user.name', 'asc');
  }
}
