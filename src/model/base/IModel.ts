import { BoNode } from "./../../index/BoIndexutil/BoNode";
import { Timestamp } from "typeorm";
export const enum ModelType {
    BusinessObject = 1,
    UIComponent = 2,
    Folder = 3,
    BoNode = 4,
    BoElement = 5,
    Other = 99
}

export interface IModel {
    id: string;
    name: string;
    namespace: string;
    type: ModelType;
    path: string;
    children: IModel[];
    parent: IModel;
    CreatedAt: Timestamp;
    UpdatedAt: Timestamp;
    content?: string;
}
