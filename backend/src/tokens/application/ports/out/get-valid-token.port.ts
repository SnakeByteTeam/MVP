export interface GetValidTokenPort{
    getValidToken(): Promise<string | null>
}

export const GETVALIDTOKENPORT = Symbol('GetValidTokenPort');