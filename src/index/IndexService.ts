import { Model } from "./db/entities/Model";
import { IFileWatches } from "../filesystem/IFileService";
export interface IIndexService {
    initIndexRepository(): Promise<void>;

    buildIndexFromFile(rootPath: string): Promise<void>;

    buildIndexFromBO(jsonFilePath: string, nodeParent: Model): Promise<void>;

    updateIndex(fileQueue: IFileWatches[]): Promise<void>;
}
