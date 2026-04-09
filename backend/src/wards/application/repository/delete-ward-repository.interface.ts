export interface DeleteWardRepository {
  deleteWard(id: number): Promise<void>;
}

export const DELETE_WARD_REPOSITORY = 'DELETE_WARD_REPOSITORY';
