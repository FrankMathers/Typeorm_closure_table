import { getManager, TreeRepository } from "typeorm";
import { injectable, inject } from "inversify";
import { IFileService } from "../filesystem/IFileService";
import { TYPES } from "../bootstrap/types";
import { IModelManager } from "./IModelManager";
import { INodeQuery, IContentQuery } from "./base/IModelQuery";
import { IModel } from "./base/IModel";
import { Model } from "../index/db/entities/Model";
import * as path from "path";
@injectable()
export class ModelManager implements IModelManager {
    @inject(TYPES.FileService) public fileService: IFileService;
    public async getNodes(query: INodeQuery): Promise<IModel[]> {
        const node = await this.getNodeWithoutContent(query);
        console.log(node);
        const manager = getManager();
        const nodes = await manager.getTreeRepository(Model).findDescendantsTree(node);
        console.log(nodes);
        const list = await manager
            .getTreeRepository(Model)
            .createDescendantsQueryBuilder("model", "modelclosure", node)
            .where("model.parentID =:id", { id: node.id })
            .andWhere("modelclosure.id_ancestor=:id", { id: node.id })
            .execute();
        return list;
    }
    public async deleteNodes(query: INodeQuery): Promise<IModel> {
        const node = await this.getNodeWithoutContent(query);
        this.fileService.deleteDirectory(path.join(process.cwd(), query.path));
        return node;
    }
    public async getContent(query: IContentQuery): Promise<IModel> {
        const nodeQuery = {
            path: query.path
        };
        const result = await this.getNodeWithContent(nodeQuery);
        console.log(result);
        return result;
    }
    public async putContent(query: IContentQuery): Promise<IModel> {
        await this.fileService.writeFileContent(query.path, query.content as string);
        return;
    }

    public async getNodeWithContent(query: INodeQuery): Promise<IModel> {
        const node = await this.getNodeWithoutContent(query);
        node.content = await this.fileService.readFileContent(path.join(process.cwd(), query.path));
        return node;
    }
    public async getNodeWithoutContent(query: INodeQuery): Promise<IModel> {
        const manager = getManager();
        return await manager.getTreeRepository(Model).findOne({ filePath: query.path });
    }
}
