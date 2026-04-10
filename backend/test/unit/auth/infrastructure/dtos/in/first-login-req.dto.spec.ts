import { FirstLoginReqDto } from 'src/auth/infrastructure/dtos/in/first-login-req.dto';

describe('FirstLoginReq', () => {
  it('should be defined', () => {
    expect(new FirstLoginReqDto()).toBeDefined();
  });
});
