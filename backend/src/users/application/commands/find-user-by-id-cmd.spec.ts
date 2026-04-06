import { FindUserByIdCmd } from './find-user-by-id-cmd';

describe('FindUserByIdCmd', () => {
  it('should be defined', () => {
    expect(new FindUserByIdCmd(1)).toBeDefined();
  });
});
