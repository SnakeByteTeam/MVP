import { Controller, Inject, Get, Query } from '@nestjs/common';
import { GetAnalyticsCmd } from 'src/analytics/application/commands/get-analytics.cmd';
import { GetAnalyticsUseCase } from 'src/analytics/application/ports/in/get-analytics.usecase';
import { GetAnalyticsDto } from 'src/analytics/infrastructure/dtos/get-analytics.dto';
import { PlotDto } from 'src/analytics/infrastructure/dtos/plot.dto';

@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject('GET_ANALYTICS_USECASE') private readonly getAnalyticsUseCase: GetAnalyticsUseCase
    ) {}

    @Get()
    async getAnalytics(@Query() dto: GetAnalyticsDto) : Promise<PlotDto> {
        const cmd = new GetAnalyticsCmd(dto.metric, dto.id);
        const plot = await this.getAnalyticsUseCase.getAnalytics(cmd);
        return PlotDto.fromDomain(plot);
    }
}
