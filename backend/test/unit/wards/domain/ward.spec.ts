import { Ward } from 'src/wards/domain/ward';

describe('Ward', () => {
  it('should be defined', () => {
    expect(new Ward(1, '')).toBeDefined();
  });
});
