import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { NodeMetadataController } from './controllers/node-metadata.controller';
import { WorkflowsService } from './workflows.service';
import { NodeMetadataService } from './services/node-metadata.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkflowsController, NodeMetadataController],
  providers: [WorkflowsService, NodeMetadataService],
  exports: [WorkflowsService, NodeMetadataService],
})
export class WorkflowsModule {}
