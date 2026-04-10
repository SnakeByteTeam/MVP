import { Test, TestingModule } from '@nestjs/testing';
import { GroqClientImpl } from 'src/analytics/infrastructure/groq/groq-client.impl';
import { Series } from 'src/analytics/domain/series.model';
import { GetSuggestionCmd } from 'src/analytics/application/commands/get-suggestion.cmd';

const mockCurrent = new GetSuggestionCmd(
  'Plant Consumption Analytics',
  'plant-consumption',
  'Wh',
  ['2026-03-25', '2026-03-26', '2026-03-27'],
  [new Series('plant-consumption', 'Plant Consumption', [120, 130, 125])],
);

const mockBaseline = new GetSuggestionCmd(
  'Plant Consumption Analytics',
  'plant-consumption',
  'Wh',
  ['2026-03-25', '2026-03-26', '2026-03-27'],
  [new Series('plant-consumption', 'Plant Consumption', [65, 68, 66])],
);

describe('GroqClientImpl', () => {
  let groqClientImpl: GroqClientImpl;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroqClientImpl],
    }).compile();

    groqClientImpl = module.get<GroqClientImpl>(GroqClientImpl);
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSuggestion', () => {
    it('should return a valid GroqSuggestionResult when Groq responds correctly', async () => {
      const groqPayload = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                message: [
                  'Spegnere le luci dalle 21:00 alle 06:00.',
                  'Verificare che le luci siano spente nelle stanze non utilizzate.',
                ],
                isSuggestion: true,
              }),
            },
          },
        ],
      };

      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(groqPayload),
      } as unknown as Response);

      const result = await groqClientImpl.generateSuggestion(
        mockCurrent,
        mockBaseline,
      );

      expect(Array.isArray(result.message)).toBe(true);
      expect(result.message).toHaveLength(2);
      expect(result.message[0]).toBe(
        'Spegnere le luci dalle 21:00 alle 06:00.',
      );
      expect(result.isSuggestion).toBe(true);
    });

    it('should return isSuggestion false and empty message array when no action required', async () => {
      const groqPayload = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                message: [],
                isSuggestion: false,
              }),
            },
          },
        ],
      };

      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(groqPayload),
      } as unknown as Response);

      const result = await groqClientImpl.generateSuggestion(
        mockCurrent,
        mockBaseline,
      );

      expect(Array.isArray(result.message)).toBe(true);
      expect(result.message).toHaveLength(0);
      expect(result.isSuggestion).toBe(false);
    });

    it('should return empty suggestion when current has no series', async () => {
      const cmdNoSeries = new GetSuggestionCmd(
        'Plant Consumption Analytics',
        'plant-consumption',
        'Wh',
        [],
        [],
      );

      const result = await groqClientImpl.generateSuggestion(
        cmdNoSeries,
        mockBaseline,
      );

      expect(Array.isArray(result.message)).toBe(true);
      expect(result.message).toHaveLength(0);
      expect(result.isSuggestion).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return empty suggestion when series have no data', async () => {
      const cmdEmptyData = new GetSuggestionCmd(
        'Plant Consumption Analytics',
        'plant-consumption',
        'Wh',
        ['2026-03-25'],
        [new Series('plant-consumption', 'Plant Consumption', [])],
      );

      const result = await groqClientImpl.generateSuggestion(
        cmdEmptyData,
        mockBaseline,
      );

      expect(Array.isArray(result.message)).toBe(true);
      expect(result.message).toHaveLength(0);
      expect(result.isSuggestion).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return empty suggestion on rate limit (429)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        text: jest.fn().mockResolvedValue('Rate limit exceeded'),
      } as unknown as Response);

      const result = await groqClientImpl.generateSuggestion(
        mockCurrent,
        mockBaseline,
      );
      expect(result).toEqual({ message: [], isSuggestion: false });
    });

    it('should return empty suggestion on other API errors', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal server error'),
      } as unknown as Response);

      const result = await groqClientImpl.generateSuggestion(
        mockCurrent,
        mockBaseline,
      );
      expect(result).toEqual({ message: [], isSuggestion: false });
    });

    it('should return empty suggestion when series have no data', async () => {
      const cmdEmptyData = new GetSuggestionCmd(
        'Plant Consumption Analytics',
        'plant-consumption',
        'Wh',
        ['2026-03-25'],
        [new Series('plant-consumption', 'Plant Consumption', [])],
      );

      const result = await groqClientImpl.generateSuggestion(
        cmdEmptyData,
        mockBaseline,
      );
      expect(result).toEqual({ message: [], isSuggestion: false });
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
