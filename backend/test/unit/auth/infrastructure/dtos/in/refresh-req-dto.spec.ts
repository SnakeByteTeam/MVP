import { RefreshReqDto } from 'src/auth/infrastructure/dtos/in/refresh-req-dto';

describe('RefreshReqDto', () => {
  it('should be defined', () => {
    expect(new RefreshReqDto()).toBeDefined();
  });
});
