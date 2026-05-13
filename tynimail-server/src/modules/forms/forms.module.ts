import { Module } from "@nestjs/common";
import { FormsController } from "./forms.controller";
import { FormsService } from "./forms.service";
import { FormAnalyticsService } from "./form-analytics.service";
import { PublicFormsController } from "./public-forms.controller";

@Module({
    imports: [],
    controllers: [FormsController, PublicFormsController],
    providers: [FormsService, FormAnalyticsService]
})
export class FormsModule {}
