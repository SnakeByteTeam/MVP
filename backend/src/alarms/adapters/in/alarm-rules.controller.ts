import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateAlarmRuleCmd } from '../../application/commands/create-alarm-rule.cmd';
import { UpdateAlarmRuleCmd } from '../../application/commands/update-alarm-rule.cmd';
import {
  CREATE_ALARM_RULE_USE_CASE,
  CreateAlarmRuleUseCase,
} from '../../application/ports/in/create-alarm-rule.use-case';
import {
  DELETE_ALARM_RULE_USE_CASE,
  DeleteAlarmRuleUseCase,
} from '../../application/ports/in/delete-alarm-rule.use-case';
import {
  GET_ALARM_RULE_BY_ID_USE_CASE,
  GetAlarmRuleByIdUseCase,
} from '../../application/ports/in/get-alarm-rule.use-case';
import {
  GET_ALL_ALARM_RULES_USE_CASE,
  GetAllAlarmRulesUseCase,
} from '../../application/ports/in/get-all-alarm-rules.use-case';
import { plainToInstance } from 'class-transformer';
import { CreateAlarmRuleReqDto } from '../../infrastructure/dtos/in/create-alarm-rule-req-dto';
import { CreateAlarmRuleResDto } from '../../infrastructure/dtos/out/create-alarm-rule-res-dto';
import { UpdateAlarmRuleReqDto } from '../../infrastructure/dtos/in/update-alarm-rule-req-dto';
import { UpdateAlarmRuleResDto } from '../../infrastructure/dtos/out/update-alarm-rule-res-dto';
import { GetAlarmRuleByIdCmd } from '../../application/commands/get-alarm-rule-by-id-cmd';
import { DeleteAlarmRuleCmd } from '../../application/commands/delete-alarm-rule-cmd';
import {
  UPDATE_ALARM_RULE_USE_CASE,
  UpdateAlarmRuleUseCase,
} from '../../application/ports/in/update-alarm-rule.use-case';
import { GetAllAlarmRulesResDto } from '../../infrastructure/dtos/out/get-all-alarm-rules-res-dto';
import { GetAlarmRuleByIdResDto } from '../../infrastructure/dtos/out/get-alarm-rule-res-dto';

@Controller('alarm-rules')
export class AlarmRulesController {
  constructor(
    @Inject(CREATE_ALARM_RULE_USE_CASE)
    private readonly createAlarmUseCase: CreateAlarmRuleUseCase,
    @Inject(DELETE_ALARM_RULE_USE_CASE)
    private readonly deleteAlarmRuleUseCase: DeleteAlarmRuleUseCase,
    @Inject(GET_ALARM_RULE_BY_ID_USE_CASE)
    private readonly getAlarmRuleByIdUseCase: GetAlarmRuleByIdUseCase,
    @Inject(GET_ALL_ALARM_RULES_USE_CASE)
    private readonly getAllAlarmRulesUseCase: GetAllAlarmRulesUseCase,
    @Inject(UPDATE_ALARM_RULE_USE_CASE)
    private readonly updateAlarmRuleUseCase: UpdateAlarmRuleUseCase,
  ) {}

  @ApiOkResponse({ type: CreateAlarmRuleResDto })
  @Post()
  async createAlarmRule(
    @Body() req: CreateAlarmRuleReqDto,
  ): Promise<CreateAlarmRuleResDto> {
    const alarm = await this.createAlarmUseCase.createAlarmRule(
      new CreateAlarmRuleCmd(
        req.name,
        req.deviceId,
        req.priority,
        req.thresholdOperator,
        req.thresholdValue,
        req.armingTime,
        req.dearmingTime,
      ),
    );
    return plainToInstance(CreateAlarmRuleResDto, alarm);
  }

  @ApiOkResponse({ type: GetAllAlarmRulesResDto, isArray: true })
  @Get()
  async getAllAlarmRules(): Promise<GetAllAlarmRulesResDto[]> {
    const alarms = await this.getAllAlarmRulesUseCase.getAllAlarmRules();
    return plainToInstance(GetAllAlarmRulesResDto, alarms);
  }

  @ApiOkResponse({ type: GetAlarmRuleByIdResDto })
  @Get(':id')
  async getAlarmRuleById(
    @Param('id') id: string,
  ): Promise<GetAlarmRuleByIdResDto> {
    const alarm = await this.getAlarmRuleByIdUseCase.getAlarmRuleById(
      new GetAlarmRuleByIdCmd(id),
    );
    return plainToInstance(GetAlarmRuleByIdResDto, alarm);
  }

  @ApiOkResponse({ type: UpdateAlarmRuleResDto })
  @Put(':id')
  async updateAlarmRule(
    @Param('id') id: string,
    @Body() req: UpdateAlarmRuleReqDto,
  ): Promise<UpdateAlarmRuleResDto> {
    const alarm = await this.updateAlarmRuleUseCase.updateAlarmRule(
      new UpdateAlarmRuleCmd(
        id,
        req.name,
        req.priority,
        req.thresholdOperator,
        req.thresholdValue,
        req.armingTime,
        req.dearmingTime,
        req.isArmed,
      ),
    );
    return plainToInstance(UpdateAlarmRuleResDto, alarm);
  }

  @Delete(':id')
  async deleteAlarmRule(@Param('id') id: string): Promise<void> {
    return this.deleteAlarmRuleUseCase.deleteAlarmRule(
      new DeleteAlarmRuleCmd(id),
    );
  }
}
