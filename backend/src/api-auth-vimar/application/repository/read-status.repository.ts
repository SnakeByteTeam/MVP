export interface ReadStatusRepoPort {
  readStatus(userId: number): Promise<string | null>;
}

export const READ_STATUS_REPO_PORT = Symbol('ReadStatusRepoPort');
