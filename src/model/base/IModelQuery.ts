import { ModelType } from "./IModel";
export interface INodeQuery {
    path: string;
    type?: ModelType;
    depth?: number;
    offset?: number;
    limit?: number;
}

export interface IContentQuery {
    path: string;
    content?: string;
}
