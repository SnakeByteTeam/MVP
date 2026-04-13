import { GenerateAndExtractTokenAdapter } from 'src/auth/adapters/out/generate-and-extract-token-adapter';

describe('GenerateAndExtractTokenAdapter', () => {
    const mockToken = 'test';
    let adapter: GenerateAndExtractTokenAdapter;
    const mockPayload = { userId: '1', role: 'admin' };

    const mockJwtTokenGeneratorAndExtractor = {
        generateAccessToken: jest.fn().mockReturnValue('test'),
        generateRefreshToken: jest.fn().mockReturnValue('test'),
        generateChangePasswordRefreshToken: jest.fn().mockReturnValue('test'),
        generateChangePasswordAccessToken: jest.fn().mockReturnValue('test'),
        extractAccessTokenPayload: jest.fn().mockReturnValue(mockPayload),
        extractRefreshTokenPayload: jest.fn().mockReturnValue(mockPayload),
    };

    beforeEach(() => {
        adapter = new GenerateAndExtractTokenAdapter(
            mockJwtTokenGeneratorAndExtractor as any,
        );
    });

    it('should be defined', () => {
        expect(
            adapter,
        ).toBeDefined();
    });

    it('should generate refresh token from payload', () => {
        const result = adapter.generateAccessToken({
            payload: {
                id: 1,
                username: 'user',
                role: 'OPERATORE_SANITARIO',
                firstAccess: false,
            },
        });

        expect(
            mockJwtTokenGeneratorAndExtractor.generateAccessToken,
        ).toHaveBeenCalledWith({
            id: 1,
            username: 'user',
            role: 'OPERATORE_SANITARIO',
            firstAccess: false,
        });

        expect(result).toEqual(mockToken);
    });

    it('should generate refresh token from payload', () => {
        const result = adapter.generateAccessToken({
            payload: {
                id: 1,
                username: 'user',
                role: 'OPERATORE_SANITARIO',
                firstAccess: false,
            },
        });

        expect(
            mockJwtTokenGeneratorAndExtractor.generateAccessToken,
        ).toHaveBeenCalledWith({
            id: 1,
            username: 'user',
            role: 'OPERATORE_SANITARIO',
            firstAccess: false,
        });

        expect(result).toEqual(mockToken);
    });

    it('should generate refresh token from payload', () => {
        const result = adapter.generateChangePasswordAccessToken({
            payload: {
                id: 1,
                username: 'user',
                role: 'OPERATORE_SANITARIO',
                firstAccess: false,
            },
        });

        expect(
            mockJwtTokenGeneratorAndExtractor.generateChangePasswordAccessToken,
        ).toHaveBeenCalledWith({
            id: 1,
            username: 'user',
            role: 'OPERATORE_SANITARIO',
            firstAccess: false,
        });

        expect(result).toEqual(mockToken);
    });

    it('should generate refresh token from payload', () => {
        const result = adapter.generateChangePasswordRefreshToken({
            payload: {
                id: 1,
                username: 'user',
                role: 'OPERATORE_SANITARIO',
                firstAccess: false,
            },
        });

        expect(
            mockJwtTokenGeneratorAndExtractor.generateChangePasswordRefreshToken,
        ).toHaveBeenCalledWith({
            id: 1,
            username: 'user',
            role: 'OPERATORE_SANITARIO',
            firstAccess: false,
        });

        expect(result).toEqual(mockToken);
    });

    it('should extract payload from access token', () => {

        const result = adapter.extractFromAccessToken({
            token: 'fake-token',
        });

        expect(
            mockJwtTokenGeneratorAndExtractor.extractAccessTokenPayload,
        ).toHaveBeenCalledWith('fake-token');

        expect(result).toEqual(mockPayload);
    });

    it('should propagate errors from extractor for access token', () => {
        const mock = {
            extractAccessTokenPayload: jest.fn().mockImplementation(() => {
                throw new Error('Invalid token');
            }),
        };

        const adapter = new GenerateAndExtractTokenAdapter(mock as any);

        expect(() =>
            adapter.extractFromAccessToken({ token: 'bad-token' }),
        ).toThrow('Invalid token');
    });

    it('should extract payload from refresh token', () => {
        const result = adapter.extractFromRefreshToken({
            token: 'fake-token',
        });

        expect(
            mockJwtTokenGeneratorAndExtractor.extractRefreshTokenPayload,
        ).toHaveBeenCalledWith('fake-token');

        expect(result).toEqual(mockPayload);
    });

    it('should propagate errors from extractor for refresh token', () => {
        const mock = {
            extractRefreshTokenPayload: jest.fn().mockImplementation(() => {
                throw new Error('Invalid token');
            }),
        };

        const adapter = new GenerateAndExtractTokenAdapter(mock as any);

        expect(() =>
            adapter.extractFromRefreshToken({ token: 'bad-token' }),
        ).toThrow('Invalid token');
    });
});
