import { LoginReqDto } from 'src/auth/infrastructure/dtos/in/login-req.dto';

describe('LoginReqDto', () => {
  it('should be defined', () => {
    expect(new LoginReqDto()).toBeDefined();
  });
});
