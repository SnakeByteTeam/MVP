import { Test, TestingModule } from '@nestjs/testing';
import { LLMSuggestionAdapter } from 'src/analytics/adapters/out/llm-suggestion.adapter';
import {
  GROQ_CLIENT,
  GroqClient,
} from 'src/analytics/infrastructure/groq/groq.client';
import { GroqSuggestionResultDto } from 'src/analytics/infrastructure/dtos/groq-suggestion-result.dto';
import { Suggestion } from 'src/analytics/domain/suggestion.model';
import { Series } from 'src/analytics/domain/series.model';
import { GetSuggestionCmd } from 'src/analytics/application/commands/get-suggestion.cmd';

const mockGroqClient: jest.Mocked<GroqClient> = {
  generateSuggestion: jest.fn(),
};

const buildCmd = (metric: string, data: number[]): GetSuggestionCmd =>
  new GetSuggestionCmd(
    metric === 'plant-consumption'
      ? 'Plant Consumption Analytics'
      : 'Thermostat Temperature',
    metric,
    metric === 'plant-consumption' ? 'Wh' : '°C',
    ['2026-03-25', '2026-03-26', '2026-03-27'],
    [new Series(metric, metric, data)],
  );

describe('LLMSuggestionAdapter', () => {
  let adapter: LLMSuggestionAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LLMSuggestionAdapter,
        {
          provide: GROQ_CLIENT,
          useValue: mockGroqClient,
        },
      ],
    }).compile();

    adapter = module.get<LLMSuggestionAdapter>(LLMSuggestionAdapter);
    jest.clearAllMocks();
  });

  describe('generateSuggestion', () => {
    it('should return a Suggestion with empty message and isSuggestion=false if the metric has no baseline configuration', async () => {
      const cmd = new GetSuggestionCmd(
        'Unknown',
        'unknown-metric',
        '',
        ['2026-03-25'],
        [new Series('unknown', 'Unknown', [100])],
      );

      const result = await adapter.generateSuggestion(cmd);

      expect(result).toBeInstanceOf(Suggestion);
      expect(result.getMessage()).toEqual([]);
      expect(result.getIsSuggestion()).toBe(false);
      expect(mockGroqClient.generateSuggestion).not.toHaveBeenCalled();
    });

    it('should map GroqSuggestionResult correctly to Suggestion when isSuggestion is true', async () => {
      const cmd = buildCmd('plant-consumption', [120, 130, 125]);
      const groqResult: GroqSuggestionResultDto = {
        message: ['Turn off the lights from 9:00 PM to 6:00 AM.'],
        isSuggestion: true,
      };
      mockGroqClient.generateSuggestion.mockResolvedValue(groqResult);

      const result = await adapter.generateSuggestion(cmd);

      expect(result).toBeInstanceOf(Suggestion);
      expect(result.getMessage()).toEqual([
        'Turn off the lights from 9:00 PM to 6:00 AM.',
      ]);
      expect(result.getIsSuggestion()).toBe(true);
    });

    it('should map GroqSuggestionResult correctly to Suggestion when isSuggestion is false', async () => {
      const cmd = buildCmd('plant-consumption', [65, 68, 66]);
      const groqResult: GroqSuggestionResultDto = {
        message: ['No action required.'],
        isSuggestion: false,
      };
      mockGroqClient.generateSuggestion.mockResolvedValue(groqResult);

      const result = await adapter.generateSuggestion(cmd);

      expect(result.getMessage()).toEqual(['No action required.']);
      expect(result.getIsSuggestion()).toBe(false);
    });

    it('should call groqClient with the correct cmd and baseline', async () => {
      const cmd = buildCmd('thermostat-temperature', [26.5]);
      const groqResult: GroqSuggestionResultDto = {
        message: ['Set the thermostat to 20°C during the night.'],
        isSuggestion: true,
      };
      mockGroqClient.generateSuggestion.mockResolvedValue(groqResult);

      await adapter.generateSuggestion(cmd);

      expect(mockGroqClient.generateSuggestion).toHaveBeenCalledWith(
        cmd,
        expect.objectContaining({ metric: 'thermostat-temperature' }),
      );
    });

    it('should propagate errors thrown by the groqClient', async () => {
      const cmd = buildCmd('plant-consumption', [120]);
      mockGroqClient.generateSuggestion.mockRejectedValue(
        new Error('Groq returned an invalid JSON response'),
      );

      await expect(adapter.generateSuggestion(cmd)).rejects.toThrow(
        'Groq returned an invalid JSON response',
      );
    });
  });
});
