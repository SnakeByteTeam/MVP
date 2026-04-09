import { UpdateWardCmd } from './update-ward-cmd';

describe('UpdateWardCmd', () => {
  it('should be defined', () => {
    expect(new UpdateWardCmd(1, 'new name')).toBeDefined();
  });
});
