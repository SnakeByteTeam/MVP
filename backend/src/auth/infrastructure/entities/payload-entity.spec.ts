import { PayloadEntity } from './payload-entity';

describe('PayloadEntity', () => {
  it('should be defined', () => {
    expect(new PayloadEntity(1, '', false)).toBeDefined();
  });
});
