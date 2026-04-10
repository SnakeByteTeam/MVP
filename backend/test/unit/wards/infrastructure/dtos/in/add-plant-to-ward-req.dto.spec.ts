import { AddPlantToWardReqDto } from 'src/wards/infrastructure/dtos/in/add-plant-to-ward-req.dto';

describe('AddPlantToWardReqDto', () => {
  it('should be defined', () => {
    expect(new AddPlantToWardReqDto()).toBeDefined();
  });
});
