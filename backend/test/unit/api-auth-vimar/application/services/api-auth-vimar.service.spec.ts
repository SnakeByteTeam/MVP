import { ApiAuthVimarService } from 'src/api-auth-vimar/application/services/api-auth-vimar.service';

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

  it('should build a valid OAuth login URL without state', () => {
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
    expect(parsedUrl.searchParams.get('state')).toBeNull();
  });

  it('should include state parameter when provided', () => {
    const service = new ApiAuthVimarService();
    const state = 'aHR0cHM6Ly9teS1hcHAubG9jYWwvZGFzaGJvYXJk';

    const loginUrl = service.getLoginUrl(state);
    const parsedUrl = new URL(loginUrl);

    expect(parsedUrl.searchParams.get('state')).toBe(state);
    expect(parsedUrl.searchParams.get('response_type')).toBe('code');
  });

  it('should throw error when REDIRECT_URI is not set', () => {
    delete process.env.REDIRECT_URI;
    const service = new ApiAuthVimarService();

    expect(() => service.getLoginUrl()).toThrow(
      'There is no redirect_url setted',
    );
  });

  it('should throw error when CLIENTID is not set', () => {
    delete process.env.CLIENTID;
    const service = new ApiAuthVimarService();

    expect(() => service.getLoginUrl()).toThrow(
      'MyVimar OAuth configuration is missing: CLIENTID',
    );
  });

  it('should include all required OAuth parameters', () => {
    const service = new ApiAuthVimarService();

    const loginUrl = service.getLoginUrl();
    const parsedUrl = new URL(loginUrl);

    expect(parsedUrl.searchParams.has('response_type')).toBe(true);
    expect(parsedUrl.searchParams.has('client_id')).toBe(true);
    expect(parsedUrl.searchParams.has('scope')).toBe(true);
    expect(parsedUrl.searchParams.has('redirect_uri')).toBe(true);
  });

  it('should construct correct URL with all parameters including state', () => {
    const service = new ApiAuthVimarService();
    const state = 'test-state-value';

    const loginUrl = service.getLoginUrl(state);

    expect(loginUrl).toContain(process.env.HOST1);
    expect(loginUrl).toContain('response_type=code');
    expect(loginUrl).toContain(`client_id=${process.env.CLIENTID}`);
    expect(loginUrl).toContain('scope=read+write+manage');
    expect(loginUrl).toContain(
      `redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI || '')}`,
    );
    expect(loginUrl).toContain(`state=${state}`);
  });

  it('should handle special characters in state parameter', () => {
    const service = new ApiAuthVimarService();
    const state = 'aGVsbG8td29ybGQtMTIz'; // base64 encoded

    const loginUrl = service.getLoginUrl(state);
    const parsedUrl = new URL(loginUrl);

    expect(parsedUrl.searchParams.get('state')).toBe(state);
  });
});
