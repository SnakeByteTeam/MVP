import { CreateWardReqDto } from 'src/wards/infrastructure/dtos/in/create-ward-req.dto';

describe('CreateWardReqDto', () => {
  it('should be defined', () => {
    expect(new CreateWardReqDto()).toBeDefined();
  });
});
