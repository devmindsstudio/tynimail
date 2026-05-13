import { Module } from "@nestjs/common";
import { UsersModule } from "@/modules/users";
import { OtpService } from "@/modules/otp";

@Module({
    imports: [UsersModule],
    providers: [OtpService],
    exports: [],
})
export class OtpModule {}