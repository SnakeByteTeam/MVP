import { IngestTimeseriesCmd } from '../../commands/ingest-timeseries.command';

export interface IngestTimeseriesUseCase {
  ingestTimeseries(cmd: IngestTimeseriesCmd): Promise<void>;
}

export const INGEST_TIMESERIES_USE_CASE = Symbol('IngestTimeseriesUseCase');
