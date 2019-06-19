import * as express from "express";
import { interfaces, controller, httpGet, httpPut } from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { TYPES } from "../../bootstrap/types";
import { IModelManager } from "../../model/IModelManager";
import { IContentQuery } from "../../model/base/IModelQuery";
import { IModel } from "../../model/base/IModel";
import fs = require("fs");

@controller("/v1/models/contents")
export class ContentController implements interfaces.Controller {
    @inject(TYPES.ModelManager) private modelManager: IModelManager;

    @httpGet("/*")
    private async get(req: express.Request, res: express.Response): Promise<IModel> {
        const url = req.url.replace("/v1/models/contents/", "");

        const query: IContentQuery = { path: url, content: "" };

        try {
            return await this.modelManager.getContent(query);
        } catch (error) {
            const errorjson = { code: "500", message: error.message };
            res.status(500)
                .json(errorjson)
                .send();
        }
    }

    @httpPut("/*")
    private async put(req: express.Request, res: express.Response): Promise<void> {
        const url = req.url.replace("/v1/models/contents/", "");

        if (!req.body.content) {
            const errorjson = { code: "500", message: "Should pass parameter:content in the body!" };
            res.status(500)
                .json(errorjson)
                .send();
            return;
        }

        const query: IContentQuery = { path: url, content: req.body.content };

        try {
            await this.modelManager.putContent(query);
            return;
        } catch (error) {
            const errorjson = { code: "500", message: error.message };
            res.status(500)
                .json(errorjson)
                .send();
        }
    }
}
