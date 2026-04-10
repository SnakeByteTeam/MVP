import { AddPlantToWardResDto } from 'src/wards/infrastructure/dtos/out/add-plant-to-ward-res-dto';

describe('AddPlantToWardResDto', () => {
  it('should be defined', () => {
    expect(new AddPlantToWardResDto()).toBeDefined();
  });
});
