import { GenerateAccessTokenAdapter } from "./generate-access-token-adapter";

describe('GenerateTokenAdapter', () => {
  it('should be defined', () => {
    expect(new GenerateAccessTokenAdapter()).toBeDefined();
  });
});
