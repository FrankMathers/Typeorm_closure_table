import { BoNode } from "./BoNode";

export interface IBoParser {
    parseBo(rootNode: any, Nodepath: string, parentNode?: BoNode): Promise<BoNode>;
}
