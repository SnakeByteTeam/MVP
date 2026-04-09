export interface DeleteTokensFromRepoPort {
  deleteTokens(): Promise<boolean>;
}

export const DELETETOKENSFROMREPOPORT = Symbol('DeleteTokensFromRepoPort');
