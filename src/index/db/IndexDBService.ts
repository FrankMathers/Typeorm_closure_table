import { IIndexService } from "../IndexService";
import { injectable, inject } from "inversify";
import { TYPES } from "../../bootstrap/types";
import { IFileWatches, IFileService } from "../../filesystem/IFileService";
import { File } from "../../filesystem/File";
import * as sqlite from "sqlite3";
import {
    ConnectionOptions,
    createConnection,
    getManager,
    getRepository,
    getConnection,
    getTreeRepository
} from "typeorm";
import * as path from "path";
import { Model } from "./entities/Model";
import { ModelType } from "../../model/base/IModel";
import logger from "../../log/LogService";
import { BoNode } from "../BoIndexutil/BoNode";
import { IBoParser } from "../BoIndexutil/IBoParser";
import stripJsonComments from "strip-json-comments";
import { FileEvent } from "../../filesystem/FileEmitter";

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
            logger.emitError("IndexDBService:initIndexRepository", "no dts.sqlite3 exists");
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
    public async buildIndexFromBO(boFilePath: string, nodeParent: Model): Promise<void> {
        try {
            let parent: Model = {} as Model;
            parent = nodeParent;
            // const rootNode = readjson.sync(jsonFilePath);
            const fileContent = await this.fileService.readFileContent(boFilePath);
            const rootNode = JSON.parse(stripJsonComments(fileContent));

            if (rootNode.Nodes) {
                // change parent to fit the bo query requirement
                await getConnection()
                    .createQueryBuilder()
                    .update("model")
                    .set({ name: rootNode.Key.BOName, namespace: rootNode.Key.BONamespace })
                    .where("path = :path", { path: parent.path })
                    .execute();
                // start to parse Bo
                const node = await this.boParser.parseBo(rootNode.Nodes[0], "Nodes[0]");
                await this.buildIndexBoNode(node, parent, boFilePath);
                logger.emitInfo("IndexDBService:initIndexRepository", `Bo build:${path.basename(boFilePath)} success`);
            }
        } catch (err) {
            logger.emitError("IndexDBService:initIndexRepository", err);
        }
    }
    public async buildIndexBoNode(node: BoNode, parent: Model, boFilePath: string) {
        const boPath = path.relative(process.cwd(), boFilePath).replace(/\\/g, "/");
        const model: Model = new Model();
        model.name = node.name;
        model.namespace = node.boNamespace;
        model.type = this.getNodeType(node);
        model.path = boPath + "/" + node.path;
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
            logger.emitError("IndexDBService:initIndexRepository", err);
        }
        return;
    }

    public async buildIndex(file: File, parent: Model) {
        const model: Model = new Model();
        model.name = file.name;
        model.type = this.getFileType(file);
        model.path = path.relative(process.cwd(), file.path).replace(/\\/g, "/");
        if (parent.name) {
            model.parent = parent;
        }
        await this.addIndexToDB(model);
        if (model.type === 1) {
            await this.buildIndexFromBO(model.path, model);
        }
        const queue = file.children;
        while (queue.length > 0) {
            const tmp = queue.shift();
            await this.buildIndex(tmp, model);
        }
    }

    public async updateIndex(fileQueue: IFileWatches[]) {
        // need recheck
        fileQueue.sort((a, b) => {
            return a.filePath.length - b.filePath.length;
        })
        const parent = this.getCommonParent(fileQueue);
        const model = await getTreeRepository(Model).findOne({ path: parent.filePath });
        const exists = model ? 1 : 0;
        if (exists) {
            await this.unlinkIndex(parent);
            await this.addIndex(parent);
        } else {
            await this.addIndex(parent);
        }
        // const res: any = new Object();
        // for (const item of fileQueue) {
        //     if (item.event === FileEvent.Change && item.filePath.match(/.bo$/)) {
        //         res[item.filePath] = item.event;
        //     } else {
        //         res[item.filePath] = item.event;
        //     }
        // }
        // const filewatches: IFileWatches[] = Object.keys(res).map(key => {
        //     return { filePath: key, event: res[key] } as IFileWatches;
        // });
        // for (const item of filewatches) {
        //     const model = await getTreeRepository(Model).findOne({ path: item.filePath });
        //     const exists = model ? 1 : 0;
        //     switch (item.event) {
        //         case FileEvent.Add || FileEvent.AddDir:
        //             if (exists) {
        //                 await this.unlinkIndex(item);
        //             }
        //             await this.addIndex(item);
        //             break;
        //         case FileEvent.Unlink || FileEvent.UnlinkDir:
        //             if (exists) {
        //                 await this.unlinkIndex(item);
        //             }
        //             break;
        //         case FileEvent.Change:
        //             break;
        //     }
        // }
    }
    public async addIndex(item: IFileWatches) {
        const parentPath = path.relative(process.cwd(), path.join(item.filePath, "..")).replace(/\\/g, "/");;
        const parent = await getManager()
            .getTreeRepository(Model)
            .findOne({ path: parentPath });
        let file: File;
        if (item.event === FileEvent.Add) {
            file = this.fileService.readFile(item.filePath);
        } else {
            file = await this.fileService.readDirectory(item.filePath);
        }
        await this.buildIndex(file, parent);
    }

    public async unlinkIndex(fileQueue: IFileWatches) {
        // unlink file dir or file
        const repository = getRepository(Model);

        const absPath = path.relative(process.cwd(), fileQueue.filePath).replace(/\\/g, "/");
        if (fileQueue.event === "unlink") {
            const targetRootModel = await getTreeRepository(Model).findOne({ path: absPath });
            const targetModels = await getTreeRepository(Model).findDescendants(targetRootModel);
            await this.unlinkIndexFromDB(targetModels);
        }
    }

    public async unlinkIndexFromDB(targetModels: Model[]): Promise<void> {
        if (targetModels.length !== 0) {
            logger.emitInfo("IndexDBService:UnlinkIndex", targetModels.length + " line(s) data will be unlinked");
            try {
                targetModels.forEach(async targetModel => {
                    // detele from model_closure firstly
                    await getConnection()
                        .createQueryBuilder()
                        .delete()
                        .from("model_closure")
                        .where("id_descendant = :id", { id: targetModel.id })
                        .execute();
                    // update the parentId to Null
                    await getConnection()
                        .createQueryBuilder()
                        .update("model")
                        .set({ parent: null })
                        .where("id = :id", { id: targetModel.id })
                        .execute();
                    // delete from model table
                    await getConnection()
                        .createQueryBuilder()
                        .delete()
                        .from("model")
                        .where("id = :id", { id: targetModel.id })
                        .execute();
                });
                logger.emitInfo("IndexDBService:UnlinkIndex", targetModels.length + " line(s) data has been unlinked");
            } catch (err) {
                logger.emitError("IndexDBService:UnlinkIndex", err);
            }
        }
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
            case ".bo":
                return 1;
            case ".json":
                return 99;
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

    private getCommonParent(fileQueue: IFileWatches[]) {
        const commonParent = fileQueue[0].filePath;
        const regx = new RegExp('^' + commonParent)
        for (const item of fileQueue) {
            if (!item.filePath.match(regx)) {
                return { filePath: path.join(commonParent, ".."), event: FileEvent.AddDir };
            }
        }
        return fileQueue[0];
    }
}
