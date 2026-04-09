import { UserEntity } from './user-entity';

describe('UserEntity', () => {
  it('should be defined', () => {
    expect(new UserEntity(1, '')).toBeDefined();
  });
});
