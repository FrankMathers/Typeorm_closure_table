export interface IIndexService {
    initIndexRepository(): Promise<void>;

    buildIndexFromFile(rootPath: string): Promise<void>;

}