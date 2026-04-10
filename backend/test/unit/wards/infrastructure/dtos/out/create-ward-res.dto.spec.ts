import { CreateWardResDto } from 'src/wards/infrastructure/dtos/out/create-ward-res.dto';

describe('CreateWardResDto', () => {
  it('should be defined', () => {
    expect(new CreateWardResDto()).toBeDefined();
  });
});
