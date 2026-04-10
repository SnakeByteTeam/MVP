import { WardEntity } from 'src/wards/infrastructure/entities/ward-entity';

describe('WardEntity', () => {
  it('should be defined', () => {
    expect(new WardEntity(1, '')).toBeDefined();
  });
});
