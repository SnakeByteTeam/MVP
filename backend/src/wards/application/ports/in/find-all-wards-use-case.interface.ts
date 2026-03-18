import { Ward } from "../../../domain/ward";

export interface FindAllWardsUseCase {
    findAllWard(): Ward[];
}
