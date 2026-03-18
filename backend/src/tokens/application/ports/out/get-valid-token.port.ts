export interface GetValidTokenPort{
    getValidToken(): Promise<string>
}

export const GETVALIDTOKENPORT = Symbol('GetValidTokenPort');