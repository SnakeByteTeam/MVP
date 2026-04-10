import { ConvertBase64Impl } from 'src/users/infrastructure/convert-base-64-impl/convert-base-64-impl';

describe('ConvertBase64Impl', () => {
  it('should be defined', () => {
    expect(new ConvertBase64Impl()).toBeDefined();
  });

  it('should convert plain text to base64', () => {
    expect(new ConvertBase64Impl().toBase64('test')).toEqual('dGVzdA==');
  });

  it('should convert base64 to plain text', () => {
    expect(new ConvertBase64Impl().toPlain('dGVzdA==')).toEqual('test');
  });
});
