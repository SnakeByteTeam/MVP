import { WriteDatapointValueAdapter } from './write-datapoint-value.adapter';
import { WriteDatapointValueRepoPort } from 'src/device/application/repository/write-datapoint-value.repo';
import { GetValidTokenPort } from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';

describe('WriteDatapointValueAdapter', () => {
  let adapter: WriteDatapointValueAdapter;
  let repoPort: jest.Mocked<WriteDatapointValueRepoPort>;
  let tokenPort: jest.Mocked<GetValidTokenPort>;

  beforeEach(() => {
    repoPort = {
      writeDeviceValue: jest.fn(),
    };

    tokenPort = {
      getValidToken: jest.fn(),
    };

    adapter = new WriteDatapointValueAdapter(repoPort, tokenPort);
  });

  it('should throw when token is missing', async () => {
    tokenPort.getValidToken.mockResolvedValue(null);

    await expect(
      adapter.writeDatapointValue({
        plantId: 'plant-1',
        datapointId: 'dp-1',
        value: 'On',
      }),
    ).rejects.toThrow('[WRITE DATAPOINT ADAPTER] Token is null');
  });

  it('should throw when plantId is missing', async () => {
    tokenPort.getValidToken.mockResolvedValue('token-1');

    await expect(
      adapter.writeDatapointValue({
        datapointId: 'dp-1',
        value: 'On',
      }),
    ).rejects.toThrow(
      "[WRITE DATAPOINT ADAPTER] Can't write datapoint value without plantId",
    );
  });

  it('should write datapoint value when token and plantId are present', async () => {
    tokenPort.getValidToken.mockResolvedValue('token-1');
    repoPort.writeDeviceValue.mockResolvedValue(true);

    await adapter.writeDatapointValue({
      plantId: 'plant-1',
      datapointId: 'dp-1',
      value: 'On',
    });

    expect(repoPort.writeDeviceValue).toHaveBeenCalledWith(
      'token-1',
      'plant-1',
      'dp-1',
      'On',
    );
  });

  it('should throw Bad Request when repository returns false', async () => {
    tokenPort.getValidToken.mockResolvedValue('token-1');
    repoPort.writeDeviceValue.mockResolvedValue(false);

    await expect(
      adapter.writeDatapointValue({
        plantId: 'plant-1',
        datapointId: 'dp-1',
        value: 'On',
      }),
    ).rejects.toThrow('Bad Request');
  });

  it('should propagate repository errors', async () => {
    tokenPort.getValidToken.mockResolvedValue('token-1');
    repoPort.writeDeviceValue.mockRejectedValue(new Error('network error'));

    await expect(
      adapter.writeDatapointValue({
        plantId: 'plant-1',
        datapointId: 'dp-1',
        value: 'On',
      }),
    ).rejects.toThrow('network error');
  });
});
