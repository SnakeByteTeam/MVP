import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { FetchStructureCacheImpl } from './fetch-plant-structure-impl';

describe('FetchStructureCacheImpl', () => {
  let impl: FetchStructureCacheImpl;
  let httpService: jest.Mocked<Pick<HttpService, 'get'>>;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    httpService = {
      get: jest.fn(),
    };

    process.env.HOST3 = 'https://api.example.com';

    impl = new FetchStructureCacheImpl(httpService as unknown as HttpService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetch', () => {
    it('should return null when locations response has no data', async () => {
      httpService.get.mockReturnValueOnce(of({ data: null } as any));

      const result = await impl.fetch('valid-token', 'plant-1');

      expect(result).toBeNull();
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.example.com/plant-1/locations',
        { headers: { Authorization: 'Bearer valid-token' } },
      );
    });

    it('should fetch and map plant structure from api', async () => {
      httpService.get
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'room-1',
                  attributes: { title: 'Living Room' },
                  meta: { '@type': ['loc:Location'] },
                },
                {
                  id: 'not-a-room',
                  attributes: { title: 'Ignored' },
                  meta: { '@type': ['other:type'] },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'device-1',
                  attributes: { title: 'Lamp' },
                  meta: {
                    'vimar:ssType': 'SF_Light',
                    'vimar:sfType': 'SS_Light_Switch',
                  },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'dp-1',
                  attributes: {
                    title: 'Power',
                    readable: true,
                    writable: true,
                    enum: ['Off', 'On'],
                    valueType: 'string',
                  },
                  meta: { 'vimar:sfeType': 'SFE_Cmd_OnOff' },
                },
              ],
            },
          } as any),
        );

      const result = await impl.fetch('valid-token', 'plant-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('plant-1');
      expect(result?.name).toBe('Living Room');
      expect(result?.rooms).toHaveLength(1);
      expect(result?.rooms[0]?.id).toBe('room-1');
      expect(result?.rooms[0]?.devices).toHaveLength(1);
      expect(result?.rooms[0]?.devices[0]?.id).toBe('device-1');
      expect(result?.rooms[0]?.devices[0]?.subType).toBe('SS_Light_Switch');
      expect(result?.rooms[0]?.devices[0]?.datapoints).toHaveLength(1);

      expect(httpService.get).toHaveBeenCalledTimes(3);
    });

    it('should return null when initial locations call throws', async () => {
      httpService.get.mockImplementationOnce(() => {
        throw new Error('http error');
      });

      const result = await impl.fetch('valid-token', 'plant-1');

      expect(result).toBeNull();
    });

    it('should fallback to empty host when HOST3 is not set', async () => {
      delete process.env.HOST3;
      const localImpl = new FetchStructureCacheImpl(
        httpService as unknown as HttpService,
      );

      httpService.get.mockReturnValueOnce(of({ data: null } as any));

      await localImpl.fetch('valid-token', 'plant-1');

      expect(httpService.get).toHaveBeenCalledWith('/plant-1/locations', {
        headers: { Authorization: 'Bearer valid-token' },
      });
    });

    it('should return null when any room fetch fails with Promise.all()', async () => {
      httpService.get
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'room-1',
                  attributes: { title: 'Living Room' },
                  meta: { '@type': ['loc:Location'] },
                },
                {
                  id: 'room-2',
                  attributes: { title: 'Bedroom' },
                  meta: { '@type': ['loc:Location'] },
                },
              ],
            },
          } as any),
        )
        .mockImplementationOnce(() => {
          throw new Error('room-1 fetch failed');
        });

      const result = await impl.fetch('valid-token', 'plant-1');

      // Promise.all() fails if any room fails
      expect(result).toBeNull();
    });

    it('should return null when any device fetch fails with Promise.all()', async () => {
      httpService.get
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'room-1',
                  attributes: { title: 'Living Room' },
                  meta: { '@type': ['loc:Location'] },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'device-1',
                  attributes: { title: 'Lamp' },
                  meta: {
                    'vimar:ssType': 'SF_Light',
                    'vimar:sfType': 'SS_Light_Switch',
                  },
                },
                {
                  id: 'device-2',
                  attributes: { title: 'Switch' },
                  meta: {
                    'vimar:ssType': 'SF_Switch',
                    'vimar:sfType': 'SS_Control_Switch',
                  },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'dp-1',
                  attributes: {
                    title: 'Power',
                    readable: true,
                    writable: true,
                    enum: ['Off', 'On'],
                    valueType: 'string',
                  },
                  meta: { 'vimar:sfeType': 'SFE_Cmd_OnOff' },
                },
              ],
            },
          } as any),
        )
        .mockImplementationOnce(() => {
          throw new Error('device-2 fetch timeout');
        });

      const result = await impl.fetch('valid-token', 'plant-1');

      // Promise.all() fails if any device fails
      expect(result).toBeNull();
    });

    it('should fetch multiple rooms in parallel', async () => {
      httpService.get
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'room-1',
                  attributes: { title: 'Living Room' },
                  meta: { '@type': ['loc:Location'] },
                },
                {
                  id: 'room-2',
                  attributes: { title: 'Bedroom' },
                  meta: { '@type': ['loc:Location'] },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'device-1',
                  attributes: { title: 'Lamp' },
                  meta: {
                    'vimar:ssType': 'SF_Light',
                    'vimar:sfType': 'SS_Light_Switch',
                  },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'dp-1',
                  attributes: {
                    title: 'Power',
                    readable: true,
                    writable: true,
                    enum: ['Off', 'On'],
                    valueType: 'string',
                  },
                  meta: { 'vimar:sfeType': 'SFE_Cmd_OnOff' },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'device-2',
                  attributes: { title: 'Switch' },
                  meta: {
                    'vimar:ssType': 'SF_Switch',
                    'vimar:sfType': 'SS_Control_Switch',
                  },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'dp-2',
                  attributes: {
                    title: 'Active',
                    readable: true,
                    writable: false,
                    enum: null,
                    valueType: 'boolean',
                  },
                  meta: { 'vimar:sfeType': 'SFE_Status' },
                },
              ],
            },
          } as any),
        );

      const result = await impl.fetch('valid-token', 'plant-1');

      expect(result).not.toBeNull();
      expect(result?.rooms).toHaveLength(2);
      expect(result?.rooms[0]?.id).toBe('room-1');
      expect(result?.rooms[1]?.id).toBe('room-2');
      expect(result?.rooms[0]?.devices).toHaveLength(1);
      expect(result?.rooms[1]?.devices).toHaveLength(1);
    });

    it('should filter out non-location items', async () => {
      httpService.get
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'room-1',
                  attributes: { title: 'Living Room' },
                  meta: { '@type': ['loc:Location'] },
                },
                {
                  id: 'not-location',
                  attributes: { title: 'Something Else' },
                  meta: { '@type': ['other:Type'] },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'device-1',
                  attributes: { title: 'Lamp' },
                  meta: {
                    'vimar:ssType': 'SF_Light',
                    'vimar:sfType': 'SS_Light_Switch',
                  },
                },
              ],
            },
          } as any),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [
                {
                  id: 'dp-1',
                  attributes: {
                    title: 'Power',
                    readable: true,
                    writable: true,
                    enum: ['Off', 'On'],
                    valueType: 'string',
                  },
                  meta: { 'vimar:sfeType': 'SFE_Cmd_OnOff' },
                },
              ],
            },
          } as any),
        );

      const result = await impl.fetch('valid-token', 'plant-1');

      // Only room-1 should be fetched, not-location should be filtered
      expect(result?.rooms).toHaveLength(1);
      expect(result?.rooms[0]?.id).toBe('room-1');
    });
  });

  describe('getAllPlantIds', () => {
    afterEach(() => {
      delete process.env.PLANT_DOMAIN;
    });

    it('should fetch and return plant ids from plant domain', async () => {
      httpService.get.mockReturnValueOnce(
        of({
          data: {
            api: {
              templates: {
                plantId: {
                  values: ['plant-1', 'plant-2', 'plant-3'],
                },
              },
            },
          },
        } as any),
      );

      const result = await impl.getAllPlantIds('valid-token');

      expect(result).toEqual(['plant-1', 'plant-2', 'plant-3']);
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith('', {
        headers: { Authorization: 'Bearer valid-token' },
      });
    });

    it('should return empty array when no plant ids found', async () => {
      httpService.get.mockReturnValueOnce(
        of({
          data: {
            api: {
              templates: {
                plantId: {
                  values: [],
                },
              },
            },
          },
        } as any),
      );

      const result = await impl.getAllPlantIds('valid-token');

      expect(result).toEqual([]);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should use PLANT_DOMAIN env var when set', async () => {
      process.env.PLANT_DOMAIN = 'https://plant-api.example.com/plants';
      const localImpl = new FetchStructureCacheImpl(
        httpService as unknown as HttpService,
      );

      httpService.get.mockReturnValueOnce(
        of({
          data: {
            api: {
              templates: {
                plantId: {
                  values: ['plant-1'],
                },
              },
            },
          },
        } as any),
      );

      const result = await localImpl.getAllPlantIds('valid-token');

      expect(result).toEqual(['plant-1']);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://plant-api.example.com/plants',
        {
          headers: { Authorization: 'Bearer valid-token' },
        },
      );
    });

    it('should throw error when api call fails', async () => {
      httpService.get.mockImplementationOnce(() => {
        throw new Error('network error');
      });

      await expect(impl.getAllPlantIds('valid-token')).rejects.toThrow(
        'network error',
      );
    });

    it('should throw error when response structure is invalid', async () => {
      httpService.get.mockReturnValueOnce(
        of({
          data: {
            invalid: 'structure',
          },
        } as any),
      );

      await expect(impl.getAllPlantIds('valid-token')).rejects.toThrow();
    });

    it('should include authorization header with token', async () => {
      httpService.get.mockReturnValueOnce(
        of({
          data: {
            api: {
              templates: {
                plantId: {
                  values: [],
                },
              },
            },
          },
        } as any),
      );

      await impl.getAllPlantIds('my-secret-token');

      expect(httpService.get).toHaveBeenCalledWith('', {
        headers: { Authorization: 'Bearer my-secret-token' },
      });
    });
  });
});
