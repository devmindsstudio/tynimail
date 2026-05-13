import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { PostmarkModule } from '@/modules/postmark';
import { EmailTemplatesModule } from '@/modules/email-templates';
import {
  SendEmailExecutor,
  AddToListExecutor,
  RemoveFromListExecutor,
  UpdateContactExecutor,
  NotifyEmailExecutor,
  CallWebhookExecutor,
  BlocklistContactExecutor,
  AssignUserExecutor,
  DeleteContactExecutor,
} from './executors';

@Module({
  imports: [PostmarkModule, EmailTemplatesModule],
  providers: [
    ActionsService,
    SendEmailExecutor,
    AddToListExecutor,
    RemoveFromListExecutor,
    UpdateContactExecutor,
    NotifyEmailExecutor,
    CallWebhookExecutor,
    BlocklistContactExecutor,
    AssignUserExecutor,
    DeleteContactExecutor,
  ],
  exports: [ActionsService],
})
export class ActionsModule {}
