import { getManager, TreeRepository, SelectQueryBuilder } from "typeorm";
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
        // Get node only according path
        const node = await this.getNodeWithoutContent(query);
        console.log(node);
        const manager = getManager();
        const nodes = await manager.getTreeRepository(Model).findDescendantsTree(node);
        console.log(nodes);
        const sqb: SelectQueryBuilder<Model> = await manager
            .getTreeRepository(Model)
            .createDescendantsQueryBuilder("model", "modelclosure", node)
            .select("id")
            .addSelect("name")
            .addSelect("namespace")
            .addSelect("type")
            .addSelect("path")
            .addSelect("CreatedAt")
            .addSelect("UpdatedAt")
            .addSelect("parentId");
        // Support type query
        if (query.type) {
            sqb.andWhere("model.type=:type", { type: query.type });
        } else {
            sqb.where("model.parentId =:id", { id: node.id });
            sqb.andWhere("modelclosure.id_ancestor=:id", { id: node.id });
        }
        const list = await sqb.execute();
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
        try {
            const result = await this.getNodeWithContent(nodeQuery);
            console.log(result);
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    public async putContent(query: IContentQuery): Promise<IModel> {
        try {
            await this.fileService.writeFileContent(query.path, query.content as string);
            return;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public async getNodeWithContent(query: INodeQuery): Promise<IModel> {
        const node = await this.getNodeWithoutContent(query);
        try {
            node.content = await this.fileService.readFileContent(path.join(process.cwd(), query.path));
            return node;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    public async getNodeWithoutContent(query: INodeQuery): Promise<IModel> {
        const manager = getManager();
        if (query.type) {
            return await manager.getTreeRepository(Model).findOne({ path: "" });
        } else {
            return await manager.getTreeRepository(Model).findOne({ path: query.path });
        }
    }
}
