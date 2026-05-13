import { Module } from '@nestjs/common';
import { FilterEvaluationService } from '@/modules/triggers/services/filter-evaluation.service';

@Module({
  providers: [FilterEvaluationService],
  exports: [FilterEvaluationService],
})
export class FiltersModule {}
