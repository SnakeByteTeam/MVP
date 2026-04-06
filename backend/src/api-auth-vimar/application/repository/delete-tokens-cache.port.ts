export interface DeleteTokensCachePort {
  deleteTokens(): Promise<boolean>;
}

export const DELETETOKENSCACHEPORT = Symbol('DeleteTokensCachePort');
