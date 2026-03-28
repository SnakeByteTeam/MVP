import { PayloadEntity } from './payload-entity';

describe('PayloadEntity', () => {
  it('should be defined', () => {
    expect(
      new PayloadEntity(1, 'user', 'OPERATORE_SANITARIO', false),
    ).toBeDefined();
  });
});
