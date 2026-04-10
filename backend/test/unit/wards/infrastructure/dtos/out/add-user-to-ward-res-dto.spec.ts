import { AddUserToWardResDto } from 'src/wards/infrastructure/dtos/out/add-user-to-ward-res-dto';

describe('AddUserToWardResDto', () => {
  it('should be defined', () => {
    expect(new AddUserToWardResDto()).toBeDefined();
  });
});
