import { HttpService } from '@nestjs/axios';
import { of, timeout } from 'rxjs';
import { FetchStructureCacheImpl } from './fetch-plant-structure-impl';

describe('FetchStructureCacheImpl', () => {
  let impl: FetchStructureCacheImpl;
  let httpService: jest.Mocked<Pick<HttpService, 'get'>>;

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
    };

    process.env.HOST3 = 'https://api.example.com';

    impl = new FetchStructureCacheImpl(httpService as unknown as HttpService);
  });

  it('should return null when locations response has no data', async () => {
    httpService.get.mockReturnValueOnce(of({ data: null } as any));

    const result = await impl.fetch('valid-token', 'plant-1');

    expect(result).toBeNull();
    expect(httpService.get).toHaveBeenCalledTimes(1);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.example.com/plant-1/locations',
      { headers: { Authorization: 'Bearer valid-token' }, timeout: 30000 },
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
      { headers: { Authorization: 'Bearer valid-token' }, timeout: 30000 },
    );
    expect(httpService.get).toHaveBeenNthCalledWith(
      2,
      'https://api.example.com/plant-1/locations/room-1/functions',
      { headers: { Authorization: 'Bearer valid-token' }, timeout: 30000 },
    );
    expect(httpService.get).toHaveBeenNthCalledWith(
      3,
      'https://api.example.com/plant-1/functions/device-1/datapoints',
      { headers: { Authorization: 'Bearer valid-token' }, timeout: 30000 },
    );
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
      timeout: 30000,
    });
  });

  it('should skip room when functions response has no data', async () => {
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
      .mockReturnValueOnce(of({ data: null } as any)) // room-1 fails
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

    // room-1 should be skipped, room-2 should be included
    expect(result).not.toBeNull();
    expect(result?.rooms).toHaveLength(1);
    expect(result?.rooms[0]?.id).toBe('room-2');
    expect(result?.rooms[0]?.devices).toHaveLength(1);
  });

  it('should skip device when datapoints response has no data', async () => {
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
      .mockReturnValueOnce(of({ data: null } as any)) // device-1 fails
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

    // device-1 should be skipped, room should have only device-2
    expect(result).not.toBeNull();
    expect(result?.rooms).toHaveLength(1);
    expect(result?.rooms[0]?.devices).toHaveLength(1);
    expect(result?.rooms[0]?.devices[0]?.id).toBe('device-2');
  });

  it('should skip room when it throws an error', async () => {
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
      })
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

    // room-1 should be skipped due to error, room-2 should be included
    expect(result).not.toBeNull();
    expect(result?.rooms).toHaveLength(1);
    expect(result?.rooms[0]?.id).toBe('room-2');
  });

  it('should skip device when it throws an error', async () => {
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
      .mockImplementationOnce(() => {
        throw new Error('device-1 fetch timeout');
      })
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

    // device-1 should be skipped due to error, device-2 should be included
    expect(result).not.toBeNull();
    expect(result?.rooms).toHaveLength(1);
    expect(result?.rooms[0]?.devices).toHaveLength(1);
    expect(result?.rooms[0]?.devices[0]?.id).toBe('device-2');
  });
});
