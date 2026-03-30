import { Test, TestingModule } from '@nestjs/testing';
import { LLMSuggestionAdapter } from './llm-suggestion.adapter';
import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';
import { Suggestion } from 'src/suggestion/domain/suggestion.model';
import {
  GROQ_CLIENT,
  GroqClient,
} from 'src/suggestion/infrastructure/groq/groq.client';
import { GroqSuggestionResult } from 'src/suggestion/infrastructure/dtos/groq-suggestion-result.dto';

const mockGroqClient: jest.Mocked<GroqClient> = {
  generateSuggestion: jest.fn(),
};

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
    it('should throw an error if the metric has no baseline configuration', async () => {
      const cmd = new GetSuggestionCmd(
        'unknown-metric',
        ['2026-03-25'],
        ['100.00'],
      );

      await expect(adapter.generateSuggestion(cmd)).rejects.toThrow(
        'No baseline configuration found for metric: unknown-metric',
      );
      expect(mockGroqClient.generateSuggestion).not.toHaveBeenCalled();
    });

    it('should map GroqSuggestionResult correctly to Suggestion when isSuggestion is true', async () => {
      const cmd = new GetSuggestionCmd(
        'plant-consumption',
        ['2026-03-25', '2026-03-26', '2026-03-27'],
        ['120.00', '130.00', '125.00'],
      );
      const groqResult: GroqSuggestionResult = {
        message: 'Turn off the lights from 9:00 PM to 6:00 AM.',
        isSuggestion: true,
      };
      mockGroqClient.generateSuggestion.mockResolvedValue(groqResult);

      const result = await adapter.generateSuggestion(cmd);

      expect(result).toBeInstanceOf(Suggestion);
      expect(result.getMessage()).toBe(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
      );
      expect(result.getIsSuggestion()).toBe(true);
    });

    it('should map GroqSuggestionResult correctly to Suggestion when isSuggestion is false', async () => {
      const cmd = new GetSuggestionCmd(
        'plant-consumption',
        ['2026-03-25', '2026-03-26', '2026-03-27'],
        ['65.00', '68.00', '66.00'],
      );
      const groqResult: GroqSuggestionResult = {
        message: 'No action required.',
        isSuggestion: false,
      };
      mockGroqClient.generateSuggestion.mockResolvedValue(groqResult);

      const result = await adapter.generateSuggestion(cmd);

      expect(result.getMessage()).toBe('No action required.');
      expect(result.getIsSuggestion()).toBe(false);
    });

    it('should call groqClient with the correct cmd and baseline', async () => {
      const cmd = new GetSuggestionCmd(
        'thermostat-temperature',
        ['2026-03-25'],
        ['26.5'],
      );
      const groqResult: GroqSuggestionResult = {
        message: 'Set the thermostat to 20°C during the night.',
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
      const cmd = new GetSuggestionCmd(
        'plant-consumption',
        ['2026-03-25'],
        ['120.00'],
      );
      mockGroqClient.generateSuggestion.mockRejectedValue(
        new Error('Groq returned an invalid JSON response'),
      );

      await expect(adapter.generateSuggestion(cmd)).rejects.toThrow(
        'Groq returned an invalid JSON response',
      );
    });
  });
});
