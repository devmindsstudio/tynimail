import { Module } from "@nestjs/common";
import { PagesController } from "./pages.controller";
import { PagesService } from "./pages.service";
import { PageTemplatesService } from "./page-templates.service";
import { PageTemplatesController } from "./page-templates.controller";
import { PageAnalyticsService } from "./page-analytics.service";
import { PublicPagesController } from "./public-pages.controller";

@Module({
    imports: [],
    controllers: [PagesController, PageTemplatesController, PublicPagesController],
    providers: [PagesService, PageTemplatesService, PageAnalyticsService]
})
export class PagesModule {}
