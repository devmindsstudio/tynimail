import { Module } from '@nestjs/common';
import { ElementRulesController } from './element-rules.controller';
import { ElementRulesService } from './element-rules.service';

@Module({
  controllers: [ElementRulesController],
  providers: [ElementRulesService],
  exports: [ElementRulesService],
})
export class ElementRulesModule {}
