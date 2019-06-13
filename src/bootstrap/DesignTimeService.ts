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
import { FILE } from "dns";

interface iFile {
    filePath: string;
    action: FileEvent;
}
@injectable()
export class DesignTimeService {
    @inject(TYPES.FileService) private fileService: IFileService;

    @inject(TYPES.IndexService) private indexService: IIndexService;

    @inject(TYPES.APIService) private apiService: IAPIService;

    private fileEmitter: FileEmitter;

    private delayTime: number = 1000;

    private fileQueue: iFile[] = [];
    public async start(options: Options): Promise<void> {
        // Set log level
        logger.setLogLevel(options.logLevel ? options.logLevel : Severity.Error);

        logger.emitInfo("DesignTimeService:start", "Start initialization");

        // Init Index Repository
        await this.indexService.initIndexRepository();

        this.initFileWatcher(options);

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

        // Add the event handler
        this.fileEmitter.on(FileEvent.Add, fileName => this.updateIndex(FileEvent.Add, fileName));

        // Watch File Repository
        this.fileService.watchFileRepository(options.rootPath, this.fileEmitter);
    }

    private async updateIndex(event: FileEvent, file: string) {
        // await this.indexService.updateIndex(fileQueue);
        if (this.delayTime > 0) {
            this.fileQueue.push({ filePath: file, action: event });
        } else {
        }
        console.log(file + " " + event);
    }
    private delay(fn: any, delay: number) {
        let timer: any = null;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(context, args), delay);
        };
    }
}
