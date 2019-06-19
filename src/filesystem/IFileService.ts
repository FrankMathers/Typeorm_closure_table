import { File } from "./File";
import { FileEmitter, FileEvent } from "./FileEmitter";

export interface IFileService {
    watchFileRepository(rootPath: string, fileEmitter: FileEmitter): Promise<void>;
    readFileContent(path: string): Promise<string>;
    readFile(path: string): File;
    readDirectory(path: string, parentFile?: File): Promise<File>;
    writeFileContent(path: string, content: string): Promise<string>;
    deleteFile(path: string): Promise<void>;
    deleteDirectory(path: string): Promise<void>;
}

export interface IFileWatches {
    filePath: string;
    event: FileEvent;
}
