import { FindAllWardsResDto } from 'src/wards/infrastructure/dtos/out/find-all-wards-res.dto';

describe('FindAllWardsResDto', () => {
  it('should be defined', () => {
    expect(new FindAllWardsResDto()).toBeDefined();
  });
});
