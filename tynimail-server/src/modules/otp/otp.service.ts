import { Inject, Injectable } from "@nestjs/common";
import { Knex } from "knex";

@Injectable()
export class OtpService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) { }
    saveOtp(userId: string, otp: string, type: string): void {
       
    }

    validateOtp(userId: string, otp: string): boolean {
        // Logic to validate the OTP for the user
        return otp === '555555'; // Placeholder logic
    }
}