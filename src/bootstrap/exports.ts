import "reflect-metadata"
import DIContainer from "./Container";
import { Options } from "./Options";
import { FileService } from '../filesystem/FileService'
import { TYPES } from './types'
import { IFileService } from '../filesystem/IFileService'
import { IIndexService } from '../index/IndexService'
import { IndexDBService } from '../index/db/IndexDBService';
import { DesignTimeService } from './DesignTimeService';
import { APIService } from '../api/APIService';
import { IAPIService } from '../api/IAPIService';

// Init DI Container
// File Service
DIContainer.bind(FileService).toSelf().inSingletonScope();
DIContainer.bind<IFileService>(TYPES.FileService).toService(FileService);

// Index Service
DIContainer.bind(IndexDBService).toSelf().inSingletonScope();
DIContainer.bind<IIndexService>(TYPES.IndexService).toService(IndexDBService);

// API Service
DIContainer.bind(APIService).toSelf().inSingletonScope();
DIContainer.bind<IAPIService>(TYPES.APIService).toService(APIService);

// Design Time Service
DIContainer.bind(DesignTimeService).toSelf().inSingletonScope();

const dtsInstance: DesignTimeService = DIContainer.resolve<DesignTimeService>(DesignTimeService);

export {
  DIContainer,
  dtsInstance,
  Options
}