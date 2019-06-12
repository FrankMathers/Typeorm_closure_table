import { Model } from "../index/db/entities/Model";
export interface IModelService {
    getNodes(path: string): Promise<Model[]>;
}
