import { UserEntity } from './user-entity';

describe('UserEntity', () => {
  it('should be defined', () => {
    expect(new UserEntity(1,'','','','')).toBeDefined();
  });

  it('should have all properties defined', () => {
      const entity = new UserEntity(1, 'u', 's', 'n', 'r');
  
      expect(entity).toMatchObject({
        id: 1,
        username: 'u',
        surname: 's',
        name: 'n',
        role: 'r'
      });
    });
});
