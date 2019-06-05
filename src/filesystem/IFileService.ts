import { File } from './File';

export interface IFileService {
    watchFileRepository(rootPath: string): Promise<void>;
    readFileContent(path: string): Promise<string>;
    readDirectory(path: string, parentFile?: File): Promise<File>;
}