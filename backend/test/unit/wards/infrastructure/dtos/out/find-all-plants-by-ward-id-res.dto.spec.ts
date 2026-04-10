import { FindAllPlantsByWardIdResDto } from 'src/wards/infrastructure/dtos/out/find-all-plants-by-ward-id-res.dto';

describe('FindAllPlantsByWardIdResDto', () => {
  it('should be defined', () => {
    expect(new FindAllPlantsByWardIdResDto()).toBeDefined();
  });
});
