import { GetDeviceValueAdapter } from './get-device-value.adapter';
import { GetDeviceValueRepoPort } from 'src/device/application/repository/get-device-value.repository';
import { GetValidTokenPort } from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { DatapointExtractedDto } from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';

describe('GetDeviceValueAdapter', () => {
  let adapter: GetDeviceValueAdapter;
  let repoPort: jest.Mocked<GetDeviceValueRepoPort>;
  let tokenPort: jest.Mocked<GetValidTokenPort>;

  beforeEach(() => {
    repoPort = {
      getDeviceValue: jest.fn(),
    };

    tokenPort = {
      getValidToken: jest.fn(),
    };

    adapter = new GetDeviceValueAdapter(repoPort, tokenPort);
  });

  it('should throw when deviceId or plantId is missing', async () => {
    await expect(
      adapter.getDeviceValue({ deviceId: 'device-1' }),
    ).rejects.toThrow('[GET DEVICE VALUE ADAPTER] Some parameters are null');
  });

  it('should throw when valid token is missing', async () => {
    tokenPort.getValidToken.mockResolvedValue(null);

    await expect(
      adapter.getDeviceValue({ deviceId: 'device-1', plantId: 'plant-1' }),
    ).rejects.toThrow('[GET DEVICE VALUE ADAPTER] Token is null');
  });

  it('should fetch data from repository and map to domain model', async () => {
    tokenPort.getValidToken.mockResolvedValue('token-123');
    repoPort.getDeviceValue.mockResolvedValue([
      new DatapointExtractedDto('dp-1', 'Power', 'On'),
      new DatapointExtractedDto('dp-2', 'Brightness', 85),
    ]);

    const result = await adapter.getDeviceValue({
      deviceId: 'device-1',
      plantId: 'plant-1',
    });

    expect(repoPort.getDeviceValue).toHaveBeenCalledWith(
      'token-123',
      'plant-1',
      'device-1',
    );
    expect(result.getDeviceId()).toBe('device-1');
    expect(result.getValues()).toHaveLength(2);
    expect(result.getValues()[0].getDatapointId()).toBe('dp-1');
    expect(result.getValues()[1].getValue()).toBe(85);
  });

  it('should propagate repository errors', async () => {
    tokenPort.getValidToken.mockResolvedValue('token-123');
    repoPort.getDeviceValue.mockRejectedValue(new Error('repo failed'));

    await expect(
      adapter.getDeviceValue({ deviceId: 'device-1', plantId: 'plant-1' }),
    ).rejects.toThrow('repo failed');
  });
});
