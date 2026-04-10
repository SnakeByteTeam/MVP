import { FindAllAvailableUsersResDto } from 'src/users/infrastructure/dtos/out/find-all-available-users-res-dto';

describe('FindAllAvailableUsersResDto', () => {
  it('should be defined', () => {
    expect(new FindAllAvailableUsersResDto()).toBeDefined();
  });
});
