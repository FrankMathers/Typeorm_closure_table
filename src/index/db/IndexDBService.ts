import { IIndexService } from "../IndexService";
import { injectable, inject } from "inversify";
import { TYPES } from "../../bootstrap/types";
import { IFileService } from "../../filesystem/IFileService";
import { File } from "../../filesystem/File";
import * as sqlite from 'sqlite3';
import { ConnectionOptions, createConnection, getManager } from "typeorm";
import { Artifact } from './entity/artifact';


@injectable()
export class IndexDBService implements IIndexService {

    @inject(TYPES.FileService) public fileService: IFileService;

    public async initIndexRepository(): Promise<void> {
        // Init DB files and etc
        // delete db files
        // const db = new sqlite.Database('dts.sqlite3');
        const options: ConnectionOptions = {
            type: "sqlite",
            database: `./dts.sqlite3`,
            entities: [Artifact],
            synchronize: true,
            logging: ["query", "error", "schema", "log", "warn", "info"]
        }
        const connection = await createConnection(options);
        return;
    }

    public async buildIndexFromFile(rootPath: string): Promise<void> {
        try {
            const manger = getManager();
            const artifact: Artifact = {} as Artifact;
            const queue: File[] = [];
            let stack: File[] = [];
            let file = await this.fileService.readDirectory(rootPath);

            queue.push(file);
            let parent: Artifact = {} as Artifact;
            let child: Artifact = {} as Artifact;
            // parent.parent = "";

            while (queue) {
                file = queue.shift();

                child.label = file.name;
                child.filePath = file.path;
                child.type = this.getFileType(file);
                if (parent.label) {
                    child.parent = parent;
                }
                await this.addIndexToDB(child);
                stack = file.children;
                parent = child;
                child = {} as Artifact;
                while (stack) {
                    file = stack.pop();
                    if (file.isDir) {
                        queue.push(file);
                    } else {
                        child.label = file.name;
                        child.filePath = file.path;
                        child.type = this.getFileType(file);
                        child.parent = parent;
                        await this.addIndexToDB(child);
                    }
                }

            }

        }
        catch (err) {
            console.log(err);
        }
        return;
    }

    public async addIndexToDB(artifact: Artifact): Promise<Artifact> {
        const manger = getManager();
        return manger.save(artifact);
    }

    private getFileType(file: File) {
        if (!file.type) {
            return 99;
        }
        switch (file.type.toLocaleLowerCase()) {
            case "ui":
                return 1;
            case "json":
                return 0;
            default:
                return 99;
        }
    }
}