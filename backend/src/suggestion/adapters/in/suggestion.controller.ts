import { Controller, Post, Inject, Body } from '@nestjs/common';
import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';
import { GetSuggestionUseCase } from 'src/suggestion/application/ports/in/get-suggestion.usecase';
import { GetSuggestionDto } from 'src/suggestion/infrastructure/dtos/get-suggestion.dto';
import { SuggestionDto } from 'src/suggestion/infrastructure/dtos/suggestion.dto';

@Controller('suggestion')
export class SuggestionController {
  constructor(
    @Inject('GET_SUGGESTION_USECASE')
    private readonly getSuggestionUseCase: GetSuggestionUseCase,
  ) {}

  @Post()
  async getSuggestion(@Body() dto: GetSuggestionDto): Promise<SuggestionDto> {
    const cmd = new GetSuggestionCmd(dto.metric, dto.labels, dto.data);
    const suggestion = await this.getSuggestionUseCase.getSuggestion(cmd);
    return SuggestionDto.fromDomain(suggestion);
  }
}
