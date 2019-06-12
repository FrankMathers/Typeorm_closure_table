import { getManager, TreeRepository } from "typeorm";
import { IModelService } from "./IModelService";
import { Model } from "../index/db/entities/Model";
export class ModelService implements IModelService {
    public getNodes(path: string): Promise<Model[]> {
        const manager = getManager();
        return manager.getTreeRepository(Model).findRoots();
    }

    public getNode(path: string): Promise<Model> {
        const manager = getManager();
        return manager.getTreeRepository(Model).findOne({ filePath: path });
    }
}
