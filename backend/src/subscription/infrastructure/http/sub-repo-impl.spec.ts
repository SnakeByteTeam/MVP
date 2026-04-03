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
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    // Mock environment variables
    process.env.HOST3 = 'https://api.example.com';
    process.env.DATAPOINT_SUB_CALLBACK = 'https://callback.example.com';
    process.env.NODE_SUB_CALLBACK = 'https://node-callback.example.com';
    process.env.SECRET_FOR_SUB = 'secret-password';

    repo = new SubscriptionRepoImpl(httpService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.HOST3;
    delete process.env.DATAPOINT_SUB_CALLBACK;
    delete process.env.NODE_SUB_CALLBACK;
    delete process.env.SECRET_FOR_SUB;
    jest.restoreAllMocks();
  });

  describe('refreshSub', () => {
    it('should create node subscription successfully', async () => {
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
              url: 'https://node-callback.example.com',
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
      expect(consoleSpy).toHaveBeenCalledWith(
        'New subscription created for plant plant-1',
      );
    });

    it('should return false when HTTP request fails for refreshSub', async () => {
      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      const result = await repo.refreshSub('valid-token', 'plant-1');

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to create subscription for plant plant-1',
      );
    });

    it('should throw error when SECRET_FOR_SUB is missing', async () => {
      delete process.env.SECRET_FOR_SUB;
      const newRepo = new SubscriptionRepoImpl(httpService);

      const result = await newRepo.refreshSub('valid-token', 'plant-1');

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to create subscription for plant plant-1',
      );
    });

    it('should throw error when NODE_SUB_CALLBACK is missing', async () => {
      delete process.env.NODE_SUB_CALLBACK;
      const newRepo = new SubscriptionRepoImpl(httpService);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await newRepo.refreshSub('valid-token', 'plant-1');

      expect(result).toBe(false);
    });

    it('should handle correct payload structure for node subscription', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 'sub-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockResponse));

      await repo.refreshSub('token-xyz', 'plant-xyz');

      const callArgs = (httpService.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].data.type).toBe('subscription');
      expect(callArgs[1].data.relationships.subscriptionNode.data.id).toBe(
        'plant-xyz',
      );
      expect(callArgs[2].headers.Authorization).toBe('Bearer token-xyz');
    });
  });

  describe('refreshDatapointSub', () => {
    it('should create datapoint subscription successfully', async () => {
      const locationsResponse: AxiosResponse = {
        data: {
          data: [
            {
              id: 'loc-123',
              type: 'location',
              attributes: { name: 'Main Room' },
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const subscriptionResponse: AxiosResponse = {
        data: { id: 'sub-dp-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.get as jest.Mock).mockReturnValue(of(locationsResponse));
      (httpService.post as jest.Mock).mockReturnValue(of(subscriptionResponse));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await repo.refreshDatapointSub('valid-token', 'plant-1');

      expect(result).toBe(true);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.example.com/plant-1/locations/',
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' },
        }),
      );
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.example.com/plant-1/subscriptions',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'subscription',
            relationships: {
              subscriptionDatapoints: {
                data: [
                  {
                    id: 'loc-123',
                    type: 'location',
                    meta: { expand: true },
                  },
                ],
              },
            },
            attributes: expect.objectContaining({
              url: 'https://callback.example.com',
              secret: 'secret-password',
            }),
          }),
        }),
        expect.any(Object),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'New subscription created for datapoints of plant plant-1',
      );
    });

    it('should return false when locations request fails', async () => {
      (httpService.get as jest.Mock).mockReturnValue(
        throwError(() => new Error('Location fetch failed')),
      );
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await repo.refreshDatapointSub('valid-token', 'plant-1');

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to create subscription for datapoints of plant plant-1',
      );
    });

    it('should return false when subscription creation fails', async () => {
      const locationsResponse: AxiosResponse = {
        data: {
          data: [{ id: 'loc-123', type: 'location' }],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      (httpService.get as jest.Mock).mockReturnValue(of(locationsResponse));
      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => new Error('Subscription failed')),
      );
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await repo.refreshDatapointSub('valid-token', 'plant-1');

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to create subscription for datapoints of plant plant-1',
      );
    });

    it('should throw error when location data is missing', async () => {
      const emptyLocationsResponse: AxiosResponse = {
        data: { data: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      (httpService.get as jest.Mock).mockReturnValue(
        of(emptyLocationsResponse),
      );
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await repo.refreshDatapointSub('valid-token', 'plant-1');

      expect(result).toBe(false);
    });

    it('should throw error when DATAPOINT_SUB_CALLBACK is missing', async () => {
      delete process.env.DATAPOINT_SUB_CALLBACK;
      const newRepo = new SubscriptionRepoImpl(httpService);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await newRepo.refreshDatapointSub(
        'valid-token',
        'plant-1',
      );

      expect(result).toBe(false);
    });

    it('should use correct location id from locations response', async () => {
      const locationsResponse: AxiosResponse = {
        data: {
          data: [
            {
              id: 'loc-special-id-456',
              type: 'location',
              attributes: { name: 'Second Room' },
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const subscriptionResponse: AxiosResponse = {
        data: { id: 'sub-dp-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.get as jest.Mock).mockReturnValue(of(locationsResponse));
      (httpService.post as jest.Mock).mockReturnValue(of(subscriptionResponse));

      await repo.refreshDatapointSub('valid-token', 'plant-1');

      const callArgs = (httpService.post as jest.Mock).mock.calls[0];
      expect(
        callArgs[1].data.relationships.subscriptionDatapoints.data[0].id,
      ).toBe('loc-special-id-456');
    });

    it('should include authorization header in locations request', async () => {
      const locationsResponse: AxiosResponse = {
        data: { data: [{ id: 'loc-123', type: 'location' }] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const subscriptionResponse: AxiosResponse = {
        data: { id: 'sub-dp-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      (httpService.get as jest.Mock).mockReturnValue(of(locationsResponse));
      (httpService.post as jest.Mock).mockReturnValue(of(subscriptionResponse));

      await repo.refreshDatapointSub('token-dp', 'plant-2');

      expect(httpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: 'Bearer token-dp' },
        }),
      );
    });
  });
});
