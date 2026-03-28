import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroqClientImpl } from './groq-client.impl';
import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('mock-groq-api-key'),
};

const mockCurrent = new GetSuggestionCmd(
  'plant-consumption',
  ['2026-03-25', '2026-03-26', '2026-03-27'],
  ['120.00', '130.00', '125.00'],
);

const mockBaseline = new GetSuggestionCmd(
  'plant-consumption',
  ['2026-03-25', '2026-03-26', '2026-03-27'],
  ['65.00', '68.00', '66.00'],
);

describe('GroqClientImpl', () => {
  let groqClientImpl: GroqClientImpl;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroqClientImpl,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    groqClientImpl = module.get<GroqClientImpl>(GroqClientImpl);
    fetchSpy = jest.spyOn(global, 'fetch');
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
                message: 'Turn off the lights from 9:00 PM to 6:00 AM.',
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

      expect(result.message).toBe(
        'Turn off the lights from 9:00 PM to 6:00 AM.',
      );
      expect(result.isSuggestion).toBe(true);
    });

    it('should return isSuggestion false when Groq responds with no action required', async () => {
      const groqPayload = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                message: 'No action required.',
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

      expect(result.message).toBe('No action required.');
      expect(result.isSuggestion).toBe(false);
    });

    it('should throw HttpException with TOO_MANY_REQUESTS on 429', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        text: jest.fn().mockResolvedValue('Rate limit exceeded'),
      } as unknown as Response);

      await expect(
        groqClientImpl.generateSuggestion(mockCurrent, mockBaseline),
      ).rejects.toThrow(
        new HttpException(
          'The analysis service is temporarily unavailable. Please try again in a few minutes.',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR on generic API error', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal server error'),
      } as unknown as Response);

      await expect(
        groqClientImpl.generateSuggestion(mockCurrent, mockBaseline),
      ).rejects.toThrow(
        new HttpException(
          'An error occurred while generating the suggestion.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should throw an error when Groq returns an empty response', async () => {
      const groqPayload = {
        choices: [{ message: { content: '' } }],
      };

      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(groqPayload),
      } as unknown as Response);

      await expect(
        groqClientImpl.generateSuggestion(mockCurrent, mockBaseline),
      ).rejects.toThrow('Groq returned an empty response');
    });

    it('should throw an error when Groq returns invalid JSON', async () => {
      const groqPayload = {
        choices: [{ message: { content: 'not a json string' } }],
      };

      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(groqPayload),
      } as unknown as Response);

      await expect(
        groqClientImpl.generateSuggestion(mockCurrent, mockBaseline),
      ).rejects.toThrow('Groq returned an invalid JSON response');
    });

    it('should throw an error when Groq JSON is missing required fields', async () => {
      const groqPayload = {
        choices: [
          {
            message: {
              content: JSON.stringify({ message: 'some message' }),
            },
          },
        ],
      };

      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(groqPayload),
      } as unknown as Response);

      await expect(
        groqClientImpl.generateSuggestion(mockCurrent, mockBaseline),
      ).rejects.toThrow('Groq returned an invalid JSON response');
    });
  });
});
