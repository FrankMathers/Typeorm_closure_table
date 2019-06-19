import { BoNode } from "./BoNode";
import { IBoParser } from "./IBoParser";
import { injectable } from "inversify";
import fs from "fs";
import path from "path";
import logger from "../../log/LogService";
@injectable()
export class BoParser implements IBoParser {
    public async parseBo(rootNode: any, Nodepath: string, parentNode?: BoNode): Promise<BoNode> {
        if (rootNode) {
            logger.emitInfo("BoParser:ParseBo", "start to read Node " + rootNode.Key.Name);

            let parent: BoNode;

            // Init parent Node object
            // the path is the Json path
            if (parentNode == null) {
                parent = new BoNode();
                parent.isNode = true;
                parent.boNamespace = rootNode.Key.BONamespace;
                parent.boName = rootNode.Key.BOName;
                parent.path = Nodepath;
                parent.type = "Node";
                parent.name = "Root";
            } else {
                parent = parentNode;
            }

            // get all elemnets and nodes
            const result: any[] = [];

            let elementNum = 0;
            if (rootNode.Elements) {
                elementNum = rootNode.Elements.length;
                rootNode.Elements.forEach((element: any) => {
                    result.push(element);
                });
            }
            if (rootNode.Nodes) {
                rootNode.Nodes.forEach((node: any) => {
                    result.push(node);
                });
            }
            let count = 0;
            for (const singleElementNode of result) {
                // Build Node entry from node list
                count++;
                const nodeName = singleElementNode.Key.Name;

                // For testing purpose
                BoNode.count += 1;

                const NodeEntry = new BoNode();
                NodeEntry.name = nodeName;
                NodeEntry.boNamespace = singleElementNode.Key.BONamespace;
                NodeEntry.boName = singleElementNode.Key.BOName;

                if (count <= elementNum) {
                    logger.emitDebug("BoParser:ParseBo", "start to read element " + nodeName);
                    const elementIndex = count - 1;
                    NodeEntry.path = `${Nodepath}.Elements[${elementIndex}]`;
                    NodeEntry.parentPath = `${Nodepath}.Elements`;
                    NodeEntry.isNode = false;
                    NodeEntry.type = "Element";
                } else {
                    logger.emitDebug("BoParser:ParseBo", "start to read subNode " + nodeName);
                    const nodeIndex = count - (elementNum + 1);
                    NodeEntry.path = `${Nodepath}.Nodes[${nodeIndex}]`;
                    NodeEntry.parentPath = `${Nodepath}.Nodes`;
                    NodeEntry.isNode = true;
                    NodeEntry.type = "Node";
                }

                parent.children.push(NodeEntry);

                // Read sub node recursively
                if (NodeEntry.isNode === true) {
                    await this.parseBo(singleElementNode, NodeEntry.path, NodeEntry);
                }
            }

            logger.emitDebug("BoParser:ParseBo", "end of Parse Node/Elements and count: " + BoNode.count);

            return parent;
        }
    }
}
