export class GetAnalyticsCmd {
  readonly plantId: string;

  constructor(plantId: string) {
    this.plantId = plantId;
  }
}
