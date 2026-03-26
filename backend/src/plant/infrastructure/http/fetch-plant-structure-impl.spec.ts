import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { FetchPlantStructureImpl } from './fetch-plant-structure-impl';

describe('FetchPlantStructureImpl', () => {
  let impl: FetchPlantStructureImpl;
  let httpService: jest.Mocked<Pick<HttpService, 'get'>>;

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
    };

    process.env.HOST3 = 'https://api.example.com';

    impl = new FetchPlantStructureImpl(httpService as unknown as HttpService);
  });

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
    expect(httpService.get).toHaveBeenNthCalledWith(
      1,
      'https://api.example.com/plant-1/locations',
      { headers: { Authorization: 'Bearer valid-token' } },
    );
    expect(httpService.get).toHaveBeenNthCalledWith(
      2,
      'https://api.example.com/plant-1/locations/room-1/functions',
      { headers: { Authorization: 'Bearer valid-token' } },
    );
    expect(httpService.get).toHaveBeenNthCalledWith(
      3,
      'https://api.example.com/plant-1/functions/device-1/datapoints',
      { headers: { Authorization: 'Bearer valid-token' } },
    );
  });

  it('should reject when http call throws', async () => {
    httpService.get.mockImplementationOnce(() => {
      throw new Error('http error');
    });

    await expect(impl.fetch('valid-token', 'plant-1')).rejects.toThrow(
      'http error',
    );
  });

  it('should fallback to empty host when HOST3 is not set', async () => {
    delete process.env.HOST3;
    const localImpl = new FetchPlantStructureImpl(
      httpService as unknown as HttpService,
    );

    httpService.get.mockReturnValueOnce(of({ data: null } as any));

    await localImpl.fetch('valid-token', 'plant-1');

    expect(httpService.get).toHaveBeenCalledWith('/plant-1/locations', {
      headers: { Authorization: 'Bearer valid-token' },
    });
  });

  it('should throw an error when room functions response has no data', async () => {
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
      .mockReturnValueOnce(of({ data: null } as any));

    await expect(() => impl.fetch('valid-token', 'plant-1')).rejects.toThrow();

  });

  it('should map device as null when datapoints response has no data', async () => {
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
            ],
          },
        } as any),
      )
      .mockReturnValueOnce(of({ data: null } as any));

    await expect(() =>  impl.fetch('valid-token', 'plant-1')).rejects.toThrow();
  });
});
