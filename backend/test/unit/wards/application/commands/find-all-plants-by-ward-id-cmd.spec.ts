import { FindAllPlantsByWardIdCmd } from 'src/wards/application/commands/find-all-plants-by-ward-id-cmd';

describe('FindAllPlantsByWardIdCmd', () => {
  it('should be defined', () => {
    expect(new FindAllPlantsByWardIdCmd(1)).toBeDefined();
  });
});
