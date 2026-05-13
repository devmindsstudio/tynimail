import { Module } from "@nestjs/common";
import { UserTemplateService } from "./userTemplate.service";
import { UserTemplateController } from "./userTemplate.controller";

@Module({
    controllers: [UserTemplateController],
    providers: [UserTemplateService],
    exports: [UserTemplateService],
})
export class UserTemplateModule { }


