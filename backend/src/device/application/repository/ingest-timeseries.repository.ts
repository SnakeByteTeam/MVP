export interface IngestTimeseriesRepoPort {
  ingestTimeseries(
    datapointId: string,
    value: string,
    timestamp: string,
  ): Promise<boolean>;
}

export const INGEST_TIMESERIES_REPO_PORT = Symbol('IngestTimeseriesRepoPort');
