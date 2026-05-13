import { Module } from '@nestjs/common';
import { BrandStyleController } from './brand-style.controller';
import { BrandStyleService } from './brand-style.service';
import { S3Service } from './s3.service';

@Module({
  imports: [],
  controllers: [BrandStyleController],
  providers: [BrandStyleService, S3Service],
})
export class BrandStyleModule {}
