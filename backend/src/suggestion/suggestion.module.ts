import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuggestionController } from './adapters/in/suggestion.controller';
import { SuggestionService } from './application/services/suggestion.service';
import { GET_SUGGESTION_USECASE } from './application/ports/in/get-suggestion.usecase';
import { LLM_SUGGESTION_PORT } from './application/ports/out/llm-suggestion.port';
import { LLMSuggestionAdapter } from './adapters/out/llm-suggestion.adapter';
import { GroqClientImpl } from './infrastructure/groq/groq-client.impl';
import { GROQ_CLIENT } from './infrastructure/groq/groq.client';

@Module({
  imports: [ConfigModule],
  controllers: [SuggestionController],
  providers: [
    {
      provide: GET_SUGGESTION_USECASE,
      useClass: SuggestionService,
    },
    {
      provide: LLM_SUGGESTION_PORT,
      useClass: LLMSuggestionAdapter,
    },
    {
      provide: GROQ_CLIENT,
      useClass: GroqClientImpl,
    },
  ],
})
export class SuggestionModule {}
