import { PlantEntity } from 'src/wards/infrastructure/entities/plant-entity';

describe('PlantEntity', () => {
  it('should be defined', () => {
    expect(new PlantEntity('', '')).toBeDefined();
  });
});
