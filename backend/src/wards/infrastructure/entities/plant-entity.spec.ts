import { PlantEntity } from './plant-entity';

describe('PlantEntity', () => {
  it('should be defined', () => {
    expect(new PlantEntity('', '')).toBeDefined();
  });
});
