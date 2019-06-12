import { File } from './File';
import { FileEmitter } from './FileEmitter';

export interface IFileService {
    watchFileRepository(rootPath: string, fileEmitter: FileEmitter): Promise<void>;
    readFileContent(path: string): Promise<string>;
    readDirectory(path: string, parentFile?: File): Promise<File>;
    deleteFile(path: string): Promise<void>;
}