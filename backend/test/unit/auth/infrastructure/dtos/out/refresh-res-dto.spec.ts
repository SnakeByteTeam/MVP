import { RefreshResDto } from 'src/auth/infrastructure/dtos/out/refresh-res-dto';

describe('RefreshResDto', () => {
  it('should be defined', () => {
    expect(new RefreshResDto()).toBeDefined();
  });
});
