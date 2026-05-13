/* eslint-disable prettier/prettier */
import { PROVIDER_TYPES, TABLES, USER_STATUS } from "@/constants";
import { RegisterInterface } from "@/interfaces";
import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Knex } from "knex";

@Injectable()
export class AuthService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) { }
    async register(payload: RegisterInterface): Promise<any> {
        const [user] = await this.knex.insert({
            password: payload.password,
            name: payload.name || null,
        }).into(TABLES.USERS).returning(['id', 'name']);

        const [provider] = await this.knex.insert({
            user_id: user.id,
            provider_type: PROVIDER_TYPES.EMAIL,
            provider_value: payload.email,
        }).into(TABLES.PROVIDERS).returning(['provider_value']);

        return {
            ...user,
            email: provider.provider_value
        }
    }

    async makeUserVerified(userId: string): Promise<void> {
        await this.knex(TABLES.USERS)
            .update({ status: USER_STATUS.VERIFIED, updated_at: this.knex.fn.now() })
            .where({ id: userId });
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await this.knex(TABLES.USERS)
            .update({ password: hashedPassword, updated_at: this.knex.fn.now() })
            .where({ id: userId });
    }
}