import { Module } from "@nestjs/common";
import { DomainController } from "./domain.controller";
import { DomainService } from "./domain.service";
import { PostmarkModule } from "../postmark";

@Module({
    imports: [PostmarkModule],
    controllers: [DomainController],
    providers: [DomainService],
})
export class DomainModule { }