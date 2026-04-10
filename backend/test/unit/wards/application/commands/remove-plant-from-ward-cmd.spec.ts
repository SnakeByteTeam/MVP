import { RemovePlantFromWardCmd } from 'src/wards/application/commands/remove-plant-from-ward-cmd';

describe('RemovePlantFromWardCmd', () => {
  it('should be defined', () => {
    expect(new RemovePlantFromWardCmd('id')).toBeDefined();
  });
});
