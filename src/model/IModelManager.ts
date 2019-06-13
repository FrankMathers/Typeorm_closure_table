import { IModel } from "./base/IModel";
import { INodeQuery, IContentQuery } from "./base/IModelQuery";
export interface IModelManager {
    getNodes(query: INodeQuery): Promise<IModel[]>;
    deleteNodes(query: INodeQuery): Promise<IModel>;
    getContent(query: IContentQuery): Promise<IModel>;
    putContent(query: IContentQuery): Promise<IModel>;
}
