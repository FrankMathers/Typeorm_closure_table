import { IIndexService } from "../IndexService";
import { injectable, inject } from "inversify";
import { TYPES } from "../../bootstrap/types";
import { IFileWatches, IFileService } from "../../filesystem/IFileService";
import { File } from "../../filesystem/File";
import * as sqlite from "sqlite3";
import { createConnection, getManager } from "typeorm";
import * as path from "path";
import { Model } from "./entities/Model";
import logger from "../../log/LogService";

@injectable()
export class IndexDBService implements IIndexService {
    @inject(TYPES.FileService) public fileService: IFileService;

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
        await createConnection();
        return;
    }

    public async buildIndexFromFile(rootPath: string): Promise<void> {
        try {
            const file = await this.fileService.readDirectory(rootPath);
            const model: Model = {} as Model;
            await this.buildIndex(file, model);
            console.log(123);
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
        const queue = file.children;
        while (queue.length > 0) {
            const tmp = queue.shift();
            await this.buildIndex(tmp, model);
        }
    }

    public async updateIndex(fileQueue: IFileWatches[]) {
        fileQueue.sort((a, b) => {
            return a.filePath.length - b.filePath.length;
        })
        const manager = getManager();
        // const models = await manager.getTreeRepository(Model).findRoots();
        await manager.createQueryBuilder().delete().from("model_closure").execute();
        await manager.createQueryBuilder().delete().from("model").execute();
        await this.buildIndexFromFile(process.cwd());
        return;
    }

    public async addIndexToDB(model: Model): Promise<Model> {
        const manger = getManager();
        return manger.save(model);
    }

    private getFileType(file: File) {
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
}
