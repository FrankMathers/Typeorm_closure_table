import { IIndexService } from "../IndexService";
import { injectable, inject } from "inversify";
import { TYPES } from "../../bootstrap/types";
import { IFileWatches, IFileService } from "../../filesystem/IFileService";
import { File } from "../../filesystem/File";
import * as sqlite from "sqlite3";
import { ConnectionOptions, createConnection, getManager } from "typeorm";
import * as path from "path";
import { Model } from "./entities/Model";
import { ModelType } from "../../model/base/IModel";
import logger from "../../log/LogService";
import { BoNode } from "../BoIndexutil/BoNode";
import { IBoParser } from "../BoIndexutil/IBoParser";
// tslint:disable-next-line
const readjson = require("readjson");

@injectable()
export class IndexDBService implements IIndexService {
    @inject(TYPES.FileService) public fileService: IFileService;
    @inject(TYPES.BoParser) public boParser: IBoParser;
    public async initIndexRepository(): Promise<void> {
        // Init DB files and etc

        /* Force sqlite module is loaded, otherwise sqlite module will be loaded from user 
		  module dependency dyamically */
        sqlite.verbose();
        try {
            await this.fileService.deleteFile(`./temp/dts.sqlite3`);
        } catch (e) {
            logger.emitInfo("IndexDBService:initIndexRepository", "no dts.sqlite3 exists");
        }
        const option: ConnectionOptions = {
            type: "sqlite",
            database: "./temp/dts.sqlite3",
            entities: [Model],
            synchronize: true,
            logging: ["error", "schema", "warn"]
        };

        await createConnection(option);
        return;
    }
    public async buildIndexFromBO(jsonFilePath: string, nodeParent: Model): Promise<void> {
        try {
            let parent: Model = {} as Model;
            parent = nodeParent;
            const rootNode = readjson.sync(jsonFilePath);
            if (rootNode.Nodes) {
                const node = await this.boParser.parseBo(rootNode.Nodes[0], "Nodes[0]");
                await this.buildIndexBoNode(node, parent, jsonFilePath);
                logger.emitInfo(
                    "IndexDBService:initIndexRepository",
                    `Bo build:${path.basename(jsonFilePath)} success`
                );
            }
        } catch (err) {
            logger.emitInfo("IndexDBService:initIndexRepository", err);
        }
    }
    public async buildIndexBoNode(node: BoNode, parent: Model, boFilePath: string) {
        const boPath = path.relative(process.cwd(), boFilePath).replace(/\\/g, "/");
        const model: Model = new Model();
        model.name = node.name;
        model.type = this.getNodeType(node);
        model.filePath = boPath + "/" + node.path;
        if (parent.name) {
            model.parent = parent;
        }
        await this.addIndexToDB(model);
        const queue = node.children;
        while (queue.length > 0) {
            const child = queue.shift();
            await this.buildIndexBoNode(child, model, boFilePath);
        }
    }

    public async buildIndexFromFile(rootPath: string): Promise<void> {
        try {
            const file = await this.fileService.readDirectory(rootPath);
            const model: Model = {} as Model;
            await this.buildIndex(file, model);
            logger.emitInfo("IndexDBService:initIndexRepository", "Build Success");
        } catch (err) {
            logger.emitInfo("IndexDBService:initIndexRepository", err);
        }
        return;
    }

    public async buildIndex(file: File, parent: Model) {
        const model: Model = new Model();
        model.name = file.name;
        model.type = this.getFileType(file);
        model.filePath = path.relative(process.cwd(), file.path).replace(/\\/g, "/");
        if (parent.name) {
            model.parent = parent;
        }

        await this.addIndexToDB(model);
        if (model.type === 1) {
            await this.buildIndexFromBO(model.filePath, model);
        }
        const queue = file.children;
        while (queue.length > 0) {
            const tmp = queue.shift();
            await this.buildIndex(tmp, model);
        }
    }

    public async updateIndex(fileQueue: IFileWatches[]) {
        fileQueue.sort((a, b) => {
            return a.filePath.length - b.filePath.length;
        });
        const manager = getManager();
        // const models = await manager.getTreeRepository(Model).findRoots();
        await manager
            .createQueryBuilder()
            .delete()
            .from("model_closure")
            .execute();
        await manager
            .createQueryBuilder()
            .delete()
            .from("model")
            .execute();
        await this.buildIndexFromFile(process.cwd());
        return;
    }

    public async addIndexToDB(model: Model): Promise<Model> {
        const manger = getManager();
        return manger.save(model);
    }

    private getFileType(file: File): ModelType {
        if (file.isDir) {
            return 3;
        }
        if (!file.type) {
            return 99;
        }
        switch (file.type.toLocaleLowerCase()) {
            case ".ui":
                return 2;
            case ".json":
                return 1;
            default:
                return 99;
        }
    }

    private getNodeType(node: BoNode): ModelType {
        if (!node.type) {
            return 99;
        }
        switch (node.type.toLocaleLowerCase()) {
            case "element":
                return 5;
            case "node":
                return 4;
            default:
                return 99;
        }
    }
}
