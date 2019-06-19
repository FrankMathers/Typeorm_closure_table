import * as express from "express";
import { interfaces, controller, httpGet, httpDelete, request, response } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { IModelManager } from "../../model/IModelManager";
import { INodeQuery, IContentQuery } from "../../model/base/IModelQuery";
import { TYPES } from "../../bootstrap/types";
import { IModel, ModelType } from "../../model/base/IModel";
import { Any } from "typeorm";
import { NodeModel } from "./NodeModel";

@controller("/v1/models/nodes")
export class NodeController implements interfaces.Controller {
    @inject(TYPES.ModelManager) private modelManager: IModelManager;

    @httpGet("(/)?*")
    private async getRoot(@request() req: express.Request, @response() res: express.Response) {
        const query = this.getQueryInfo(req);
        const querycollections = await this.modelManager.getNodes(query);

        // tslint:disable-next-line: prefer-const
        const result: NodeModel[] = [];
        querycollections.forEach(element => {
            const temp: NodeModel = new NodeModel();
            temp.expandable = true;
            temp.id = element.id;
            temp.name = element.name;
            temp.namespace = element.namespace;
            temp.type = element.type;
            temp.path = element.path;
            temp.CreatedAt = element.CreatedAt;
            temp.UpdatedAt = element.UpdatedAt;
            if (temp.type === ModelType.Other) {
                temp.expandable = false;
            }
            result.push(temp);
        });

        res.send(result);
        return;
    }

    private getQueryInfo(req: express.Request): INodeQuery {
        let path: string;
        if (req.params[1]) {
            path = req.path.replace("/v1/models/nodes/", "").replace("%20", " ");
        } else {
            path = "";
        }
        const query: INodeQuery = {
            path,
            type: req.query.type,
            depth: req.query.depth,
            offset: req.query.offset,
            limit: req.query.limit
        };
        console.log(query);
        console.log(path);
        return query;
    }
}
