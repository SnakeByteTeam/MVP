import { ValidationPipe } from 'src/validation/pipe/validation.pipe';

describe('ValidationPipe', () => {
  it('should be defined', () => {
    expect(new ValidationPipe()).toBeDefined();
  });
});
