import { Timestamp } from "typeorm";
export const enum ModelType {
    BusinessObject = 1,
    UIComponent = 2,
    Folder = 3,
    Other = 99
}

export interface IModel {
    id: string;
    name: string;
    type: ModelType;
    filePath: string;
    children: IModel[];
    parent: IModel;
    CreatedAt: Timestamp;
    UpdatedAt: Timestamp;
    content?: string;
}
