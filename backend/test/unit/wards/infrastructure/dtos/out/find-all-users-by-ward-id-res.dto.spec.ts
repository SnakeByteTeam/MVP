import { FindAllUsersByWardIdResDto } from 'src/wards/infrastructure/dtos/out/find-all-users-by-ward-id-res.dto';

describe('FindAllUsersByWardIdResDto', () => {
  it('should be defined', () => {
    expect(new FindAllUsersByWardIdResDto()).toBeDefined();
  });
});
