import { Test, TestingModule } from '@nestjs/testing';
import { IngestTimeseriesAdapter } from './ingest-timeseries.adapter';
import {
  INGEST_TIMESERIES_REPO_PORT,
  type IngestTimeseriesRepoPort,
} from 'src/device/application/repository/ingest-timeseries.repository';
import { IngestTimeseriesCmd } from 'src/device/application/commands/ingest-timeseries.command';

describe('IngestTimeseriesAdapter', () => {
  let adapter: IngestTimeseriesAdapter;
  let repoPort: jest.Mocked<IngestTimeseriesRepoPort>;

  beforeEach(async () => {
    repoPort = {
      ingestTimeseries: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestTimeseriesAdapter,
        { provide: INGEST_TIMESERIES_REPO_PORT, useValue: repoPort },
      ],
    }).compile();

    adapter = module.get<IngestTimeseriesAdapter>(IngestTimeseriesAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('ingestTimeseries', () => {
    it('should successfully ingest timeseries', async () => {
      const cmd: IngestTimeseriesCmd = {
        datapointId: 'dp-123',
        value: '25.5',
        timestamp: '2026-04-01T13:41:58Z',
      };

      repoPort.ingestTimeseries.mockResolvedValue(true);

      await adapter.ingestTimeseries(cmd);

      expect(repoPort.ingestTimeseries).toHaveBeenCalledWith(
        'dp-123',
        '25.5',
        '2026-04-01T13:41:58Z',
      );
    });

    it('should throw error when cmd is null', async () => {
      await expect(adapter.ingestTimeseries(null as any)).rejects.toThrow(
        "Can't ingest timeseries without parameters",
      );
    });

    it('should throw error when cmd is undefined', async () => {
      await expect(adapter.ingestTimeseries(undefined as any)).rejects.toThrow(
        "Can't ingest timeseries without parameters",
      );
    });

    it('should throw error when datapointId is missing', async () => {
      const cmd = {
        value: 25.5,
        timestamp: '2026-04-01T13:41:58Z',
      } as any;

      await expect(adapter.ingestTimeseries(cmd)).rejects.toThrow(
        "Can't ingest timeseries without parameters",
      );
    });

    it('should throw error when value is missing', async () => {
      const cmd = {
        datapointId: 'dp-123',
        timestamp: '2026-04-01T13:41:58Z',
      } as any;

      await expect(adapter.ingestTimeseries(cmd)).rejects.toThrow(
        "Can't ingest timeseries without parameters",
      );
    });

    it('should throw error when timestamp is missing', async () => {
      const cmd = {
        datapointId: 'dp-123',
        value: 25.5,
      } as any;

      await expect(adapter.ingestTimeseries(cmd)).rejects.toThrow(
        "Can't ingest timeseries without parameters",
      );
    });

    it('should convert value to string when calling repo', async () => {
      const cmd: IngestTimeseriesCmd = {
        datapointId: 'dp-123',
        value: '25.5',
        timestamp: '2026-04-01T13:41:58Z',
      };

      repoPort.ingestTimeseries.mockResolvedValue(true);

      await adapter.ingestTimeseries(cmd);

      const calls = repoPort.ingestTimeseries.mock.calls[0];
      expect(calls[1]).toEqual('25.5');
    });

    it('should convert timestamp to string when calling repo', async () => {
      const cmd = {
        datapointId: 'dp-123',
        value: '25.5',
        timestamp: '2026-04-01T13:41:58Z',
      };

      repoPort.ingestTimeseries.mockResolvedValue(true);

      await adapter.ingestTimeseries(cmd);

      const calls = repoPort.ingestTimeseries.mock.calls[0];
      expect(calls[2]).toEqual('2026-04-01T13:41:58Z');
    });

    it('should throw error when repo returns false', async () => {
      const cmd: IngestTimeseriesCmd = {
        datapointId: 'dp-123',
        value: '25.5',
        timestamp: '2026-04-01T13:41:58Z',
      };

      repoPort.ingestTimeseries.mockResolvedValue(false);

      await expect(adapter.ingestTimeseries(cmd)).rejects.toThrow(
        'Error ingesting timeseries of dp-123',
      );
    });

    it('should propagate repo errors', async () => {
      const cmd: IngestTimeseriesCmd = {
        datapointId: 'dp-123',
        value: '25.5',
        timestamp: '2026-04-01T13:41:58Z',
      };

      const error = new Error('Database connection failed');
      repoPort.ingestTimeseries.mockRejectedValue(error);

      await expect(adapter.ingestTimeseries(cmd)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle numeric values', async () => {
      const cmd: IngestTimeseriesCmd = {
        datapointId: 'dp-123',
        value: '99.99',
        timestamp: '2026-04-01T13:41:58Z',
      };

      repoPort.ingestTimeseries.mockResolvedValue(true);

      await adapter.ingestTimeseries(cmd);

      expect(repoPort.ingestTimeseries).toHaveBeenCalledWith(
        'dp-123',
        '99.99',
        '2026-04-01T13:41:58Z',
      );
    });

    it('should handle string values', async () => {
      const cmd = {
        datapointId: 'dp-123',
        value: 'sample-string' as any,
        timestamp: '2026-04-01T13:41:58Z',
      };

      repoPort.ingestTimeseries.mockResolvedValue(true);

      await adapter.ingestTimeseries(cmd);

      expect(repoPort.ingestTimeseries).toHaveBeenCalledWith(
        'dp-123',
        'sample-string',
        '2026-04-01T13:41:58Z',
      );
    });
  });
});
