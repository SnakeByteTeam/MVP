import { Payload } from './payload';

describe('Payload', () => {
  it('should be defined', () => {
    expect(new Payload(1, 'user', 'OPERATORE_SANITARIO', false)).toBeDefined();
  });
});
