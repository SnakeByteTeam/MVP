import { Test, TestingModule } from '@nestjs/testing';
import { SuggestionService } from './suggestion.service';
import { LLMSuggestionPort } from '../ports/out/llm-suggestion.port';
import { Suggestion } from 'src/suggestion/domain/suggestion.model';
import { GetSuggestionCmd } from '../commands/get-suggestion.cmd';

const mockLLMSuggestionPort: jest.Mocked<LLMSuggestionPort> = {
  generateSuggestion: jest.fn(),
};

describe('SuggestionService', () => {
  let service: SuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionService,
        {
          provide: 'LLM_SUGGESTION_PORT',
          useValue: mockLLMSuggestionPort,
        },
      ],
    }).compile();

    service = module.get<SuggestionService>(SuggestionService);
    jest.clearAllMocks();
  });

  describe('getSuggestion', () => {
    it('should return a Suggestion when the port resolves correctly', async () => {
      const cmd = new GetSuggestionCmd(
        'plant-consumption',
        ['2026-03-25', '2026-03-26'],
        ['120.00', '130.00'],
      );
      const expected = new Suggestion(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
        true,
      );
      mockLLMSuggestionPort.generateSuggestion.mockResolvedValue(expected);

      const result = await service.getSuggestion(cmd);

      expect(result).toBe(expected);
      expect(result.getMessage()).toBe(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
      );
      expect(result.getIsSuggestion()).toBe(true);
    });

    it('should return a Suggestion with isSuggestion false when no action is required', async () => {
      const cmd = new GetSuggestionCmd(
        'plant-consumption',
        ['2026-03-25', '2026-03-26'],
        ['65.00', '68.00'],
      );
      const expected = new Suggestion('No action required.', false);
      mockLLMSuggestionPort.generateSuggestion.mockResolvedValue(expected);

      const result = await service.getSuggestion(cmd);

      expect(result.getMessage()).toBe('No action required.');
      expect(result.getIsSuggestion()).toBe(false);
    });

    it('should call generateSuggestion on the port with the correct cmd', async () => {
      const cmd = new GetSuggestionCmd(
        'thermostat-temperature',
        ['2026-03-25'],
        ['26.5'],
      );
      mockLLMSuggestionPort.generateSuggestion.mockResolvedValue(
        new Suggestion('Set the thermostat to 20°C during the night.', true),
      );

      await service.getSuggestion(cmd);

      expect(mockLLMSuggestionPort.generateSuggestion).toHaveBeenCalledWith(
        cmd,
      );
    });

    it('should throw an error if the port returns a falsy value', async () => {
      const cmd = new GetSuggestionCmd(
        'plant-consumption',
        ['2026-03-25'],
        ['100.00'],
      );
      mockLLMSuggestionPort.generateSuggestion.mockResolvedValue(
        null as unknown as Suggestion,
      );

      await expect(service.getSuggestion(cmd)).rejects.toThrow(
        'No suggestion found for this metric: plant-consumption',
      );
    });

    it('should propagate errors thrown by the port', async () => {
      const cmd = new GetSuggestionCmd(
        'plant-consumption',
        ['2026-03-25'],
        ['100.00'],
      );
      mockLLMSuggestionPort.generateSuggestion.mockRejectedValue(
        new Error(
          'No baseline configuration found for metric: plant-consumption',
        ),
      );

      await expect(service.getSuggestion(cmd)).rejects.toThrow(
        'No baseline configuration found for metric: plant-consumption',
      );
    });
  });
});
