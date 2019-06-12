import { inject } from "inversify";
import { TYPES } from "./types";
import { injectable } from 'inversify';
import { IFileService } from "../filesystem/IFileService";
import { IIndexService } from "../index/IndexService";
import { Options } from "./Options"
import { Severity } from "../log/LogService";
import logger from "../log/LogService";
import { IAPIService } from "../api/IAPIService";
import express from 'express'
import { FileEmitter, FileEvent } from "../filesystem/FileEmitter";

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

        // Init Index Repository
        await this.indexService.initIndexRepository();

        // Build index from File Repository
        await this.indexService.buildIndexFromFile(options.rootPath);

        // Init Restful API via express
        await this.apiService.start(options);

        // Init File Watch functionality
        this.initFileWatcher(options);

        logger.emitInfo("DesignTimeService:start", "End initialization");
    }

    public getExpressInstace(): express.Express {
        return this.apiService.app;
    }

    private initFileWatcher(options: Options) {

        let fileQueue: string[] = [];
        this.fileEmitter = new FileEmitter();

        // Add the event handler
        this.fileEmitter.on(FileEvent.Change, (fileName) => {
            fileQueue.push(fileName);
            const eventLength = fileQueue.length;
            // Delay the actual index logic by 1000 ms and call index service if no new event happens during this period
            logger.emitDebug("DesignTimeService:initFileWatcher", "Receive event from file system");
            setTimeout(() => {
                if (fileQueue.length === eventLength) {
                    logger.emitDebug("DesignTimeService:initFileWatcher", "No new file event happens, call index API");
                    this.indexService.updateIndex(fileQueue);
                    fileQueue = [];
                } else {
                    logger.emitDebug("DesignTimeService:initFileWatcher", "New file event happens");
                }
            }, 1000);
        });

        // Watch File Repository
        this.fileService.watchFileRepository(options.rootPath, this.fileEmitter);
    }
}