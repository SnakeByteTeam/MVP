import { CreateUserResDto } from 'src/users/infrastructure/dtos/out/create-user-res.dto';

describe('CreateUserResDto', () => {
  it('should be defined', () => {
    expect(new CreateUserResDto()).toBeDefined();
  });
});
