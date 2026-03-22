import { Controller, Inject, Get, Query, Res } from '@nestjs/common';
import { GetAnalyticsCmd } from 'src/analytics/application/commands/get-analytics.cmd';
import { GetAnalyticsUseCase } from 'src/analytics/application/ports/in/get-analytics.usecase';
import { GetAnalyticsDto } from 'src/analytics/infrastructure/dtos/get-analytics.dto';
import { PlotDto } from 'src/analytics/infrastructure/dtos/plot.dto';
import { Response } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('GET_ANALYTICS_USECASE')
    private readonly getAnalyticsUseCase: GetAnalyticsUseCase,
  ) {}

  @Get()
  async getAnalytics(
    @Query() dto: GetAnalyticsDto,
    @Res() res: Response,
  ): Promise<void> {
    const cmd = new GetAnalyticsCmd(dto.metric, dto.id);
    const plot = await this.getAnalyticsUseCase.getAnalytics(cmd);

    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 ore
    res.json(PlotDto.fromDomain(plot));
  }
}
