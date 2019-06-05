import { Container } from 'inversify';
import { FileService } from '../filesystem/FileService'
import { TYPES } from './types'
import { IFileService } from '../filesystem/IFileService'
import { IIndexService } from '../index/IndexService'
import { IndexDBService } from '../index/db/IndexDBService';

const DIContainer = new Container();
// File Service
DIContainer.bind(FileService).toSelf().inSingletonScope();
DIContainer.bind<IFileService>(TYPES.FileService).toService(FileService);

// Index Service
DIContainer.bind(IndexDBService).toSelf().inSingletonScope();
DIContainer.bind<IIndexService>(TYPES.IndexService).toService(IndexDBService);

// Log Service
// DIContainer.bind(LogServiceImpl).toSelf().inSingletonScope();
// DIContainer.bind<ILogService>(TYPES.LogService).toService(LogServiceImpl);

export default DIContainer;