export interface ReadStatusPort {
  readStatus(userId: number): Promise<{ isLinked: boolean; email: string }>;
}

export const READ_STATUS_PORT = Symbol('ReadStatusPort');
