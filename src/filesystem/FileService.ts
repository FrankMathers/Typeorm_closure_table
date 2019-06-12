import { IFileService } from './IFileService'
import { injectable } from 'inversify';
import fs from "fs"
import path from "path"
import { File } from './File';
import { IgnoreRule } from './IgnoreRule';
import logger from "../log/LogService"
import { FileEmitter, FileEvent } from './FileEmitter';

@injectable()
export class FileService implements IFileService {

    public async watchFileRepository(rootPath: string, fileEmitter: FileEmitter): Promise<void> {
        fs.watch(rootPath, { persistent: true, recursive: true }, (eventType, filename) => {
            fileEmitter.emit(FileEvent.Change, filename);
        });
    }

    public async readFileContent(filePath: string): Promise<string> {
        const fsPromise = fs.promises;
        const result = await fsPromise.readFile(filePath);
        return result.toString();
    }

    public async readDirectory(dirPath: string, parentFile?: File): Promise<File> {

        logger.emitInfo("FileService:readDirectory", "start to read directory " + dirPath);

        let parent: File;

        // Init parent file object
        if (parentFile == null) {
            parent = new File();
            parent.isDir = true;
            parent.path = dirPath;
            parent.name = "root";
        } else {
            parent = parentFile;
        }

        const fsPromise = fs.promises;
        const result = await fsPromise.readdir(dirPath);

        // Build ignore rules
        const ignoreRule = await this.buildIgnoreRule(parent, result);

        for (const singleFile of result) {

            // Build file entry from file
            logger.emitDebug("FileService:readDirectory", "start to read file " + singleFile);

            // Check if current file should be ignored
            if (this.matchIgnoreRule(singleFile, ignoreRule) === true) {
                continue;
            }

            // For testing purpose
            File.count += 1;
            // Check if current directory/folder matches .gitignore rule
            const fileEntry = new File();
            fileEntry.name = singleFile;
            fileEntry.path = dirPath + path.sep + singleFile;
            fileEntry.parentPath = dirPath;
            const stat = await fsPromise.stat(fileEntry.path);
            fileEntry.isDir = stat.isDirectory();
            if (fileEntry.isDir === false) {
                fileEntry.type = path.extname(fileEntry.path);
            }

            parent.children.push(fileEntry);

            // Read sub folder recursively
            if (fileEntry.isDir === true) {
                await this.readDirectory(fileEntry.path, fileEntry);
            }
        }

        logger.emitDebug("FileService:readDirectory", "end of reading file and count: " + File.count);

        return parent;
    }

    public async deleteFile(filePath: string) {
        const fsPromise = fs.promises;
        await fsPromise.unlink(filePath);
        return;
    }

    private async buildIgnoreRule(parent: File, result: string[]): Promise<IgnoreRule> {
        const ignoreRule: IgnoreRule = new IgnoreRule();
        return ignoreRule;
    }

    private matchIgnoreRule(singleFile: string, ignoreRule: IgnoreRule): boolean {
        // First hard code the ignore rules instead of read it from .gitignore danamically
        if (singleFile === "node_modules" || singleFile === "dist" || singleFile === ".git") {
            return true;
        } else {
            return false;
        }
    }
}