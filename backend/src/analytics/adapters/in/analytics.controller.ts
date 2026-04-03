import { Controller, Inject, Get, Query } from '@nestjs/common';
import { GetAnalyticsCmd } from '../../application/commands/get-analytics.cmd';
import { GetAnalyticsUseCase } from '../../application/ports/in/get-analytics.usecase';
import { GetAnalyticsDto } from '../../infrastructure/dtos/get-analytics.dto';
import { PlotDto } from '../../infrastructure/dtos/plot.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('GET_ANALYTICS_USECASE')
    private readonly getAnalyticsUseCase: GetAnalyticsUseCase,
  ) {}

  @ApiOkResponse({ type: GetAnalyticsDto })
  @Get()
  async getAnalyticsByPlantId(
    @Query() dto: GetAnalyticsDto,
  ): Promise<PlotDto[]> {
    const cmd = new GetAnalyticsCmd(dto.plantId);
    const plots = await this.getAnalyticsUseCase.getAnalyticsByPlantId(cmd);
    return plots.map((p) => PlotDto.fromDomain(p));
  }
}
