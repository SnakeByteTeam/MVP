import { CreateWardCmd } from 'src/wards/application/commands/create-ward-cmd';

describe('CreateWardCmd', () => {
  it('should be defined', () => {
    expect(new CreateWardCmd('name')).toBeDefined();
  });
});
