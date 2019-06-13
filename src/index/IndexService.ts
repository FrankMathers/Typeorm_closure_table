import { IFileWatches } from "../filesystem/IFileService"
export interface IIndexService {
    initIndexRepository(): Promise<void>;

    buildIndexFromFile(rootPath: string): Promise<void>;

    updateIndex(fileQueue: IFileWatches[]): Promise<void>;

}