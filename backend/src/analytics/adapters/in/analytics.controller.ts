import { Controller, Inject, Get, Query, Param, UseGuards } from '@nestjs/common';
import { GetAnalyticsCmd } from '../../application/commands/get-analytics.cmd';
import { GetAnalyticsUseCase } from '../../application/ports/in/get-analytics.usecase';
import { GetAnalyticsDto } from '../../infrastructure/dtos/get-analytics.dto';
import { PlotDto } from '../../infrastructure/dtos/plot.dto';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { User } from 'src/wards/domain/user';
import { UserGuard } from 'src/guard/user/user.guard';
import { AdminGuard } from 'src/guard/admin/admin.guard';


@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('GET_ANALYTICS_USECASE')
    private readonly getAnalyticsUseCase: GetAnalyticsUseCase,
  ) {}

  @UseGuards(UserGuard, AdminGuard)
  @Get('/:plantId')
  @ApiOperation({
    summary: 'Get all analytics by Plant ID',
    description:
      'Retrieves all types of analytics with related suggestions (if necessary) based on the given plant id.',
  })
  @ApiParam({
    name: 'plantId',
    required: true,
    type: String,
    description: 'Plant ID',
    example: 'AA0011BB0011',
  })
  @ApiOkResponse({
    description: 'Analytics successfully retrieved.',
    type: GetAnalyticsDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async getAnalyticsByPlantId(
    @Param() dto: GetAnalyticsDto,
  ): Promise<PlotDto[]> {
    const cmd = new GetAnalyticsCmd(dto.plantId);
    const plots = await this.getAnalyticsUseCase.getAnalyticsByPlantId(cmd);
    return plots.map((p) => PlotDto.fromDomain(p));
  }
}
