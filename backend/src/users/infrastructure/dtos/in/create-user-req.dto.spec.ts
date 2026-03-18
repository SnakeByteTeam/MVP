import { CreateUserReqDto } from './create-user-req.dto';

describe('CreateUserReqDto', () => {
  it('should be defined', () => {
    expect(new CreateUserReqDto()).toBeDefined();
  });
});
