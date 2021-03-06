import "reflect-metadata";
import DIContainer from "./Container";
import { Options } from "./Options";
import { FileService } from "../filesystem/FileService";
import { TYPES } from "./types";
import { IFileService } from "../filesystem/IFileService";
import { IIndexService } from "../index/IndexService";
import { IndexDBService } from "../index/db/IndexDBService";
import { DesignTimeService } from "./DesignTimeService";
import { APIService } from "../api/APIService";
import { IAPIService } from "../api/IAPIService";
import { IModelManager } from "../model/IModelManager";
import { ModelManager } from "../model/ModelManager";
import { IBoParser } from "../index/BoIndexutil/IBoParser";
import { BoParser } from "../index/BoIndexutil/BoParser";
// Init DI Container
// File Service
DIContainer.bind(FileService)
    .toSelf()
    .inSingletonScope();
DIContainer.bind<IFileService>(TYPES.FileService).toService(FileService);

// Index Service
DIContainer.bind(IndexDBService)
    .toSelf()
    .inSingletonScope();
DIContainer.bind<IIndexService>(TYPES.IndexService).toService(IndexDBService);

// API Service
DIContainer.bind(APIService)
    .toSelf()
    .inSingletonScope();
DIContainer.bind<IAPIService>(TYPES.APIService).toService(APIService);

// Bo Parser
DIContainer.bind(BoParser)
    .toSelf()
    .inSingletonScope();
DIContainer.bind<IBoParser>(TYPES.BoParser).toService(BoParser);

DIContainer.bind(ModelManager)
    .toSelf()
    .inSingletonScope();
DIContainer.bind<IModelManager>(TYPES.ModelManager).toService(ModelManager);

// Design Time Service
DIContainer.bind(DesignTimeService)
    .toSelf()
    .inSingletonScope();

const dtsInstance: DesignTimeService = DIContainer.resolve<DesignTimeService>(DesignTimeService);

export { DIContainer, dtsInstance, Options };
