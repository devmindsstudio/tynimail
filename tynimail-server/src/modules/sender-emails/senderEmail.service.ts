import { Injectable, Inject } from "@nestjs/common";
import { Knex } from "knex";
import { TABLES } from "@/constants";

@Injectable()
export class SenderEmailService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) { }

    async getSenderEmailsByUserId(userId: string, onlyVerified: boolean = true): Promise<any[]> {
        const query = this.knex(TABLES.SENDER_EMAILS)
            .select(
                'id',
                'email',
                'signature_id',
                'is_verified',
                'created_at',
                'updated_at'
            )
            .where({ user_id: userId, status: 1 });

        if (onlyVerified) {
            query.where({ is_verified: true });
        }

        const senderEmails = await query.orderBy('created_at', 'desc');

        return senderEmails;
    }

    async findSenderEmailByEmail(email: string, userId?: string): Promise<any> {
        const query = this.knex(TABLES.SENDER_EMAILS)
            .where({ email });

        if (userId) {
            query.where({ user_id: userId });
        }

        return query.first();
    }

    async createSenderEmail(userId: string, email: string, signatureId?: string): Promise<any> {
        const [senderEmail] = await this.knex(TABLES.SENDER_EMAILS)
            .insert({
                user_id: userId,
                email,
                signature_id: signatureId || null,
                is_verified: false,
                status: 1
            })
            .returning('*');

        return senderEmail;
    }

    async updateSenderEmail(id: string, data: Partial<{ is_verified: boolean; status: number; signature_id: string }>): Promise<any> {
        const [senderEmail] = await this.knex(TABLES.SENDER_EMAILS)
            .where({ id })
            .update({
                ...data,
                updated_at: this.knex.fn.now()
            })
            .returning('*');

        return senderEmail;
    }
}