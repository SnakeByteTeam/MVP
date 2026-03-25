import { ApiAuthVimarService } from './api-auth-vimar.service';

describe('ApiAuthVimarService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      HOST1: 'https://example.example.com/oauth/authorize',
      CLIENTID: 'client-123',
      REDIRECT_URI: 'http://localhost:3000/tokens/callback',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should build a valid OAuth login URL', () => {
    const service = new ApiAuthVimarService();

    const loginUrl = service.getLoginUrl();
    const parsedUrl = new URL(loginUrl);

    expect(parsedUrl.origin + parsedUrl.pathname).toBe(
      'https://example.example.com/oauth/authorize',
    );
    expect(parsedUrl.searchParams.get('response_type')).toBe('code');
    expect(parsedUrl.searchParams.get('client_id')).toBe('client-123');
    expect(parsedUrl.searchParams.get('scope')).toBe('read write manage');
    expect(parsedUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/tokens/callback',
    );
  });

  it('should use default redirect URI when REDIRECT_URI is not set', () => {
    delete process.env.REDIRECT_URI;
    const service = new ApiAuthVimarService();

    const loginUrl = service.getLoginUrl();
    const parsedUrl = new URL(loginUrl);

    expect(parsedUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/tokens/callback',
    );
  });

  it('should use empty client_id when CLIENTID is not set', () => {
    delete process.env.CLIENTID;
    const service = new ApiAuthVimarService();

    const loginUrl = service.getLoginUrl();
    const parsedUrl = new URL(loginUrl);

    expect(parsedUrl.searchParams.get('client_id')).toBe('');
  });
});
