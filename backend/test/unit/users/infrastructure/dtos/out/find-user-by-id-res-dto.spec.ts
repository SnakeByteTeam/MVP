import { FindUserByIdResDto } from 'src/users/infrastructure/dtos/out/find-user-by-id-res-dto';

describe('FindUserByIdResDto', () => {
  it('should be defined', () => {
    expect(new FindUserByIdResDto()).toBeDefined();
  });
});
