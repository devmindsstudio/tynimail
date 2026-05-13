import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { envConfig, redisConfig } from '@/config';
import { AuthModule } from '@/modules/auth';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from '@/modules/users';
import { MetadataModule } from '@/modules/metadata';
import { HealthModule } from '@/modules/health';
import { CampaignModule } from '@/modules/campaign';
import { SenderEmailModule } from '@/modules/sender-emails';
import { TemplateModule } from '@/modules/template';
import { SendgridModule } from '@/modules/sendgrid';
import { PostmarkModule } from '@/modules/postmark';
import { UserTemplateModule } from '@/modules/user-templates';
import { SegmentModule } from '@/modules/segment';
import { SubscriberModule } from '@/modules/subscriber';
import { DomainModule } from '@/modules/domain';
import { WorkflowsModule } from '@/modules/workflows';
import { ActionsModule } from '@/modules/actions';
import { TriggersModule } from '@/modules/triggers';
import { ExecutionModule } from '@/modules/execution';
import { TestingModule } from '@/modules/testing';
import { QueuesModule } from '@/modules/queues/queues.module';
import { BullBoardConfigModule } from '@/modules/queues/bull-board.module';
import { TrackingModule } from '@/modules/tracking/tracking.module';
import { ElementRulesModule } from '@/modules/element-rules/element-rules.module';
import { EmailTemplatesModule } from '@/modules/email-templates';
import { PagesModule } from '@/modules/pages';
import { FormsModule } from './modules/forms';
import { NotesModule } from '@/modules/notes';
import { BrandStyleModule } from '@/modules/brand-style';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    // Event system for workflow triggers
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 50,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    // BullMQ — must come before QueuesModule
    BullModule.forRoot({
      connection: redisConfig,
    }),
    DatabaseModule,
    BrandStyleModule,
    HealthModule,
    AuthModule,
    UsersModule,
    MetadataModule,
    CampaignModule,
    SenderEmailModule,
    DomainModule,
    TemplateModule,
    SendgridModule,
    PostmarkModule,
    UserTemplateModule,
    SegmentModule,
    SubscriberModule,
    WorkflowsModule,
    ActionsModule,
    TriggersModule,
    ExecutionModule,
    TestingModule,
    QueuesModule, // BullMQ queues
    BullBoardConfigModule, // Admin UI at /admin/queues
    TrackingModule, // Public tracking endpoints /t/*
    ElementRulesModule, // Element tracking rules CRUD
    EmailTemplatesModule,
    PagesModule,
    FormsModule,
    NotesModule,
  ],
})
export class AppModule {}
