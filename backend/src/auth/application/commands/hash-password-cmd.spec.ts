import { HashPasswordCmd } from './hash-password-cmd';

describe('HashPasswordCmd', () => {
  it('should be defined', () => {
    expect(new HashPasswordCmd('')).toBeDefined();
  });
});
