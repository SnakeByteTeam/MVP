import { validate } from 'class-validator';
import { UpdateUserReqDto } from './update-user-req.dto';

describe('UpdateUserReqDto', () => {
  it('should be defined', () => {
    expect(new UpdateUserReqDto()).toBeDefined();
  });
});

describe('UpdateUserReqDto validation', () => {
  const char256 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + 
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + 
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + 
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  it('should succeed with valid data', async () => {
      const dto = new UpdateUserReqDto();
      dto.username = 'test';
      dto.surname = 'test';
      dto.name = 'test';
      dto.role = 'test';
  
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  
    it('should fail when username is too short', async () => {
      const dto = new UpdateUserReqDto();
      dto.username = 'a';
      dto.surname = 'test';
      dto.name = 'test';
      dto.role = 'test';
  
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });
  
    it('should fail when surname is too short', async () => {
      const dto = new UpdateUserReqDto();
      dto.username = 'test';
      dto.surname = 'a';
      dto.name = 'test';
      dto.role = 'test';
  
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('surname');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });
  
    it('should fail when surname is too long', async () => {
      const dto = new UpdateUserReqDto();
      dto.username = 'test';
      dto.surname = char256;
      dto.name = 'test';
      dto.role = 'test';
  
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('surname');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  
    it('should fail when name is too short', async () => {
      const dto = new UpdateUserReqDto();
      dto.username = 'test';
      dto.surname = 'test';
      dto.name = 'a';
      dto.role = 'test';
  
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });
  
    it('should fail when name is too long', async () => {
      const dto = new UpdateUserReqDto();
      dto.username = 'test';
      dto.surname = 'test';
      dto.name = char256;
      dto.role = 'test';
  
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  
    it('should fail when role is too short', async () => {
      const dto = new UpdateUserReqDto();
      dto.username = 'test';
      dto.surname = 'test';
      dto.name = 'test';
      dto.role = 'a';
  
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

});
