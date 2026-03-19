import { Ward } from "../../../domain/ward";

export interface FindAllWardsPort {
    findAllWard(): Ward[];
}
