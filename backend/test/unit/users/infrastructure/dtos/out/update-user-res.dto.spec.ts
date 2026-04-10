import { UpdateUserResDto } from 'src/users/infrastructure/dtos/out/update-user-res.dto';

describe('UpdateUserResDto', () => {
  it('should be defined', () => {
    expect(new UpdateUserResDto()).toBeDefined();
  });
});
