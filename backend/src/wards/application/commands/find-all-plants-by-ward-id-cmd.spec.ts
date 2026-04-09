import { FindAllPlantsByWardIdCmd } from './find-all-plants-by-ward-id-cmd';

describe('FindAllPlantsByWardIdCmd', () => {
  it('should be defined', () => {
    expect(new FindAllPlantsByWardIdCmd(1)).toBeDefined();
  });
});
