import { Model } from "./db/entities/Model";
import { IFileWatches } from "../filesystem/IFileService";
export interface IIndexService {
    initIndexRepository(): Promise<void>;

    buildIndexFromFile(rootPath: string): Promise<void>;

    buildIndexFromBO(boFilePath: string, nodeParent: Model): Promise<void>;

    updateIndex(fileQueue: IFileWatches[]): Promise<void>;
    unlinkIndex(fileQueue: IFileWatches): Promise<void>;
}
