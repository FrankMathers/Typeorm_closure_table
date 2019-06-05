import { inject } from "inversify";
import { TYPES } from "./types";
import { injectable } from 'inversify';
import { IFileService } from "../filesystem/IFileService";
import { IIndexService } from "../index/IndexService";
import { Options } from "./Options"
import logger from "../log/LogUtility"
import { Severity } from "../log/LogService";

@injectable()
export class DesignTimeService {

    @inject(TYPES.FileService) private fileService: IFileService;

    @inject(TYPES.IndexService) private indexService: IIndexService;

    public async start(rootPath: string, options: Options): Promise<void> {

        // Set log level
        logger.setLogLevel(options.logLevel ? options.logLevel : Severity.Error);

        logger.emitInfo("DesignTimeService:start", "Start initialization");

        // Init Index Repository
        await this.indexService.initIndexRepository();

        // Build index from File Repository
        this.indexService.buildIndexFromFile(rootPath);

        // Watch File Repository
        this.fileService.watchFileRepository(rootPath);

        // Init Restful API via express
        this.fileService.readDirectory(rootPath);
    }
}