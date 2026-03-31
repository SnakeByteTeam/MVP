import { Test, TestingModule } from '@nestjs/testing';
import { SuggestionService } from './suggestion.service';
import { LLMSuggestionPort } from '../ports/out/llm-suggestion.port';
import { GetSuggestionCmd } from '../commands/get-suggestion.cmd';
import { Suggestion } from 'src/analytics/domain/suggestion.model';
import { Series } from 'src/analytics/domain/series.model';

const mockLLMPort: jest.Mocked<LLMSuggestionPort> = {
  generateSuggestion: jest.fn(),
};

const mockCmd = new GetSuggestionCmd(
  'Plant Consumption Analytics',
  'plant-consumption',
  'Wh',
  ['2026-03-25', '2026-03-26'],
  [new Series('plant-consumption', 'Consumption', [120, 130])],
);

describe('SuggestionService', () => {
  let service: SuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionService,
        {
          provide: 'LLM_SUGGESTION_PORT',
          useValue: mockLLMPort,
        },
      ],
    }).compile();

    service = module.get<SuggestionService>(SuggestionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSuggestion', () => {
    it('should return the suggestion from the LLM port', async () => {
      const suggestion = new Suggestion(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
        true,
      );
      mockLLMPort.generateSuggestion.mockResolvedValue(suggestion);

      const result = await service.getSuggestion(mockCmd);

      expect(result).toBe(suggestion);
      expect(result.getMessage()).toBe(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
      );
      expect(result.getIsSuggestion()).toBe(true);
    });

    it('should call generateSuggestion with the correct cmd', async () => {
      const suggestion = new Suggestion('No action required.', false);
      mockLLMPort.generateSuggestion.mockResolvedValue(suggestion);

      await service.getSuggestion(mockCmd);

      expect(mockLLMPort.generateSuggestion).toHaveBeenCalledTimes(1);
      expect(mockLLMPort.generateSuggestion).toHaveBeenCalledWith(mockCmd);
    });

    it('should throw when the LLM port returns a falsy value', async () => {
      mockLLMPort.generateSuggestion.mockResolvedValue(
        null as unknown as Suggestion,
      );

      await expect(service.getSuggestion(mockCmd)).rejects.toThrow(
        `No suggestion found for this metric: ${mockCmd.metric}`,
      );
    });

    it('should propagate errors thrown by the LLM port', async () => {
      mockLLMPort.generateSuggestion.mockRejectedValue(
        new Error('LLM port failed'),
      );

      await expect(service.getSuggestion(mockCmd)).rejects.toThrow(
        'LLM port failed',
      );
    });

    it('should return a suggestion with isSuggestion=false when no action is needed', async () => {
      const suggestion = new Suggestion('No action required.', false);
      mockLLMPort.generateSuggestion.mockResolvedValue(suggestion);

      const result = await service.getSuggestion(mockCmd);

      expect(result.getIsSuggestion()).toBe(false);
      expect(result.getMessage()).toBe('No action required.');
    });
  });
});
