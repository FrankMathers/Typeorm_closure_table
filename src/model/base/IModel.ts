export const enum ModelType {
    BusinessObject = 1,
    UIComponent = 2,
    Folder = 3,
    Other = 99
}

export interface IModel {
    id: string;
    name: string;
    type: string;
    path: string;
    content: string;
    parent: IModel;
    children: IModel[];
}