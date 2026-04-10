import { AddUserToWardReqDto } from 'src/wards/infrastructure/dtos/in/add-user-to-ward-req.dto';

describe('AddUserToWardReqDto', () => {
  it('should be defined', () => {
    expect(new AddUserToWardReqDto()).toBeDefined();
  });
});
