import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@/guards';
import { CurrentUser } from '@/decorators';
import { ElementRulesService } from './element-rules.service';
import type { CreateElementRuleDto, UpdateElementRuleDto } from './element-rules.service';
import { success } from '@/responses';

@ApiTags('Element Rules')
@ApiBearerAuth()
@Controller('element-rules')
@UseGuards(AuthGuard)
export class ElementRulesController {
  constructor(private readonly elementRulesService: ElementRulesService) {}

  @Get()
  @ApiOperation({ summary: 'List element tracking rules' })
  async getRules(
    @CurrentUser('sub') userId: string,
    @Query('event') eventName?: string,
  ) {
    const rules = await this.elementRulesService.getRules(userId, eventName);
    return success('Element rules retrieved', { rules });
  }

  @Post()
  @ApiOperation({ summary: 'Create an element tracking rule' })
  async createRule(
    @CurrentUser('sub') userId: string,
    @Body() body: CreateElementRuleDto,
  ) {
    const rule = await this.elementRulesService.createRule(userId, body);
    return success('Element rule created', { rule });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an element tracking rule' })
  async updateRule(
    @CurrentUser('sub') userId: string,
    @Param('id') ruleId: string,
    @Body() body: UpdateElementRuleDto,
  ) {
    const rule = await this.elementRulesService.updateRule(userId, ruleId, body);
    return success('Element rule updated', { rule });
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Enable or disable an element tracking rule' })
  async toggleRule(
    @CurrentUser('sub') userId: string,
    @Param('id') ruleId: string,
    @Body() body: { enabled: boolean },
  ) {
    const rule = await this.elementRulesService.toggleRule(userId, ruleId, body.enabled);
    return success('Element rule updated', { rule });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an element tracking rule' })
  async deleteRule(
    @CurrentUser('sub') userId: string,
    @Param('id') ruleId: string,
  ) {
    await this.elementRulesService.deleteRule(userId, ruleId);
    return success('Element rule deleted', {});
  }
}
