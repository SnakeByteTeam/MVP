import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { SubscriptionRepoImpl } from './sub-repo-impl';

describe('SubscriptionRepoImpl', () => {
  let repo: SubscriptionRepoImpl;
  let httpService: jest.Mocked<HttpService>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    httpService = {
      post: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    // Mock environment variables
    process.env.HOST3 = 'https://api.example.com';
    process.env.SUB_CALLBACK = 'https://callback.example.com';
    process.env.SECRET_FOR_SUB = 'secret-password';

    repo = new SubscriptionRepoImpl(httpService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.HOST3;
    delete process.env.SUB_CALLBACK;
    delete process.env.SECRET_FOR_SUB;
  });

  describe('refreshSub', () => {
    it('should create subscription successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 'sub-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockResponse));

      const result = await repo.refreshSub('valid-token', 'plant-1');

      expect(result).toBe(true);
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.example.com/plant-1/subscriptions',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'subscription',
            relationships: {
              subscriptionNode: {
                data: {
                  id: 'plant-1',
                  type: 'service',
                },
              },
            },
            attributes: expect.objectContaining({
              url: 'https://callback.example.com',
              lifetime: 0,
              secret: 'secret-password',
            }),
          }),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        }),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('New subscription created for plant plant-1'),
      );
    });

    it('should return false when HTTP request fails', async () => {
      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      const result = await repo.refreshSub('valid-token', 'plant-1');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create subscription');
    });

    it('should return false when SECRET_FOR_SUB is not set', async () => {
      delete process.env.SECRET_FOR_SUB;
      const newRepo = new SubscriptionRepoImpl(httpService);

      const result = await newRepo.refreshSub('valid-token', 'plant-1');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create subscription');
    });

    it('should use default empty string for HOST3 when not set', async () => {
      delete process.env.HOST3;
      const mockResponse: AxiosResponse = {
        data: { id: 'sub-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockResponse));

      const newRepo = new SubscriptionRepoImpl(httpService);
      const result = await newRepo.refreshSub('valid-token', 'plant-1');

      expect(result).toBe(true);
      expect(httpService.post).toHaveBeenCalledWith(
        '/plant-1/subscriptions',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should set correct headers in HTTP request', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 'sub-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockResponse));

      await repo.refreshSub('my-token', 'plant-1');

      const callArgs = (httpService.post as jest.Mock).mock.calls[0];
      expect(callArgs[2].headers).toEqual({
        accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: 'Bearer my-token',
      });
    });

    it('should construct correct payload for multiple plants', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 'sub-2' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockResponse));

      await repo.refreshSub('token', 'plant-xyz');

      const callArgs = (httpService.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].data.relationships.subscriptionNode.data.id).toBe(
        'plant-xyz',
      );
    });
  });
});
