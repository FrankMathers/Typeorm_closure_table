import { inject } from "inversify";
import { TYPES } from "./types";
import { injectable } from "inversify";
import { IFileService } from "../filesystem/IFileService";
import { IIndexService } from "../index/IndexService";
import { Options } from "./Options";
import { Severity } from "../log/LogService";
import logger from "../log/LogService";
import { IAPIService } from "../api/IAPIService";
import express from "express";
import { FileEmitter, FileEvent } from "../filesystem/FileEmitter";
import { IFileWatches } from "../filesystem/IFileService";

const fileQueue: IFileWatches[] = [];
let fileCount = fileQueue.length;
let delayTime = 1000;

@injectable()
export class DesignTimeService {
    @inject(TYPES.FileService) private fileService: IFileService;

    @inject(TYPES.IndexService) private indexService: IIndexService;

    @inject(TYPES.APIService) private apiService: IAPIService;

    private fileEmitter: FileEmitter;

    public async start(options: Options): Promise<void> {
        // Set log level
        logger.setLogLevel(options.logLevel ? options.logLevel : Severity.Error);

        logger.emitInfo("DesignTimeService:start", "Start initialization");

        this.initFileWatcher(options);

        // Init Index Repository
        await this.indexService.initIndexRepository();

        // Build index from File Repository
        await this.indexService.buildIndexFromFile(options.rootPath);

        // Init Restful API via express
        await this.apiService.start(options);

        // Init File Watch functionality

        logger.emitInfo("DesignTimeService:start", "End initialization");
    }

    public getExpressInstace(): express.Express {
        return this.apiService.app;
    }

    private initFileWatcher(options: Options) {
        this.fileEmitter = new FileEmitter();
        logger.emitInfo("DesignTimeService:start", "End initialization");
        // Add the event handler
        this.fileEmitter.on(FileEvent.Add, file => {
            this.updateIndex(FileEvent.Add, file);
        });

        // Watch File Repository
        this.fileService.watchFileRepository(options.rootPath, this.fileEmitter);
    }

    private async updateIndex(event: FileEvent, file: string) {
        delayTime = delayTime + 1000;
        fileQueue.push({ filePath: "13", event: FileEvent.Add });
        const count = fileQueue.length;
        fileCount = fileQueue.length;
        setTimeout(async () => {
            delayTime = 0;
            if (delayTime === 0 && count === fileCount) {
                await this.indexService.updateIndex(fileQueue);
            }
        }, 10000);
    }
}
