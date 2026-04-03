export interface WriteDatapointValueCmd {
  plantId?: string;
  datapointId: string;
  value: string;
}
