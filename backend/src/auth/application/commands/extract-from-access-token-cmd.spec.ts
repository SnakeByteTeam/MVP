import { ExtractFromAccessTokenCmd } from "./extract-from-access-token-cmd";

describe('ExtractFromAccessTokenCmd', () => {
  it('should be defined', () => {
    expect(new ExtractFromAccessTokenCmd("")).toBeDefined();
  });
});
