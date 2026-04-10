import { FindAllUserResDto } from 'src/users/infrastructure/dtos/out/find-all-user-res.dto';

describe('FindAllUserResDto', () => {
  it('should be defined', () => {
    expect(new FindAllUserResDto()).toBeDefined();
  });
});
