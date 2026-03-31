import { Test, TestingModule } from '@nestjs/testing';
import { SuggestionController } from './suggestion.controller';
import { GetSuggestionUseCase } from 'src/suggestion/application/ports/in/get-suggestion.usecase';
import { Suggestion } from 'src/suggestion/domain/suggestion.model';
import { GetSuggestionDto } from 'src/suggestion/infrastructure/dtos/get-suggestion.dto';
import { SuggestionDto } from 'src/suggestion/infrastructure/dtos/suggestion.dto';

const mockGetSuggestionUseCase: jest.Mocked<GetSuggestionUseCase> = {
  getSuggestion: jest.fn(),
};

describe('SuggestionController', () => {
  let controller: SuggestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuggestionController],
      providers: [
        {
          provide: 'GET_SUGGESTION_USECASE',
          useValue: mockGetSuggestionUseCase,
        },
      ],
    }).compile();

    controller = module.get<SuggestionController>(SuggestionController);
    jest.clearAllMocks();
  });

  describe('getSuggestion', () => {
    it('should return a SuggestionDto when action is required', async () => {
      const dto: GetSuggestionDto = {
        metric: 'plant-consumption',
        labels: ['2026-03-25', '2026-03-26', '2026-03-27'],
        data: ['120.00', '130.00', '125.00'],
      };

      const suggestion = new Suggestion(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
        true,
      );
      mockGetSuggestionUseCase.getSuggestion.mockResolvedValue(suggestion);

      const result = await controller.getSuggestion(dto);

      expect(result).toBeInstanceOf(SuggestionDto);
      expect(result.message).toBe(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
      );
      expect(result.isSuggestion).toBe(true);
    });

    it('should return a SuggestionDto with isSuggestion false when no action is required', async () => {
      const dto: GetSuggestionDto = {
        metric: 'plant-consumption',
        labels: ['2026-03-25', '2026-03-26', '2026-03-27'],
        data: ['65.00', '68.00', '66.00'],
      };

      const suggestion = new Suggestion('No action required.', false);
      mockGetSuggestionUseCase.getSuggestion.mockResolvedValue(suggestion);

      const result = await controller.getSuggestion(dto);

      expect(result.message).toBe('No action required.');
      expect(result.isSuggestion).toBe(false);
    });

    it('should call getSuggestion with the correct cmd built from dto', async () => {
      const dto: GetSuggestionDto = {
        metric: 'thermostat-temperature',
        labels: ['2026-03-25'],
        data: ['26.5'],
      };

      const suggestion = new Suggestion(
        'Set the thermostat to 20°C during the night.',
        true,
      );
      mockGetSuggestionUseCase.getSuggestion.mockResolvedValue(suggestion);

      await controller.getSuggestion(dto);

      expect(mockGetSuggestionUseCase.getSuggestion).toHaveBeenCalledWith(
        expect.objectContaining({
          metric: 'thermostat-temperature',
          labels: ['2026-03-25'],
          data: ['26.5'],
        }),
      );
    });

    it('should propagate errors thrown by the use case', async () => {
      const dto: GetSuggestionDto = {
        metric: 'plant-consumption',
        labels: ['2026-03-25'],
        data: ['100.00'],
      };

      mockGetSuggestionUseCase.getSuggestion.mockRejectedValue(
        new Error(
          'No baseline configuration found for metric: plant-consumption',
        ),
      );

      await expect(controller.getSuggestion(dto)).rejects.toThrow(
        'No baseline configuration found for metric: plant-consumption',
      );
    });
  });
});
