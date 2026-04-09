import { AddPlantToWardCmd } from './add-plant-to-ward-cmd';

describe('AddPlantToWardCmd', () => {
  it('should be defined', () => {
    expect(new AddPlantToWardCmd(1, 'id')).toBeDefined();
  });
});
