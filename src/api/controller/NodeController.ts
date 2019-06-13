import * as express from "express";
import { interfaces, controller, httpGet, httpDelete, request, response, TYPE } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { IModelManager } from "../../model/IModelManager";
import { INodeQuery, IContentQuery } from "../../model/base/IModelQuery";
import { TYPES } from "../../bootstrap/types";

@controller("/v1/models/nodes")
export class NodeController implements interfaces.Controller {
    @inject(TYPES.ModelManager) private modelManager: IModelManager;

    @httpGet("(/)?*")
    public async getRoot(@request() req: express.Request, @response() res: express.Response) {
        let path: string;
        if (req.params[1]) {
            path = req.path.replace("/v1/models/nodes/", "");
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
        const result = await this.modelManager.getNodes(query);
        return;
    }

    // @httpGet("/*")
    // public getNodes(@request() req: express.Request, @response() res: express.Response): string {
    //     console.log("req");
    //     return;
    // }

    @httpDelete("(/)?(*)")
    public deleteNodes(@request() req: express.Request, @response() res: express.Response): Promise<void> {
        return;
    }
}
