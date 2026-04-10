import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { DeviceApiImpl } from 'src/device/infrastructure/http/device-api-impl';
import { DatapointApiResponse } from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';

describe('DeviceApiImpl', () => {
  let repo: DeviceApiImpl;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(() => {
    process.env.HOST3 = 'https://api.example.com';

    httpService = {
      get: jest.fn(),
      put: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    repo = new DeviceApiImpl(httpService);
  });

  afterEach(() => {
    delete process.env.HOST3;
    jest.restoreAllMocks();
  });

  describe('getDeviceValue', () => {
    it('should call external API and return only readable datapoints', async () => {
      const apiPayload: DatapointApiResponse = {
        meta: {
          collection: {
            offset: 0,
            items: 2,
            total: 2,
          },
        },
        data: [
          {
            id: 'dp-1',
            type: 'datapoint',
            attributes: {
              title: 'Power',
              readable: true,
              writable: true,
              value: 'On',
              timestamp: '2026-04-03T10:00:00Z',
              valueType: 'string',
            },
            meta: {
              'vimar:sfType': 'cmd',
              'vimar:sfeType': 'SFE_Cmd_OnOff',
            },
            relationships: {},
          },
          {
            id: 'dp-2',
            type: 'datapoint',
            attributes: {
              title: 'Hidden',
              readable: false,
              writable: true,
              value: '42',
              timestamp: '2026-04-03T10:00:00Z',
              valueType: 'number',
            },
            meta: {
              'vimar:sfType': 'sensor',
              'vimar:sfeType': 'SFE_Sensor',
            },
            relationships: {},
          },
        ],
      };

      const response: AxiosResponse<DatapointApiResponse> = {
        data: apiPayload,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      (httpService.get as jest.Mock).mockReturnValue(of(response));

      const result = await repo.getDeviceValue(
        'token-1',
        'plant-1',
        'device-1',
      );

      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.example.com/plant-1/functions/device-1/datapoints',
        {
          headers: { Authorization: 'Bearer token-1' },
        },
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('dp-1');
      expect(result[0].name).toBe('Power');
      expect(result[0].value).toBe('On');
    });

    it('should throw mapped error when API request fails', async () => {
      (httpService.get as jest.Mock).mockReturnValue(
        throwError(() => new Error('network error')),
      );

      await expect(
        repo.getDeviceValue('token-1', 'plant-1', 'device-99'),
      ).rejects.toThrow('[DEVICE API IMPL] Error requesting device-99 value');
    });
  });

  describe('writeDeviceValue', () => {
    it('should call Vimar endpoint and return true on success', async () => {
      const response: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      (httpService.put as jest.Mock).mockReturnValue(of(response));

      const result = await repo.writeDeviceValue(
        'token-1',
        'plant-1',
        'dp-1',
        'On',
      );

      expect(result).toBe(true);
      expect(httpService.put).toHaveBeenCalledWith(
        'https://api.example.com/plant-1/datapoints/values/',
        {
          data: [
            {
              id: 'dp-1',
              type: 'datapoint',
              attributes: {
                value: 'On',
              },
            },
          ],
        },
        {
          headers: {
            Authorization: 'Bearer token-1',
            'Content-Type': 'application/vnd.api+json',
            accept: 'application/vnd.api+json',
          },
        },
      );
    });

    it('should return false when API write fails', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      (httpService.put as jest.Mock).mockReturnValue(
        throwError(() => new Error('write failed')),
      );

      const result = await repo.writeDeviceValue(
        'token-1',
        'plant-1',
        'dp-1',
        'On',
      );

      expect(result).toBe(false);
      expect(logSpy).toHaveBeenCalled();
    });
  });
});
