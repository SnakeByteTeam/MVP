export class AddPlantToWardCmd {
  constructor(
    public wardId: number,
    public plantId: string,
  ) {}
}
