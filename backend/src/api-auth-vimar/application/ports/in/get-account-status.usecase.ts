export interface GetAccountStatusUseCase {
    getAccountStatus(userId: number): Promise<{ isLinked: boolean, email: string }>;
}

export const GET_ACCOUNT_STATUS_USECASE = Symbol('GetAccountStatusUseCase');