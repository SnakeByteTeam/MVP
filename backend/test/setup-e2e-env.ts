const TEST_JWT_SECRET = 'test-jwt-secret-key-for-e2e-tests';
const TEST_REFRESH_SECRET = 'test-refresh-secret-key-for-e2e-tests';

process.env.ACCESS_SECRET ??= TEST_JWT_SECRET;
process.env.REFRESH_SECRET ??= TEST_REFRESH_SECRET;
