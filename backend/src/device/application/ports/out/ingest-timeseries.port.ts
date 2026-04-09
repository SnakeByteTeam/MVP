import { IngestTimeseriesCmd } from '../../commands/ingest-timeseries.command';

export interface IngestTimeseriesPort {
  ingestTimeseries(cmd: IngestTimeseriesCmd): Promise<void>;
}

export const INGEST_TIMESERIES_PORT = Symbol('IngestTimeseriesPort');
