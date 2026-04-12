import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from 'src/validation/pipe/validation.pipe';
import { IsString, IsInt } from 'class-validator';

class TestDto {
  @IsString()
  name!: string;

  @IsInt()
  age!: number;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return value if no metatype', async () => {
    const value = { test: 'data' };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: undefined,
      data: '',
    };

    await expect(pipe.transform(value, metadata)).resolves.toEqual(value);
  });

  it('should skip validation for primitive types', async () => {
    const value = 'string';
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    };

    await expect(pipe.transform(value, metadata)).resolves.toEqual(value);
  });

  it('should pass validation for valid DTO', async () => {
    const value = { name: 'Mario', age: 30 };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    await expect(pipe.transform(value, metadata)).resolves.toEqual(value);
  });

  it('should throw error for invalid DTO', async () => {
    const value = { name: 123, age: 'wrong' };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    await expect(pipe.transform(value, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw error when required field is missing', async () => {
    const value = { age: 25 };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    await expect(pipe.transform(value, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
