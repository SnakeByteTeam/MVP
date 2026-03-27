import { Controller, Inject, Get, Query, Res } from '@nestjs/common';
import { GetAnalyticsCmd } from '../../application/commands/get-analytics.cmd';
import { GetAnalyticsUseCase } from '../../application/ports/in/get-analytics.usecase';
import { GetAnalyticsDto } from '../../infrastructure/dtos/get-analytics.dto';
import { PlotDto } from '../../infrastructure/dtos/plot.dto';
import { Response } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('GET_ANALYTICS_USECASE')
    private readonly getAnalyticsUseCase: GetAnalyticsUseCase,
  ) {}

  @Get()
  async getAnalytics(@Query() dto: GetAnalyticsDto): Promise<PlotDto> {
    const cmd = new GetAnalyticsCmd(dto.metric, dto.id);
    const plot = await this.getAnalyticsUseCase.getAnalytics(cmd);
    return PlotDto.fromDomain(plot);
  }
}
