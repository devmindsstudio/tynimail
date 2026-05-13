import { Module } from "@nestjs/common";
import { SenderEmailService } from "./senderEmail.service";
import { SenderEmailController } from "./senderEmail.controller";
import { PostmarkModule } from "@/modules/postmark";

@Module({
    imports: [PostmarkModule],
    controllers: [SenderEmailController],
    providers: [SenderEmailService],
    exports: [SenderEmailService],
})

export class SenderEmailModule { }