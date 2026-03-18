import { validate } from 'class-validator';
import { CreateUserReqDto } from './create-user-req.dto';

describe('CreateUserReqDto', () => {
  it('should be defined', () => {
    expect(new CreateUserReqDto()).toBeDefined();
  });
});

describe('CreateUserReqDto validation', () => {
  const char128 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
      'aaaaa';

  const char256 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + 
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + 
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + 
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  it('should succeed with valid data', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = 'test';
    dto.name = 'test';
    dto.role = 'test';
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when username is too short', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'a';
    dto.surname = 'test';
    dto.name = 'test';
    dto.role = 'test';
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail when surname is too short', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = 'a';
    dto.name = 'test';
    dto.role = 'test';
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('surname');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail when surname is too long', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = char256;
    dto.name = 'test';
    dto.role = 'test';
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('surname');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail when name is too short', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = 'test';
    dto.name = 'a';
    dto.role = 'test';
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail when name is too long', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = 'test';
    dto.name = char256;
    dto.role = 'test';
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail when role is too short', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = 'test';
    dto.name = 'test';
    dto.role = 'a';
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail when role is too long', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = 'test';
    dto.name = 'test';
    dto.role = char256;
    dto.tempPassword = char128;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail when tempPassword has a length other than 128 chars', async () => {
    const dto = new CreateUserReqDto();
    dto.username = 'test';
    dto.surname = 'test';
    dto.name = 'test';
    dto.role = 'test';
    dto.tempPassword = 'a';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tempPassword');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

});
