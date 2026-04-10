import { UpdateWardReqDto } from 'src/wards/infrastructure/dtos/in/update-ward-req.dto';

describe('UpdateWardReqDto', () => {
  it('should be defined', () => {
    expect(new UpdateWardReqDto()).toBeDefined();
  });
});
