import { IIndexService } from "../IndexService";
import { injectable, inject } from "inversify";
import { TYPES } from "../../bootstrap/types";
import { IFileService } from "../../filesystem/IFileService";
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
            const queue: File[] = [];
            let stack: File[] = [];
            let file = await this.fileService.readDirectory(rootPath);

            queue.push(file);
            let parent: Model = {} as Model;
            let child: Model = {} as Model;
            // parent.parent = "";

            while (queue.length > 0) {
                file = queue.shift();
                child = new Model();
                child.name = file.name;
                child.filePath = path.relative(process.cwd(), file.path);
                child.type = await this.getFileType(file);
                if (parent.name) {
                    child.parent = parent;
                }
                await this.addIndexToDB(child);
                stack = file.children;
                parent = child;
                while (stack.length > 0) {
                    file = stack.pop();
                    if (file.isDir) {
                        queue.push(file);
                    } else {
                        child = new Model();
                        child.name = file.name;
                        child.filePath = path.relative(process.cwd(), file.path);
                        child.type = await this.getFileType(file);
                        child.parent = parent;
                        await this.addIndexToDB(child);
                        if (child.type === 1) {
                            this.addBoIndex(child);
                        }
                    }
                }
            }
        } catch (err) {
            logger.emitInfo("IndexDBService:initIndexRepository", err);
        }
        return;
    }

    public async updateIndex() {
        return;
    }

    public async addIndexToDB(model: Model): Promise<Model> {
        const manger = getManager();
        return manger.save(model);
    }

    public async addBoIndex(model: Model) {
        const bo = JSON.parse(await this.fileService.readFileContent(model.filePath));
        const nodes = bo.Nodes;
    }
    private async getFileType(file: File) {
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
                const isBo = await this.isBo(file);
                if (isBo) {
                    return 1;
                }
                return 99;
            default:
                return 99;
        }
    }
    private async isBo(file: File) {
        const bo = JSON.parse(await this.fileService.readFileContent(file.path));
        if (bo.NameKey && bo.Nodes) {
            return true
        }
        return false;
    }
}
